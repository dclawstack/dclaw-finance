import statistics
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, extract, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.expense import Expense

router = APIRouter(prefix="/forecast", tags=["forecast"])

# ── Shared helpers ─────────────────────────────────────────────────────────────

def _exponential_smooth(data: list[float], alpha: float = 0.3) -> list[float]:
    if not data:
        return []
    smoothed = [data[0]]
    for x in data[1:]:
        smoothed.append(alpha * x + (1 - alpha) * smoothed[-1])
    return smoothed


def _month_offsets(anchor: date, start_offset: int, count: int) -> list[tuple[int, int]]:
    """Return `count` (year, month) tuples starting `start_offset` months from anchor."""
    months = []
    for i in range(start_offset, start_offset + count):
        m = anchor.month + i
        y = anchor.year
        while m > 12:
            m -= 12
            y += 1
        while m <= 0:
            m += 12
            y -= 1
        months.append((y, m))
    return months


def _hist_offsets(anchor: date, count: int) -> list[tuple[int, int]]:
    """Return `count` complete historical (year, month) tuples before anchor."""
    months = []
    for i in range(count, 0, -1):
        m = anchor.month - i
        y = anchor.year
        while m <= 0:
            m += 12
            y -= 1
        months.append((y, m))
    return months


async def _monthly_totals(
    db: AsyncSession, months: list[tuple[int, int]]
) -> tuple[list[float], list[float]]:
    revenues: list[float] = []
    expenses: list[float] = []
    for year, month in months:
        rev = await db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
                Invoice.status == "paid",
                extract("year", Invoice.issue_date) == year,
                extract("month", Invoice.issue_date) == month,
            )
        )
        exp = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
                extract("year", Expense.date) == year,
                extract("month", Expense.date) == month,
            )
        )
        revenues.append(float(rev.scalar_one()))
        expenses.append(float(exp.scalar_one()))
    return revenues, expenses


def _growth_rate(series: list[float]) -> float:
    """Month-over-month growth from last two values, capped at ±20%."""
    if len(series) < 2 or series[-2] == 0:
        return 0.0
    raw = (series[-1] - series[-2]) / series[-2]
    return max(-0.20, min(0.20, raw))


def _project(last: float, growth: float, months: int) -> list[float]:
    return [max(0.0, last * (1 + growth * i)) for i in range(1, months + 1)]


# ── GET /forecast — 12-month projection ───────────────────────────────────────

@router.get("")
async def get_forecast(
    months: int = Query(12, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
) -> dict:
    today = date.today()
    hist_months = _hist_offsets(today, 12)
    hist_rev, hist_exp = await _monthly_totals(db, hist_months)

    smoothed_rev = _exponential_smooth(hist_rev)
    smoothed_exp = _exponential_smooth(hist_exp)

    rev_growth = _growth_rate(hist_rev)
    exp_growth = _growth_rate(hist_exp)

    try:
        rev_std = statistics.stdev(hist_rev) if len(hist_rev) > 1 else 0.0
        exp_std = statistics.stdev(hist_exp) if len(hist_exp) > 1 else 0.0
    except statistics.StatisticsError:
        rev_std = exp_std = 0.0

    last_rev = smoothed_rev[-1]
    last_exp = smoothed_exp[-1]

    proj_months = _month_offsets(today, 1, months)
    projected = []
    for i, (py, pm) in enumerate(proj_months, start=1):
        proj_rev = max(0.0, last_rev * (1 + rev_growth * i))
        proj_exp = max(0.0, last_exp * (1 + exp_growth * i))
        proj_profit = proj_rev - proj_exp
        projected.append({
            "month": date(py, pm, 1).strftime("%b %Y"),
            "projected_revenue": round(proj_rev, 2),
            "projected_expenses": round(proj_exp, 2),
            "projected_profit": round(proj_profit, 2),
            "confidence_band_low": round(proj_profit - rev_std - exp_std, 2),
            "confidence_band_high": round(proj_profit + rev_std + exp_std, 2),
        })

    historical = []
    for idx, (hy, hm) in enumerate(hist_months[-3:]):
        historical.append({
            "month": date(hy, hm, 1).strftime("%b %Y"),
            "actual_revenue": round(hist_rev[-(3 - idx)], 2),
            "actual_expenses": round(hist_exp[-(3 - idx)], 2),
            "actual_profit": round(hist_rev[-(3 - idx)] - hist_exp[-(3 - idx)], 2),
        })

    return {"projected": projected, "historical": historical}


# ── GET /forecast/mape — retrospective forecast accuracy ──────────────────────

@router.get("/mape")
async def get_forecast_mape(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Retrospective MAPE: train on months 1-9 of history, predict months 10-12,
    compare to actuals. Requires at least 12 months of data.
    """
    today = date.today()
    hist_months = _hist_offsets(today, 12)
    hist_rev, hist_exp = await _monthly_totals(db, hist_months)

    train_rev, train_exp = hist_rev[:9], hist_exp[:9]
    actual_rev, actual_exp = hist_rev[9:], hist_exp[9:]

    if not any(actual_rev):
        return {"mape_revenue": None, "mape_expenses": None, "note": "Insufficient data for MAPE (need 12 months of actuals)"}

    smoothed_rev = _exponential_smooth(train_rev)
    smoothed_exp = _exponential_smooth(train_exp)
    rev_growth = _growth_rate(train_rev)
    exp_growth = _growth_rate(train_exp)

    pred_rev = _project(smoothed_rev[-1], rev_growth, 3)
    pred_exp = _project(smoothed_exp[-1], exp_growth, 3)

    def mape(actuals: list[float], preds: list[float]) -> float | None:
        pairs = [(a, p) for a, p in zip(actuals, preds) if a > 0]
        if not pairs:
            return None
        return round(100 * sum(abs(a - p) / a for a, p in pairs) / len(pairs), 2)

    return {
        "mape_revenue": mape(actual_rev, pred_rev),
        "mape_expenses": mape(actual_exp, pred_exp),
        "validation_months": [date(y, m, 1).strftime("%b %Y") for y, m in hist_months[9:]],
        "actuals_revenue": [round(v, 2) for v in actual_rev],
        "predicted_revenue": [round(v, 2) for v in pred_rev],
        "actuals_expenses": [round(v, 2) for v in actual_exp],
        "predicted_expenses": [round(v, 2) for v in pred_exp],
    }


# ── GET /forecast/scenarios — 5 named scenarios ────────────────────────────────

_SCENARIOS = {
    "base":         {"label": "Base Case",     "rev_mult": 1.00, "exp_mult": 1.00, "color": "#7030A0"},
    "bull":         {"label": "Bull Case",     "rev_mult": 1.20, "exp_mult": 1.05, "color": "#18d26e"},
    "bear":         {"label": "Bear Case",     "rev_mult": 0.80, "exp_mult": 1.10, "color": "#dc2626"},
    "high_growth":  {"label": "High Growth",   "rev_mult": 1.40, "exp_mult": 1.30, "color": "#f59e0b"},
    "conservative": {"label": "Conservative",  "rev_mult": 0.90, "exp_mult": 0.85, "color": "#64748b"},
}


@router.get("/scenarios")
async def get_scenarios(db: AsyncSession = Depends(get_db)) -> dict:
    today = date.today()
    hist_months = _hist_offsets(today, 12)
    hist_rev, hist_exp = await _monthly_totals(db, hist_months)

    smoothed_rev = _exponential_smooth(hist_rev)
    smoothed_exp = _exponential_smooth(hist_exp)
    base_rev_growth = _growth_rate(hist_rev)
    base_exp_growth = _growth_rate(hist_exp)
    last_rev = smoothed_rev[-1]
    last_exp = smoothed_exp[-1]

    proj_months = _month_offsets(today, 1, 12)
    month_labels = [date(y, m, 1).strftime("%b %Y") for y, m in proj_months]

    scenarios = []
    for key, cfg in _SCENARIOS.items():
        rev_mult = cfg["rev_mult"]
        exp_mult = cfg["exp_mult"]
        proj = []
        for i in range(1, 13):
            pr = max(0.0, last_rev * rev_mult * (1 + base_rev_growth * i))
            pe = max(0.0, last_exp * exp_mult * (1 + base_exp_growth * i))
            proj.append({
                "month": month_labels[i - 1],
                "revenue": round(pr, 2),
                "expenses": round(pe, 2),
                "profit": round(pr - pe, 2),
            })
        annual_rev = sum(p["revenue"] for p in proj)
        annual_exp = sum(p["expenses"] for p in proj)
        scenarios.append({
            "key": key,
            "label": cfg["label"],
            "color": cfg["color"],
            "assumptions": {
                "revenue_multiplier": rev_mult,
                "expense_multiplier": exp_mult,
            },
            "monthly": proj,
            "annual_summary": {
                "revenue": round(annual_rev, 2),
                "expenses": round(annual_exp, 2),
                "profit": round(annual_rev - annual_exp, 2),
            },
        })

    return {"scenarios": scenarios, "months": month_labels}


# ── GET /forecast/drivers — driver-based model ─────────────────────────────────

@router.get("/drivers")
async def get_drivers(db: AsyncSession = Depends(get_db)) -> dict:
    today = date.today()
    # 12-month trailing window
    hist_months = _hist_offsets(today, 12)
    hist_rev, hist_exp = await _monthly_totals(db, hist_months)

    total_rev = sum(hist_rev)
    total_exp = sum(hist_exp)

    # Client count from invoices in window
    start_date = date(hist_months[0][0], hist_months[0][1], 1)
    client_result = await db.execute(
        select(func.count(distinct(Invoice.client_name))).where(
            Invoice.status == "paid",
            Invoice.issue_date >= start_date,
        )
    )
    client_count = int(client_result.scalar_one() or 1)

    # Invoice count (won deals)
    invoice_count_result = await db.execute(
        select(func.count(Invoice.id)).where(
            Invoice.status == "paid",
            Invoice.issue_date >= start_date,
        )
    )
    invoice_count = int(invoice_count_result.scalar_one() or 0)

    avg_contract_value = total_rev / invoice_count if invoice_count > 0 else 0.0
    avg_monthly_rev = total_rev / 12
    avg_monthly_exp = total_exp / 12
    avg_rev_per_client = total_rev / client_count

    # Expense breakdown
    exp_breakdown_result = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(Expense.date >= start_date)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
    )
    exp_breakdown = {row[0]: round(float(row[1]), 2) for row in exp_breakdown_result.all()}

    # Win rate proxy: paid / (paid + sent + overdue)
    total_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.issue_date >= start_date)
    )
    total_invoices = int(total_result.scalar_one() or 1)
    win_rate = round(invoice_count / total_invoices, 3) if total_invoices > 0 else 0.0

    return {
        "drivers": {
            "avg_contract_value_inr": round(avg_contract_value, 2),
            "active_clients": client_count,
            "closed_deals_12m": invoice_count,
            "win_rate": win_rate,
            "avg_monthly_revenue_inr": round(avg_monthly_rev, 2),
            "avg_monthly_expenses_inr": round(avg_monthly_exp, 2),
            "avg_revenue_per_client_inr": round(avg_rev_per_client, 2),
            "net_margin": round((total_rev - total_exp) / total_rev, 3) if total_rev > 0 else 0.0,
        },
        "expense_breakdown_12m": exp_breakdown,
        "trailing_months": 12,
    }


# ── GET /forecast/sensitivity — driver sensitivity analysis ────────────────────

@router.get("/sensitivity")
async def get_sensitivity(db: AsyncSession = Depends(get_db)) -> dict:
    """Show how ±10% / ±20% changes to each key driver affect annual revenue & profit."""
    today = date.today()
    hist_months = _hist_offsets(today, 12)
    hist_rev, hist_exp = await _monthly_totals(db, hist_months)

    base_annual_rev = sum(hist_rev)
    base_annual_exp = sum(hist_exp)
    base_profit = base_annual_rev - base_annual_exp

    deltas = [-0.20, -0.10, 0.10, 0.20]
    delta_labels = ["-20%", "-10%", "+10%", "+20%"]

    def rev_impact(multiplier: float) -> dict:
        new_rev = base_annual_rev * multiplier
        new_profit = new_rev - base_annual_exp
        return {
            "revenue": round(new_rev, 2),
            "profit": round(new_profit, 2),
            "profit_change_pct": round((new_profit - base_profit) / abs(base_profit) * 100, 1) if base_profit != 0 else 0.0,
        }

    def exp_impact(multiplier: float) -> dict:
        new_exp = base_annual_exp * multiplier
        new_profit = base_annual_rev - new_exp
        return {
            "expenses": round(new_exp, 2),
            "profit": round(new_profit, 2),
            "profit_change_pct": round((new_profit - base_profit) / abs(base_profit) * 100, 1) if base_profit != 0 else 0.0,
        }

    return {
        "base": {
            "annual_revenue": round(base_annual_rev, 2),
            "annual_expenses": round(base_annual_exp, 2),
            "annual_profit": round(base_profit, 2),
        },
        "sensitivity": {
            "revenue": [
                {"delta": lbl, **rev_impact(1 + d)}
                for lbl, d in zip(delta_labels, deltas)
            ],
            "expenses": [
                {"delta": lbl, **exp_impact(1 + d)}
                for lbl, d in zip(delta_labels, deltas)
            ],
        },
        "note": "Revenue sensitivity holds expenses constant; expense sensitivity holds revenue constant.",
    }


# ── GET /forecast/three-statement — simplified 3-statement model ───────────────

@router.get("/three-statement")
async def get_three_statement(
    year: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    target_year = year or date.today().year

    # ── Income Statement ──────────────────────────────────────────────────────
    rev_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
            Invoice.status == "paid",
            extract("year", Invoice.issue_date) == target_year,
        )
    )
    total_revenue = float(rev_result.scalar_one())

    # Expense breakdown by category
    exp_result = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(extract("year", Expense.date) == target_year)
        .group_by(Expense.category)
    )
    exp_by_cat = {row[0]: round(float(row[1]), 2) for row in exp_result.all()}
    total_expenses = sum(exp_by_cat.values())

    cogs_cats = {"salary", "contractors", "cloud", "software", "hardware"}
    cogs = sum(v for k, v in exp_by_cat.items() if k in cogs_cats)
    opex = total_expenses - cogs
    gross_profit = total_revenue - cogs
    ebit = gross_profit - opex
    # Simplified: assume 25% effective tax on positive EBIT
    tax = max(0.0, ebit * 0.25)
    net_income = ebit - tax

    income_statement = {
        "revenue": round(total_revenue, 2),
        "cogs": round(cogs, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_margin_pct": round(gross_profit / total_revenue * 100, 1) if total_revenue else 0.0,
        "operating_expenses": round(opex, 2),
        "ebit": round(ebit, 2),
        "tax_provision": round(tax, 2),
        "net_income": round(net_income, 2),
        "net_margin_pct": round(net_income / total_revenue * 100, 1) if total_revenue else 0.0,
        "expense_detail": exp_by_cat,
    }

    # ── Cash Flow Statement ───────────────────────────────────────────────────
    ar_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
            Invoice.status.in_(["sent", "overdue"]),
            extract("year", Invoice.issue_date) == target_year,
        )
    )
    accounts_receivable = float(ar_result.scalar_one())

    cfo = net_income + accounts_receivable  # simplified: AR represents cash yet to collect
    cash_flow_statement = {
        "operating": {
            "net_income": round(net_income, 2),
            "change_in_accounts_receivable": round(-accounts_receivable, 2),
            "net_cash_from_operations": round(net_income - accounts_receivable, 2),
        },
        "investing": {"net_cash_from_investing": 0.0, "note": "No capital assets tracked"},
        "financing": {"net_cash_from_financing": 0.0, "note": "No debt/equity tracked"},
        "net_change_in_cash": round(net_income - accounts_receivable, 2),
    }

    # ── Balance Sheet (point-in-time, end of year) ────────────────────────────
    # Cash = cumulative revenue collected - cumulative expenses (simplified)
    all_rev_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
            Invoice.status == "paid",
            extract("year", Invoice.issue_date) <= target_year,
        )
    )
    all_exp_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            extract("year", Expense.date) <= target_year,
        )
    )
    cumulative_cash = float(all_rev_result.scalar_one()) - float(all_exp_result.scalar_one())

    balance_sheet = {
        "assets": {
            "cash_and_equivalents": round(max(0.0, cumulative_cash), 2),
            "accounts_receivable": round(accounts_receivable, 2),
            "total_assets": round(max(0.0, cumulative_cash) + accounts_receivable, 2),
        },
        "liabilities": {
            "total_liabilities": 0.0,
            "note": "No liabilities tracked",
        },
        "equity": {
            "retained_earnings": round(max(0.0, cumulative_cash), 2),
            "total_equity": round(max(0.0, cumulative_cash) + accounts_receivable, 2),
        },
        "note": "Simplified model — no fixed assets, debt, or equity instruments",
    }

    return {
        "year": target_year,
        "income_statement": income_statement,
        "cash_flow_statement": cash_flow_statement,
        "balance_sheet": balance_sheet,
    }
