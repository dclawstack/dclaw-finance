import json
from app.services.llm_client import chat, HAIKU, SONNET


async def draft_reminder(invoice_number: str, client_name: str, due_date: str, total: float) -> dict:
    prompt = (
        f"Write a professional payment reminder for invoice #{invoice_number} "
        f"to {client_name}, due {due_date}, amount ₹{total:,.0f}. "
        f"Under 100 words. Be polite but firm."
    )
    body = await chat(prompt, model=SONNET, max_tokens=256)
    return {
        "subject": f"Payment Reminder: Invoice #{invoice_number} — ₹{total:,.0f} Due",
        "body": body.strip(),
    }


async def suggest_line_items(client_name: str, first_item: str, history: list[str]) -> list[dict]:
    history_text = ", ".join(history[:10]) if history else "none"
    prompt = (
        f"A freelancer is invoicing {client_name}. First line item: '{first_item}'. "
        f"Prior items for this client: {history_text}. "
        f"Suggest 3 additional typical line items. "
        f'Return only a JSON array: [{{"description": "...", "typical_unit_price": 0.0}}, ...]'
    )
    text = await chat(prompt, model=HAIKU, max_tokens=256)
    start, end = text.find("["), text.rfind("]") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end])
        except Exception:
            pass
    return []
