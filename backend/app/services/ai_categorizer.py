import json
from app.services.llm_client import chat, HAIKU

CATEGORIES = [
    # Office & Facilities
    "office", "rent", "utilities", "maintenance", "cleaning", "repairs", "security",
    # Travel & Logistics
    "travel", "vehicles", "shipping",
    # People & HR
    "salary", "contractors", "recruitment", "training", "healthcare", "wellness", "awards",
    # Sales & Marketing
    "marketing", "pr", "content", "design", "conferences", "gifts", "sales",
    # Technology
    "software", "hardware", "cloud", "telecommunications", "data", "research", "product",
    # Professional Services
    "legal", "accounting", "consulting", "banking", "insurance",
    # Meals & Events
    "meals", "catering",
    # Finance & Compliance
    "taxes", "banking_charges", "compliance", "penalties",
    # Subscriptions & Misc
    "subscriptions", "printing", "customer_service", "operations",
    "medical", "donations", "other",
]


async def suggest_category(vendor: str, description: str) -> dict:
    prompt = (
        f"Given vendor='{vendor}' and description='{description}', "
        f"classify into exactly one of these expense categories:\n"
        f"{', '.join(CATEGORIES)}\n\n"
        f"Pick the most specific matching category. "
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
