"""
Unified LLM client supporting both providers:
  - OpenRouter (sk-or-v1-...)  via openai SDK  → Authorization: Bearer
  - Anthropic direct (sk-ant-...) via anthropic SDK → x-api-key
OPENROUTER_API_KEY takes priority when both are set.
"""
import json
import base64
from typing import Any, Callable, Awaitable
from app.core.config import settings

HAIKU  = "claude-haiku-4-5"
SONNET = "claude-sonnet-4-6"

_OR_MODELS = {
    HAIKU:  "anthropic/claude-haiku-4-5",
    SONNET: "anthropic/claude-sonnet-4-6",
}

def _use_or() -> bool:
    return bool(settings.openrouter_api_key)

def _m(name: str) -> str:
    return _OR_MODELS.get(name, f"anthropic/{name}") if _use_or() else name


# ── Simple text completion ────────────────────────────────────────────────────

async def chat(
    prompt: str,
    model: str = HAIKU,
    max_tokens: int = 512,
    system: str | None = None,
) -> str:
    if _use_or():
        from openai import AsyncOpenAI, AuthenticationError
        c = AsyncOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1")
        msgs: list[dict] = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": prompt})
        try:
            r = await c.chat.completions.create(model=_m(model), messages=msgs, max_tokens=max_tokens)
        except AuthenticationError:
            raise ValueError("OpenRouter API key is invalid or expired. Please update OPENROUTER_API_KEY in your .env file and restart the backend. Get a new key at https://openrouter.ai/keys")
        return r.choices[0].message.content or ""
    else:
        import anthropic
        c = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        kw: dict[str, Any] = {"model": model, "max_tokens": max_tokens, "messages": [{"role": "user", "content": prompt}]}
        if system:
            kw["system"] = system
        msg = await c.messages.create(**kw)
        return msg.content[0].text


# ── Vision completion ─────────────────────────────────────────────────────────

async def chat_vision(
    prompt: str,
    image_bytes: bytes,
    media_type: str,
    model: str = HAIKU,
    max_tokens: int = 256,
) -> str:
    b64 = base64.standard_b64encode(image_bytes).decode()
    if _use_or():
        from openai import AsyncOpenAI
        c = AsyncOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1")
        r = await c.chat.completions.create(
            model=_m(model),
            messages=[{"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
                {"type": "text", "text": prompt},
            ]}],
            max_tokens=max_tokens,
        )
        return r.choices[0].message.content or ""
    else:
        import anthropic
        c = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        msg = await c.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                {"type": "text", "text": prompt},
            ]}],
        )
        return msg.content[0].text


# ── Agentic tool-use loop ─────────────────────────────────────────────────────
# tools format (OpenAI): [{"type":"function","function":{"name":...,"description":...,"parameters":{...}}}]

async def agentic_loop(
    user_message: str,
    tools: list[dict],
    tool_executor: Callable[[str, dict], Awaitable[str]],
    model: str = SONNET,
    system: str | None = None,
) -> str:
    """Run until the model stops calling tools. Returns final text response."""
    if _use_or():
        return await _or_loop(user_message, tools, tool_executor, model, system)
    else:
        return await _ant_loop(user_message, tools, tool_executor, model, system)


async def _or_loop(
    user_message: str,
    tools: list[dict],
    tool_executor: Callable[[str, dict], Awaitable[str]],
    model: str,
    system: str | None,
) -> str:
    from openai import AsyncOpenAI
    c = AsyncOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1")
    messages: list[dict] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": user_message})

    for _ in range(8):  # max iterations
        r = await c.chat.completions.create(model=_m(model), messages=messages, tools=tools, tool_choice="auto", max_tokens=1024)
        choice = r.choices[0]
        msg = choice.message
        messages.append({"role": "assistant", "content": msg.content, "tool_calls": [
            {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
            for tc in (msg.tool_calls or [])
        ]})

        if choice.finish_reason != "tool_calls" or not msg.tool_calls:
            return msg.content or ""

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = await tool_executor(tc.function.name, args)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})

    return "I reached the maximum reasoning depth. Please try a simpler question."


async def _ant_loop(
    user_message: str,
    tools: list[dict],
    tool_executor: Callable[[str, dict], Awaitable[str]],
    model: str,
    system: str | None,
) -> str:
    import anthropic
    c = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    # Convert OpenAI tool format → Anthropic format
    ant_tools = [
        {"name": t["function"]["name"], "description": t["function"]["description"],
         "input_schema": t["function"].get("parameters", {"type": "object", "properties": {}})}
        for t in tools
    ]
    messages: list[dict] = [{"role": "user", "content": user_message}]
    kw: dict[str, Any] = {"model": model, "max_tokens": 1024, "tools": ant_tools}
    if system:
        kw["system"] = system

    for _ in range(8):
        resp = await c.messages.create(messages=messages, **kw)
        if resp.stop_reason != "tool_use":
            for block in resp.content:
                if hasattr(block, "text"):
                    return block.text
            return ""
        messages.append({"role": "assistant", "content": resp.content})
        tool_results = []
        for block in resp.content:
            if block.type == "tool_use":
                result = await tool_executor(block.name, block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        messages.append({"role": "user", "content": tool_results})

    return "I reached the maximum reasoning depth. Please try a simpler question."
