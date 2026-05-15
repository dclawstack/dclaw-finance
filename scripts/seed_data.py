#!/usr/bin/env python3
"""
DClaw Finance — Demo Data Seed Script
======================================
Populates 12 months of realistic financial data for a fictional company
modeled on DKube: an enterprise private AI / MLOps platform company
with ~60 employees across San Jose CA and Hyderabad India.

Usage:
  pip install httpx
  python scripts/seed_data.py            # seed all data
  python scripts/seed_data.py --reset    # delete existing data first, then seed
  python scripts/seed_data.py --dry-run  # print what would be created, no writes

Requirements: backend running at http://localhost:8096
"""

import argparse
import asyncio
import sys
from datetime import date, timedelta

import httpx

API = "http://localhost:8096/api/v1"
TODAY = date(2026, 5, 15)

# ── Client roster ─────────────────────────────────────────────────────────────
CLIENTS = [
    ("Apollo Global Management",    "billing@apolloglobal.com"),
    ("TIAA Financial Services",     "accounts-payable@tiaa.org"),
    ("Altos Labs",                  "finance@altoslabs.com"),
    ("Cisco Systems",               "vendor-payments@cisco.com"),
    ("VMware by Broadcom",          "procurement@vmware.com"),
    ("MetLife Group",               "ap-enterprise@metlife.com"),
    ("JPMorgan Chase",              "vendor.mgmt@jpmorgan.com"),
    ("Sequoia Legal Partners",      "billing@sequoialegal.com"),
    ("BuildFirst Construction",     "ap@buildfirst.io"),
    ("StackPath Technologies",      "accounts@stackpath.com"),
    ("Allianz Life Sciences",       "procurement@allianzls.com"),
    ("Pacific University System",   "ap@pacificu.edu"),
]

# ── Service catalog ───────────────────────────────────────────────────────────
# (description, unit_price in INR)
# Indian enterprise market pricing for AI/MLOps platform + professional services.
SVC = [
    ("DKubeX Enterprise Platform License — Annual",                  25000000),  # 0  ₹2.5 Cr/yr
    ("DKubeX Enterprise Platform License — Quarterly",                7500000),  # 1  ₹75 L/qtr
    ("DKube MLOps Platform License — Annual",                        15000000),  # 2  ₹1.5 Cr/yr
    ("DKube MLOps Platform License — Quarterly",                      4500000),  # 3  ₹45 L/qtr
    ("Private AI Blueprint — QueriLynx Deployment",                   7500000),  # 4  ₹75 L
    ("Private AI Blueprint — DocMind Document Intelligence",          6000000),  # 5  ₹60 L
    ("Private AI Blueprint — Virtual Teaching Assistant",             5000000),  # 6  ₹50 L
    ("Professional Services — 12-Week Engagement (monthly billing)",  2500000),  # 7  ₹25 L/mo
    ("AI Infrastructure Assessment & Technology Roadmap",             3000000),  # 8  ₹30 L
    ("GenAI Security & Compliance Audit",                             4000000),  # 9  ₹40 L
    ("Custom RAG Pipeline Development",                               8000000),  # 10 ₹80 L
    ("Enterprise Support & SLA Contract — Annual",                    2500000),  # 11 ₹25 L/yr
    ("MLOps Team Training & Certification (per cohort)",              1000000),  # 12 ₹10 L
    ("On-premise GPU Cluster Configuration",                          2000000),  # 13 ₹20 L
    ("Model Fine-tuning & Optimization Services",                     1500000),  # 14 ₹15 L
]

# ── Invoice plan ──────────────────────────────────────────────────────────────
# (year, month): [(client_idx, [svc_idxs], tax_pct, notes)]
INVOICE_PLAN = {
    (2025, 5): [
        (0,  [0, 11], 0.0, "Annual platform + support bundle — FY2025 kickoff"),
        (4,  [2],     0.0, "MLOps annual license — VMware AI team"),
        (9,  [7],     0.0, "QueriLynx engagement — Month 1 of 3"),
    ],
    (2025, 6): [
        (1,  [0, 11], 0.0, "DKubeX enterprise license + SLA — TIAA"),
        (6,  [4],     0.0, "QueriLynx financial data exploration — JPMorgan"),
        (3,  [7],     0.0, "12-week AI engagement — Cisco month 1"),
        (10, [5],     0.0, "DocMind — life sciences document processing"),
    ],
    (2025, 7): [
        (2,  [7, 14], 0.0, "Professional services + fine-tuning — Altos Labs"),
        (5,  [2, 11], 0.0, "MLOps platform annual + SLA — MetLife"),
        (7,  [5],     0.0, "DocMind legal document automation — Sequoia"),
    ],
    (2025, 8): [
        (0,  [7],     0.0, "Ongoing engagement — Apollo month 4"),
        (8,  [4],     0.0, "QueriLynx for construction procurement — BuildFirst"),
        (11, [6],     0.0, "Virtual Teaching Assistant deployment — Pacific U"),
        (3,  [8],     0.0, "AI infrastructure assessment — Cisco"),
    ],
    (2025, 9): [
        (6,  [0, 11], 0.0, "DKubeX renewal + SLA — JPMorgan"),
        (1,  [7],     0.0, "Professional services continuation — TIAA"),
        (4,  [9],     0.0, "GenAI security & compliance audit — VMware"),
        (2,  [2],     0.0, "MLOps annual license — Altos Labs"),
    ],
    (2025, 10): [
        (5,  [10],    0.0, "Custom RAG pipeline — MetLife claims processing"),
        (9,  [1],     0.0, "DKubeX quarterly license Q4 — StackPath"),
        (0,  [11],    0.0, "Support contract renewal — Apollo"),
        (7,  [7],     0.0, "12-week engagement month 2 — Sequoia"),
        (3,  [12],    0.0, "MLOps training cohort 1 — Cisco (15 engineers)"),
    ],
    (2025, 11): [
        (6,  [7],     0.0, "Professional services month 2 — JPMorgan"),
        (10, [0],     0.0, "DKubeX annual license — Allianz Life Sciences"),
        (1,  [4],     0.0, "QueriLynx finance analytics deployment — TIAA"),
        (8,  [2, 11], 0.0, "MLOps platform + SLA — BuildFirst"),
    ],
    (2025, 12): [
        (5,  [7],     0.0, "Ongoing engagement month 3 — MetLife"),
        (0,  [1],     0.0, "DKubeX Q1-2026 quarterly renewal — Apollo"),
        (4,  [13],    0.0, "On-premise GPU cluster config — VMware"),
    ],
    (2026, 1): [
        (6,  [0, 11], 0.0, "Annual renewal + SLA — JPMorgan enterprise"),
        (2,  [10],    0.0, "Custom RAG pipeline — Altos Labs research data"),
        (9,  [7],     0.0, "New 12-week engagement kickoff — StackPath"),
        (11, [6],     0.0, "Teaching assistant v2 expansion — Pacific University"),
    ],
    (2026, 2): [
        (1,  [0],     0.0, "DKubeX annual renewal — TIAA"),
        (5,  [9],     0.0, "Compliance audit & remediation — MetLife"),
        (3,  [1],     0.0, "DKubeX Q2 quarterly — Cisco"),
        (7,  [7, 14], 0.0, "Services + model fine-tuning — Sequoia Legal"),
        (8,  [4],     0.0, "QueriLynx v2 upgrade — BuildFirst"),
    ],
    (2026, 3): [
        (0,  [2, 11], 0.0, "MLOps platform add-on + SLA — Apollo expansion"),
        (10, [7],     0.0, "Professional services month 1 — Allianz"),
        (6,  [12],    0.0, "MLOps training cohort Q2 — JPMorgan (20 engineers)"),
        (4,  [1],     0.0, "DKubeX Q2 quarterly — VMware"),
    ],
    (2026, 4): [
        (1,  [10],    0.0, "Custom RAG — TIAA mortgage document processing"),
        (2,  [0, 11], 0.0, "Annual renewal + SLA — Altos Labs"),
        (5,  [7],     0.0, "Continuation engagement month 2 — MetLife"),
        (9,  [2],     0.0, "MLOps annual license — StackPath"),
    ],
    (2026, 5): [
        (6,  [4],     0.0, "QueriLynx v2 multi-agent expansion — JPMorgan"),
        (3,  [7],     0.0, "New 12-week engagement — Cisco AI CoE"),
        (7,  [5],     0.0, "DocMind deployment — Sequoia Legal intake"),
    ],
}


def _invoice_status(year: int, month: int, idx: int) -> str:
    """Determine realistic invoice status based on age."""
    age_months = (TODAY.year - year) * 12 + (TODAY.month - month)
    if age_months >= 4:
        return "paid"
    if age_months == 3:
        return "overdue" if idx == 0 else "paid"
    if age_months == 2:
        return "overdue" if idx >= 3 else ("sent" if idx == 2 else "paid")
    if age_months == 1:
        return "sent" if idx >= 2 else "paid"
    # Current month
    return "draft" if idx >= 1 else "sent"


def _due_date(issue: date) -> date:
    return issue + timedelta(days=30)


def build_invoices() -> list[dict]:
    records = []
    inv_num = 1
    for (year, month), entries in sorted(INVOICE_PLAN.items()):
        issue_day = 5 if month % 2 == 1 else 10
        issue = date(year, month, min(issue_day, 28))
        for i, (client_idx, svc_idxs, tax_rate, notes) in enumerate(entries):
            client_name, client_email = CLIENTS[client_idx]
            items = []
            for svc_idx in svc_idxs:
                desc, price = SVC[svc_idx]
                items.append({
                    "description": desc,
                    "quantity": 1,
                    "unit_price": float(price),
                    "amount": float(price),
                })
            subtotal = sum(it["amount"] for it in items)
            tax_amount = round(subtotal * tax_rate / 100, 2)
            total = round(subtotal + tax_amount, 2)
            status = _invoice_status(year, month, i)
            records.append({
                "invoice_number": f"INV-{year}-{inv_num:03d}",
                "client_name": client_name,
                "client_email": client_email,
                "issue_date": issue.isoformat(),
                "due_date": _due_date(issue).isoformat(),
                "status": status,
                "tax_rate": tax_rate,
                "notes": notes,
                "subtotal": subtotal,
                "tax_amount": tax_amount,
                "total": total,
                "items": items,
            })
            inv_num += 1
    return records


# ── Expense plan ──────────────────────────────────────────────────────────────
# Each entry: (category, description, vendor, base_amount, months_active, notes)
# months_active: list of (year, month) tuples, or None = every month

def build_expenses() -> list[dict]:
    rows = []
    months = [(y, m) for y in (2025, 2026)
              for m in range(1, 13)
              if (y, m) >= (2025, 5) and (y, m) <= (2026, 5)]

    for (year, month) in months:
        exp_day = date(year, month, 28)

        # ── SALARY — realistic Indian market LPA rates ─────────────────────
        # India: ₹8–16 LPA (avg ₹12L) | SJ engineers: ₹60–1Cr LPA | Exec: ₹40L–1Cr
        growth = 1 + 0.007 * ((year - 2025) * 12 + month - 5)  # ~0.7%/month raise
        rows += [
            _exp(exp_day, "salary",
                 "Engineering Team Payroll — Hyderabad (20 engineers, avg ₹12 LPA)",
                 "Deel Global Payroll",
                 round(2000000 * growth)),   # ₹20L/month = ₹2.4Cr/year for 20 engineers
            _exp(exp_day, "salary",
                 "Engineering & Product Payroll — San Jose (12 staff, avg ₹80 LPA)",
                 "Gusto Payroll",
                 round(8000000 * growth)),   # ₹80L/month = ₹9.6Cr/year for 12 staff
            _exp(exp_day, "salary",
                 "Sales, Operations & Executive — San Jose (8 staff, avg ₹65 LPA)",
                 "Gusto Payroll",
                 round(4300000 * growth)),   # ₹43L/month = ₹5.2Cr/year for 8 staff
        ]

        # ── SOFTWARE (monthly subscriptions) ──────────────────────────────
        # AWS grows as customer GPU workloads scale through the year
        aws_base = 800000 + (((year - 2025) * 12 + month - 5) * 15000)
        rows += [
            _exp(exp_day, "software",
                 "AWS — EC2, S3, EKS, GPU Instances (enterprise workloads)",
                 "Amazon Web Services", aws_base),        # ₹8L → ₹10L/month
            _exp(exp_day, "software",
                 "SaaS Productivity Suite — GitHub Enterprise, Jira, Slack, Zoom, Notion (55 seats)",
                 "Various SaaS", 250000),                 # ₹2.5L/month
            _exp(exp_day, "software",
                 "Salesforce CRM — 12 Sales Licenses",
                 "Salesforce", 200000),                   # ₹2L/month
            _exp(exp_day, "software",
                 "Datadog APM & Infrastructure Monitoring",
                 "Datadog", 150000),                      # ₹1.5L/month
        ]

        # ── OFFICE (monthly fixed) ─────────────────────────────────────────
        rows += [
            _exp(exp_day, "office",
                 "San Jose HQ Rent — 99 Almaden Blvd (3,200 sq ft @ $50/sqft/yr)",
                 "Almaden Properties", 1200000),          # ₹12L/month
            _exp(exp_day, "office",
                 "Hyderabad Office Rent — KRB Towers, Madhapur",
                 "KRB Properties", 250000),               # ₹2.5L/month
            _exp(exp_day, "office",
                 "Utilities, Internet & Office Supplies — Both Offices",
                 "Various Vendors", 150000),              # ₹1.5L/month
        ]

        # ── MARKETING (base + conference spikes) ──────────────────────────
        rows += [
            _exp(exp_day, "marketing",
                 "Content Marketing & SEO Agency Retainer",
                 "Marketo Agency", 200000),               # ₹2L/month
            _exp(exp_day, "marketing",
                 "LinkedIn Sponsored Content — Enterprise AI Decision Makers",
                 "LinkedIn Ads", 150000),                 # ₹1.5L/month
        ]
        # Major conference sponsorships (realistic Indian enterprise marketing spend)
        if (year, month) == (2025, 10):
            rows.append(_exp(exp_day, "marketing",
                             "AWS re:Invent 2025 — Premier Booth & Sponsorship Package (Las Vegas)",
                             "AWS Events", 8000000))      # ₹80L
        if (year, month) == (2025, 11):
            rows.append(_exp(exp_day, "marketing",
                             "NeurIPS 2025 — Gold Sponsor & Workshop (Vancouver)",
                             "NeurIPS Foundation", 4000000))   # ₹40L
            rows.append(_exp(exp_day, "marketing",
                             "Forrester AI & Data Summit — Speaking Slot & Booth",
                             "Forrester Research", 2000000))   # ₹20L
        if (year, month) == (2026, 2):
            rows.append(_exp(exp_day, "marketing",
                             "Gartner Data & AI Summit — Premier Sponsor (Orlando)",
                             "Gartner Events", 6000000))       # ₹60L
        if (year, month) == (2026, 5):
            rows.append(_exp(exp_day, "marketing",
                             "ODSC East 2026 — Conference Sponsorship & Booth (Boston)",
                             "ODSC", 1500000))                 # ₹15L

        # ── TRAVEL ────────────────────────────────────────────────────────
        travel_map = {
            (2025, 6):  ("Sales Trip — New York (JPMorgan & Apollo meetings, 4 reps)", "Corporate Travel", 1500000),   # ₹15L
            (2025, 7):  ("Engineering Sprint Sync — Hyderabad (India team onsite)", "Corporate Travel", 2500000),      # ₹25L
            (2025, 8):  ("Customer Advisory Board — San Francisco (executive team)", "Corporate Travel", 800000),      # ₹8L
            (2025, 9):  ("BD Trip — Chicago (MetLife & Allianz HQ visits)", "Corporate Travel", 1000000),              # ₹10L
            (2025, 10): ("Conference Travel — Las Vegas re:Invent (12 staff, 5 days)", "Corporate Travel", 2000000),   # ₹20L
            (2025, 11): ("Conference Travel — Vancouver NeurIPS (6 engineers)", "Corporate Travel", 1500000),          # ₹15L
            (2025, 12): ("End-of-year Client Visits — NYC & Boston (4 executives)", "Corporate Travel", 1200000),      # ₹12L
            (2026, 1):  ("Annual Sales Kickoff — San Jose (All Hands, India + US team)", "Corporate Travel", 5000000), # ₹50L
            (2026, 2):  ("Client Visit — MetLife HQ New York (2 day engagement)", "Corporate Travel", 1000000),        # ₹10L
            (2026, 3):  ("Engineering Sync — Hyderabad → San Jose (6 senior engineers)", "Corporate Travel", 3000000), # ₹30L
            (2026, 4):  ("BD Trip — Boston & NYC (3 sales leads, 5 days)", "Corporate Travel", 1500000),               # ₹15L
            (2026, 5):  ("Cisco Customer Workshop — San Jose (onsite delivery)", "Corporate Travel", 500000),          # ₹5L
        }
        if (year, month) in travel_map:
            desc, vendor, amt = travel_map[(year, month)]
            rows.append(_exp(exp_day, "travel", desc, vendor, amt))

        # ── OTHER ─────────────────────────────────────────────────────────
        rows += [
            _exp(exp_day, "other",
                 "Legal — IP Protection, Contract Review & Compliance (Cooley LLP)",
                 "Cooley LLP", 500000),                   # ₹5L/month
            _exp(exp_day, "other",
                 "D&O Insurance & Cybersecurity Liability Premium",
                 "Chubb Insurance", 200000),               # ₹2L/month
        ]
        # Quarterly extras
        if month in (6, 9, 12, 3):
            rows.append(_exp(exp_day, "other",
                             "Quarterly Tax Advisory & Accounting (Deloitte)",
                             "Deloitte", 400000))          # ₹4L/quarter
        if month in (7, 10, 1, 4):
            rows.append(_exp(exp_day, "other",
                             "Cybersecurity Penetration Testing & Vulnerability Assessment",
                             "NCC Group", 500000))         # ₹5L/quarter

    return rows


def _exp(day: date, category: str, description: str, vendor: str, amount: int) -> dict:
    return {
        "category": category,
        "description": description,
        "vendor": vendor,
        "amount": float(amount),
        "date": day.isoformat(),
        "receipt_url": None,
    }


# ── Budget plan (current month) ───────────────────────────────────────────────
BUDGETS = [
    # Set at ~130% of actual May 2026 spend → utilization 70–78%, safely under 80% threshold
    {"category": "salary",    "monthly_limit": 20000000},   # ₹2.00 Cr  → 77.5% util
    {"category": "software",  "monthly_limit":  2200000},   # ₹22 L     → 71.8% util
    {"category": "marketing", "monthly_limit":  2500000},   # ₹25 L     → 74.0% util
    {"category": "travel",    "monthly_limit":  2000000},   # ₹20 L     → 25.0% util
    {"category": "office",    "monthly_limit":  2200000},   # ₹22 L     → 72.7% util
    {"category": "other",     "monthly_limit":  1000000},   # ₹10 L     → 70.0% util
]


# ── HTTP helpers ──────────────────────────────────────────────────────────────
async def post(client: httpx.AsyncClient, path: str, body: dict, dry_run: bool) -> dict | None:
    if dry_run:
        return {"id": "dry-run"}
    r = await client.post(f"{API}{path}", json=body, timeout=30)
    if r.status_code not in (200, 201):
        print(f"  ✗ {path} → {r.status_code}: {r.text[:120]}", file=sys.stderr)
        return None
    return r.json()


async def delete_all(client: httpx.AsyncClient) -> None:
    """Best-effort: delete invoices and expenses found in list endpoints."""
    print("Deleting existing invoices...")
    r = await client.get(f"{API}/invoices?limit=1000", timeout=30)
    for inv in r.json():
        await client.delete(f"{API}/invoices/{inv['id']}", timeout=10)

    print("Deleting existing expenses...")
    r = await client.get(f"{API}/expenses?limit=1000", timeout=30)
    for exp in r.json():
        await client.delete(f"{API}/expenses/{exp['id']}", timeout=10)

    print("Deleting existing budgets...")
    r = await client.get(f"{API}/budgets?limit=1000", timeout=30)
    for b in (r.json() if r.status_code == 200 else []):
        await client.delete(f"{API}/budgets/{b['id']}", timeout=10)


# ── Main ──────────────────────────────────────────────────────────────────────
async def main(dry_run: bool, reset: bool) -> None:
    invoices = build_invoices()
    expenses = build_expenses()

    print(f"\n{'[DRY RUN] ' if dry_run else ''}DClaw Finance — Seed Data")
    print(f"  Invoices to create : {len(invoices)}")
    print(f"  Expenses to create : {len(expenses)}")
    print(f"  Budgets to create  : {len(BUDGETS)}")
    total_rev = sum(inv["total"] for inv in invoices if inv["status"] == "paid")
    total_exp = sum(e["amount"] for e in expenses)
    print(f"  Simulated revenue  : ${total_rev:,.0f}")
    print(f"  Simulated expenses : ${total_exp:,.0f}")
    print()

    if dry_run:
        for inv in invoices[:3]:
            print(f"  Sample invoice: {inv['invoice_number']} | {inv['client_name']} | ${inv['total']:,.0f} | {inv['status']}")
        for exp in expenses[:3]:
            print(f"  Sample expense: {exp['date']} | {exp['category']} | ${exp['amount']:,.0f} | {exp['vendor']}")
        print("\n[DRY RUN] No data written.")
        return

    async with httpx.AsyncClient() as client:
        # Health check
        try:
            r = await client.get(f"{API.replace('/api/v1', '')}/health", timeout=5)
            assert r.status_code == 200
        except Exception:
            print("✗ Backend not reachable at", API, file=sys.stderr)
            sys.exit(1)

        if reset:
            await delete_all(client)
            print()

        # Seed invoices
        ok_inv = 0
        print("Creating invoices...")
        for inv in invoices:
            result = await post(client, "/invoices", inv, dry_run)
            if result:
                ok_inv += 1
                print(f"  ✓ {inv['invoice_number']}  {inv['client_name']:<32}  ${inv['total']:>10,.0f}  [{inv['status']}]")

        # Seed expenses
        ok_exp = 0
        print(f"\nCreating expenses ({len(expenses)} entries across 12 months)...")
        for exp in expenses:
            result = await post(client, "/expenses", exp, dry_run)
            if result:
                ok_exp += 1
        print(f"  ✓ {ok_exp}/{len(expenses)} expenses created")

        # Seed budgets
        ok_bud = 0
        print("\nCreating May 2026 budgets...")
        for bud in BUDGETS:
            result = await post(client, "/budgets", {**bud, "year": 2026, "month": 5}, dry_run)
            if result:
                ok_bud += 1
                print(f"  ✓ {bud['category']:<12}  limit ${bud['monthly_limit']:>8,.0f}/month")

    print(f"\n✅ Done — {ok_inv} invoices · {ok_exp} expenses · {ok_bud} budgets")
    paid = [i for i in invoices if i["status"] == "paid"]
    sent = [i for i in invoices if i["status"] == "sent"]
    over = [i for i in invoices if i["status"] == "overdue"]
    draft = [i for i in invoices if i["status"] == "draft"]
    print(f"   Invoice mix: {len(paid)} paid · {len(sent)} sent · {len(over)} overdue · {len(draft)} draft")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed DClaw Finance demo data")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    parser.add_argument("--reset", action="store_true", help="Delete existing data first")
    args = parser.parse_args()
    asyncio.run(main(args.dry_run, args.reset))
