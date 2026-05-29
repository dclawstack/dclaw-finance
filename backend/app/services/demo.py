"""Demo seed / reset for the landing page.

Every row written here carries a stable "DEMO-" prefix on its natural key
(invoice_number / description / vendor / budget category). reset_demo() uses
those prefixes as the only delete predicates, so it can never touch real data.

To remove the demo feature entirely, delete the 3 things listed at the top of
app/api/v1/demo.py.

The set is small but exercises every screen the app ships:
  • invoices (paid, sent, and OVERDUE) with line items
  • categorized expenses across every category
  • a monthly category budget
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget import Budget
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem

DEMO_PREFIX = "DEMO-"
DEMO_BUDGET_PREFIX = "DEMO "  # budget.category is free text


@dataclass
class DemoStatus:
    enabled: bool
    seeded: bool
    counts: dict[str, int]
    credentials: None = None


async def gather_status(db: AsyncSession, *, enabled: bool) -> DemoStatus:
    invoices = (
        await db.execute(
            select(Invoice.id).where(Invoice.invoice_number.like(f"{DEMO_PREFIX}%"))
        )
    ).all()
    expenses = (
        await db.execute(
            select(Expense.id).where(Expense.description.like(f"{DEMO_PREFIX}%"))
        )
    ).all()
    budgets = (
        await db.execute(
            select(Budget.id).where(Budget.category.like(f"{DEMO_BUDGET_PREFIX}%"))
        )
    ).all()
    counts = {
        "invoices": len(invoices),
        "expenses": len(expenses),
        "budgets": len(budgets),
    }
    seeded = any(counts.values())
    return DemoStatus(enabled=enabled, seeded=seeded, counts=counts)


def _invoice(number: str, client: str, email: str, status: str,
             issue: date, due: date, items: list[tuple[str, float, float]]) -> Invoice:
    inv = Invoice(
        invoice_number=number,
        client_name=client,
        client_email=email,
        issue_date=issue,
        due_date=due,
        status=status,
        tax_rate=18.0,  # GST
    )
    for desc, qty, price in items:
        inv.items.append(
            InvoiceItem(description=desc, quantity=qty, unit_price=price,
                        amount=round(qty * price, 2))
        )
    subtotal = round(sum(i.amount for i in inv.items), 2)
    inv.subtotal = subtotal
    inv.tax_amount = round(subtotal * inv.tax_rate / 100.0, 2)
    inv.total = round(subtotal + inv.tax_amount, 2)
    return inv


async def seed_demo(db: AsyncSession) -> DemoStatus:
    """Idempotent: wipe any existing demo rows, then reseed."""
    await reset_demo(db)
    today = date.today()

    invoices = [
        _invoice(
            f"{DEMO_PREFIX}INV-001", "Acme Retail Pvt Ltd", "ap@acmeretail.in",
            "paid", today - timedelta(days=40), today - timedelta(days=10),
            [("Annual SaaS subscription", 1, 240000.0),
             ("Onboarding & setup", 1, 60000.0)],
        ),
        _invoice(
            f"{DEMO_PREFIX}INV-002", "Bharat Logistics", "finance@bharatlog.in",
            "sent", today - timedelta(days=12), today + timedelta(days=18),
            [("Monthly platform fee", 1, 85000.0),
             ("Additional seats", 10, 1500.0)],
        ),
        _invoice(
            f"{DEMO_PREFIX}INV-003", "Coastal Foods Co", "accounts@coastalfoods.in",
            "overdue", today - timedelta(days=55), today - timedelta(days=25),
            [("Consulting engagement", 20, 5000.0)],
        ),
        _invoice(
            f"{DEMO_PREFIX}INV-004", "Deccan Textiles", "pay@deccantextiles.in",
            "overdue", today - timedelta(days=70), today - timedelta(days=40),
            [("Implementation services", 1, 150000.0),
             ("Training workshop", 2, 25000.0)],
        ),
        _invoice(
            f"{DEMO_PREFIX}INV-005", "Eastern Ventures", "billing@easternvc.in",
            "draft", today - timedelta(days=2), today + timedelta(days=28),
            [("Quarterly retainer", 1, 300000.0)],
        ),
    ]
    db.add_all(invoices)

    expenses = [
        Expense(category="software", description=f"{DEMO_PREFIX}Cloud hosting (AWS)",
                amount=42000.0, date=today - timedelta(days=8), vendor="Amazon Web Services"),
        Expense(category="software", description=f"{DEMO_PREFIX}Design tooling subscription",
                amount=6500.0, date=today - timedelta(days=15), vendor="Figma"),
        Expense(category="salary", description=f"{DEMO_PREFIX}Engineering payroll",
                amount=850000.0, date=today - timedelta(days=5), vendor="Payroll"),
        Expense(category="marketing", description=f"{DEMO_PREFIX}Q2 ad campaign",
                amount=120000.0, date=today - timedelta(days=20), vendor="Google Ads"),
        Expense(category="travel", description=f"{DEMO_PREFIX}Client visit — Mumbai",
                amount=38000.0, date=today - timedelta(days=18), vendor="IndiGo"),
        Expense(category="travel", description=f"{DEMO_PREFIX}Offsite team travel",
                amount=210000.0, date=today - timedelta(days=30), vendor="MakeMyTrip"),
        Expense(category="office", description=f"{DEMO_PREFIX}Co-working space rent",
                amount=95000.0, date=today - timedelta(days=3), vendor="WeWork"),
        Expense(category="other", description=f"{DEMO_PREFIX}Professional services (legal)",
                amount=45000.0, date=today - timedelta(days=12), vendor="Khaitan & Co"),
    ]
    db.add_all(expenses)

    budgets = [
        Budget(category=f"{DEMO_BUDGET_PREFIX}Marketing", monthly_limit=150000.0,
               year=today.year, month=today.month),
        Budget(category=f"{DEMO_BUDGET_PREFIX}Travel", monthly_limit=100000.0,
               year=today.year, month=today.month),
        Budget(category=f"{DEMO_BUDGET_PREFIX}Software", monthly_limit=60000.0,
               year=today.year, month=today.month),
    ]
    db.add_all(budgets)

    await db.commit()
    return await gather_status(db, enabled=True)


async def reset_demo(db: AsyncSession) -> DemoStatus:
    """Delete only rows whose prefixed natural key marks them as demo.

    InvoiceItem rows cascade from Invoice (ondelete=CASCADE), so deleting the
    demo invoices is enough.
    """
    await db.execute(
        delete(Invoice).where(Invoice.invoice_number.like(f"{DEMO_PREFIX}%"))
    )
    await db.execute(
        delete(Expense).where(Expense.description.like(f"{DEMO_PREFIX}%"))
    )
    await db.execute(
        delete(Budget).where(Budget.category.like(f"{DEMO_BUDGET_PREFIX}%"))
    )
    await db.commit()
    return await gather_status(db, enabled=True)
