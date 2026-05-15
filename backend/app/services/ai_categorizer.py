import json
from app.services.llm_client import chat, HAIKU

CATEGORIES = ["office", "travel", "software", "marketing", "salary", "other"]


async def suggest_category(vendor: str, description: str) -> dict:
    prompt = (
        f"Given vendor='{vendor}' and description='{description}', "
        f"classify into exactly one of: {' | '.join(CATEGORIES)}. "
        f'Respond with only valid JSON: {{"category": "<one_of_above>", "confidence": <0.0-1.0>}}'
    )
    text = await chat(prompt, model=HAIKU, max_tokens=64)
    try:
        data = json.loads(text)
        if data.get("category") not in CATEGORIES:
            data["category"] = "other"
        return {"suggested_category": data["category"], "confidence": float(data.get("confidence", 0.7))}
    except Exception:
        return {"suggested_category": "other", "confidence": 0.5}
