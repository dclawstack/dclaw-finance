import json
from app.services.llm_client import chat_vision, HAIKU
from app.services.ai_categorizer import CATEGORIES


async def extract_receipt(image_bytes: bytes, media_type: str) -> dict:
    prompt = (
        "Extract expense data from this receipt image. "
        "Return only valid JSON with keys: "
        "vendor (str), amount (float), date (YYYY-MM-DD or null), "
        f"description (str), suggested_category (one of: {' | '.join(CATEGORIES)}). "
        "Use null for any field you cannot determine."
    )
    text = await chat_vision(prompt, image_bytes, media_type, model=HAIKU, max_tokens=256)
    start, end = text.find("{"), text.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            data = json.loads(text[start:end])
            if data.get("suggested_category") not in CATEGORIES:
                data["suggested_category"] = "other"
            return data
        except Exception:
            pass
    return {"vendor": None, "amount": None, "date": None, "description": None, "suggested_category": "other"}
