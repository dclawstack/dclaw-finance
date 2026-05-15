# DClaw Finance — Demo Data Reference

## Fictional Company Profile

**Company:** Meridian AI Technologies, Inc.
**Why "Meridian":** A fictional name used so demo financial figures are not mistaken for real DKube financials.
**Model based on:** DKube (dkube.io) — enterprise private AI & MLOps platform
**Founded:** 2019 · **Stage:** Series A (scaling toward Series B)
**Headcount:** ~40 employees · **Offices:** San Jose, CA (HQ) · Hyderabad, India (Engineering)
**Revenue model:** Annual/quarterly platform licensing + professional services engagements

### What the company sells

Meridian AI Technologies delivers enterprise private AI infrastructure. Product catalog mirrors DKube's real offerings, priced for the Indian enterprise market:

| Product | Type | INR Price |
|---------|------|-----------|
| DKubeX Enterprise Platform License | Annual SaaS | ₹2.50 Cr / year |
| DKubeX Enterprise Platform License | Quarterly SaaS | ₹75 L / quarter |
| DKube MLOps Platform License | Annual SaaS | ₹1.50 Cr / year |
| DKube MLOps Platform License | Quarterly SaaS | ₹45 L / quarter |
| QueriLynx — Multi-agent data exploration | Blueprint deployment | ₹75 L |
| DocMind — AI document intelligence | Blueprint deployment | ₹60 L |
| Virtual Teaching Assistant | Blueprint deployment | ₹50 L |
| 12-Week Professional Services Engagement | Services (monthly billing) | ₹25 L / month |
| AI Infrastructure Assessment & Roadmap | One-time | ₹30 L |
| GenAI Security & Compliance Audit | One-time | ₹40 L |
| Custom RAG Pipeline Development | Project | ₹80 L |
| Enterprise Support & SLA Contract | Annual | ₹25 L / year |
| MLOps Team Training & Certification | Per cohort | ₹10 L |
| On-premise GPU Cluster Configuration | One-time | ₹20 L |
| Model Fine-tuning & Optimization | Project | ₹15 L |

---

## Client Roster (12 Enterprise Clients)

| # | Client | Industry | Revenue (12mo) | Profitability Score | Relationship |
|---|--------|----------|----------------|---------------------|--------------|
| 1 | **JPMorgan Chase** | Investment Banking | ₹7.35 Cr | 89.8 | Flagship — DKubeX + QueriLynx finance analytics |
| 2 | **TIAA Financial Services** | Financial Services | ₹7.05 Cr | 67.1 | Long-term — DKubeX + RAG mortgage AI (₹2.5Cr OVERDUE) |
| 3 | **Apollo Global Management** | Private Equity | ₹5.75 Cr | 84.8 | Strategic — platform + SLA + ongoing services |
| 4 | **Altos Labs** | Life Sciences / Biotech | ₹5.45 Cr | 81.9 | Growing — MLOps for drug discovery |
| 5 | **Allianz Life Sciences** | Life Sciences / Insurance | ₹4.35 Cr | 77.0 | Mid-size — DKubeX + DocMind |
| 6 | **MetLife Group** | Insurance | ₹3.90 Cr | 73.0 | Strategic — custom RAG + compliance audit |
| 7 | **VMware by Broadcom** | Cloud Infrastructure | ₹3.65 Cr | 65.0 | Established — DKubeX quarterly + GPU config (₹75L OVERDUE) |
| 8 | **Cisco Systems** | Enterprise Technology | ₹2.80 Cr | 70.0 | Large — platform + training + services |
| 9 | **BuildFirst Construction** | Construction / Procurement | ₹2.10 Cr | 68.0 | Mid-size — QueriLynx procurement analytics |
| 10 | **StackPath Technologies** | Cloud / CDN | ₹1.90 Cr | 66.0 | Mid-size — MLOps platform + professional services |
| 11 | **Sequoia Legal Partners** | Legal Services | ₹1.60 Cr | 72.0 | Mid-size — DocMind legal document automation |
| 12 | **Pacific University System** | Higher Education | ₹1.20 Cr | 60.0 | Mid-size — Virtual Teaching Assistant AI |

> **Profitability score** = revenue weight 70% + outstanding balance weight 30%. Computed live by `GET /api/v1/clients/profitability`.

---

## Invoice Data (50 Invoices · May 2025 – May 2026)

### Status Distribution

| Status | Count | Rationale |
|--------|-------|-----------|
| Paid | 42 | All invoices older than ~90 days |
| Sent | 4 | Invoices from March–May 2026 awaiting payment |
| Overdue | 2 | TIAA (₹2.5 Cr, Feb 2026) · VMware (₹75 L, Mar 2026) |
| Draft | 2 | Current-month (May 2026) in-progress |

### Monthly Invoice Volume & Paid Revenue

| Month | Invoices | Paid Revenue | Notes |
|-------|----------|-------------|-------|
| May 2025 | 3 | ₹4.55 Cr | Strong kickoff — DKubeX annual + VMware MLOps |
| Jun 2025 | 4 | ₹4.60 Cr | TIAA + JPMorgan + Allianz blueprints |
| Jul 2025 | 3 | ₹2.55 Cr | Services month — smaller ticket items |
| Aug 2025 | 4 | ₹1.80 Cr | Slow month — assessments + blueprints |
| Sep 2025 | 4 | ₹4.70 Cr | JPMorgan renewal + Altos MLOps annual |
| Oct 2025 | 5 | ₹2.20 Cr | MetLife RAG + quarterly renewals |
| Nov 2025 | 4 | ₹5.25 Cr | Allianz DKubeX + BuildFirst MLOps |
| Dec 2025 | 3 | ₹1.20 Cr | Holiday freeze — lowest revenue month |
| Jan 2026 | 4 | ₹3.90 Cr | JPMorgan annual renewal |
| Feb 2026 | 5 | ₹2.30 Cr | TIAA ₹2.5Cr overdue · others paid |
| Mar 2026 | 4 | ₹2.00 Cr | VMware ₹75L overdue · Apollo/Allianz paid |
| Apr 2026 | 4 | ₹3.55 Cr | Altos annual renewal + TIAA partial |
| May 2026 | 3 | ₹0 | Draft/sent — current month |

> Revenue recognised on `paid` status only. May 2026 invoices still open.

---

## Expense Data (207 Entries · May 2025 – May 2026)

### Monthly Burn Rate by Category

| Category | Monthly Range (INR) | Notes |
|----------|---------------------|-------|
| **Salary** | ₹1.43 Cr – ₹1.55 Cr | Grows ~0.7%/month (annual raises + team growth) |
| **Software** | ₹14 L – ₹16 L | AWS GPU workloads grow through the year |
| **Marketing** | ₹3.5 L – ₹85 L | Large spikes at re:Invent (₹80L), NeurIPS (₹40L), Gartner (₹60L) |
| **Travel** | ₹5 L – ₹50 L | Peaks at Jan all-hands (₹50L) and Mar India→SJ sync (₹30L) |
| **Office** | ₹16 L | Fixed: SJ HQ ₹12L + Hyderabad ₹2.5L + utilities ₹1.5L |
| **Other** | ₹7 L – ₹12 L | Legal ₹5L/mo + insurance ₹2L/mo + quarterly audit/pen-test |

### Headcount & Salary Structure

| Team | Location | Staff | LPA Range | Monthly Payroll |
|------|----------|-------|-----------|-----------------|
| Engineering | Hyderabad, India | 20 | ₹8–16 LPA (avg ₹12L) | ₹20 L/month |
| Engineering & Product | San Jose, CA | 12 | ₹60–1 Cr LPA (avg ₹80L) | ₹80 L/month |
| Sales, Ops & Executive | San Jose, CA | 8 | ₹40–1 Cr LPA (avg ₹65L) | ₹43 L/month |
| **Total** | | **40 staff** | | **₹1.43 Cr/month** |

### Key Software Vendors (Monthly)

| Vendor | Description | Monthly Cost |
|--------|-------------|-------------|
| Amazon Web Services | EC2, S3, EKS, GPU instances | ₹8 L → ₹10 L (growing) |
| SaaS bundle | GitHub Enterprise, Jira, Slack, Zoom, Notion (55 seats) | ₹2.5 L |
| Salesforce CRM | 12 sales licenses | ₹2 L |
| Datadog | APM & infrastructure monitoring | ₹1.5 L |

### Marketing Conference Spikes

| Month | Event | Cost |
|-------|-------|------|
| Oct 2025 | AWS re:Invent — Premier Booth & Sponsorship (Las Vegas) | ₹80 L |
| Nov 2025 | NeurIPS 2025 — Gold Sponsor & Workshop (Vancouver) | ₹40 L |
| Nov 2025 | Forrester AI & Data Summit — Speaking Slot & Booth | ₹20 L |
| Feb 2026 | Gartner Data & AI Summit — Premier Sponsor (Orlando) | ₹60 L |
| May 2026 | ODSC East 2026 — Conference Sponsorship (Boston) | ₹15 L |

### Travel Events

| Month | Event | Cost |
|-------|-------|------|
| Jun 2025 | Sales trip — New York (JPMorgan & Apollo, 4 reps) | ₹15 L |
| Jul 2025 | Engineering sprint sync — Hyderabad | ₹25 L |
| Sep 2025 | BD trip — Chicago (MetLife & Allianz HQ) | ₹10 L |
| Oct 2025 | Conference travel — Las Vegas re:Invent (12 staff) | ₹20 L |
| Nov 2025 | Conference travel — Vancouver NeurIPS (6 engineers) | ₹15 L |
| Jan 2026 | Annual Sales Kickoff — San Jose (all-hands, India + US) | ₹50 L |
| Mar 2026 | Engineering sync — Hyderabad → San Jose (6 engineers) | ₹30 L |

### Legal & Compliance

| Vendor | Description | Cost |
|--------|-------------|------|
| Cooley LLP | IP protection, contract review & compliance | ₹5 L / month |
| Chubb Insurance | D&O + cybersecurity liability premium | ₹2 L / month |
| Deloitte | Quarterly tax advisory & accounting | ₹4 L / quarter |
| NCC Group | Cybersecurity penetration testing | ₹5 L / quarter |

---

## Budget Data (May 2026 — Current Month)

Limits set at ~130% of actual May 2026 spend, keeping all categories safely under the 80% breach threshold:

| Category | Monthly Limit | Actual Spend | Utilization | Status |
|----------|--------------|-------------|-------------|--------|
| Salary | ₹2.00 Cr | ₹1.55 Cr | 77.5% | ✓ On track |
| Software | ₹22 L | ₹15.8 L | 71.8% | ✓ On track |
| Marketing | ₹25 L | ₹18.5 L | 74.0% | ✓ On track (ODSC this month) |
| Travel | ₹20 L | ₹5 L | 25.0% | ✓ Well under |
| Office | ₹22 L | ₹16 L | 72.7% | ✓ On track |
| Other | ₹10 L | ₹7 L | 70.0% | ✓ On track |

> AI breach suggestions trigger only when utilization ≥ 80%. No category currently in breach.

---

## Financial Story This Data Tells

### Full-year performance
| Metric | Value |
|--------|-------|
| Annual paid revenue | ₹39.05 Cr |
| Annual expenses | ₹29.41 Cr |
| Net profit | ₹9.64 Cr |
| Net margin | **24.7%** |

### Revenue trajectory
Revenue grows from ₹4.55 Cr/month (May 2025) to ₹5.25 Cr/month (Nov 2025 peak), with a realistic
December dip (₹1.2 Cr — holiday procurement freeze) and a rebound through Q1 2026. The 12-month
cumulative trend is visible in the dashboard trend chart.

### Cost structure
Salary dominates at 66% of total spend (₹19.4 Cr of ₹29.4 Cr) — typical for a high-growth,
engineering-led AI company. AWS costs grow through the year as customer GPU workloads scale.
Marketing concentrates around 4-5 major AI/ML conferences — realistic for DKube-scale companies.

### Profitability arc
- **May–Aug 2025:** Near breakeven or slight monthly loss during slow deal months
- **Sep–Nov 2025:** Strong profitability as enterprise contracts compound
- **Dec 2025:** Monthly loss (holiday freeze) — predictable seasonal pattern
- **Jan–Apr 2026:** Consistent profitability · 15–25% monthly margin
- **Overall:** 24.7% annual net margin — Series B fundraising territory

### Overdue invoices
- **TIAA** (₹2.5 Cr, Feb 2026) — large enterprise; net-90 payment terms common
- **VMware** (₹75 L, Mar 2026) — procurement delay post-Broadcom acquisition
Both are visible on the dashboard and in the invoice list with `overdue` status.

### Anomaly candidates
The anomaly detection feature will flag:
- October/November marketing spikes (re:Invent ₹80L, NeurIPS ₹40L) — z-score > 2 vs monthly base
- January all-hands offsite (₹50L travel) vs monthly travel average
- March India→SJ engineering sync (₹30L)

---

## Reference Companies Used for Benchmarking

| Company | Stage | ARR | Employees | Notes |
|---------|-------|-----|-----------|-------|
| **DKube** | Growth | ~₹42–125 Cr est. | 50–100 | Primary reference |
| **Weights & Biases** | Series C | ~₹415 Cr | ~300 | MLOps, upper bound |
| **Arize AI** | Series B | ~₹165 Cr | ~120 | ML observability |
| **Fiddler AI** | Series B | ~₹125 Cr | ~100 | ML monitoring |
| **Valohai** | Series A | ~₹42 Cr | ~60 | MLOps platform |
| **ClearML (Allegro AI)** | Series B | ~₹83 Cr | ~80 | Open-core MLOps |

Meridian AI is modeled at the **lower-mid range** of this peer group — product-market fit found,
scaling toward Series B, with a cost structure reflecting dual India+US offices.

---

## Seed Script

```bash
# Dependencies
pip install httpx

# Backend must be running at localhost:8096
# Seed fresh data
python scripts/seed_data.py

# Wipe everything and re-seed (use after pricing/expense changes)
python scripts/seed_data.py --reset

# Preview what would be created — no writes
python scripts/seed_data.py --dry-run
```

### What the script creates
- **50 invoices** — 13 months, 12 clients, all products from the service catalog
- **207 expense entries** — salary (monthly), software (monthly), marketing (base + conference spikes), travel (per event), office (monthly fixed), other (monthly + quarterly)
- **6 budgets** — May 2026 limits at 130% of actuals

### Repricing / reconfiguring
To change pricing or headcount, edit the `SVC` list or `build_expenses()` in `scripts/seed_data.py`, then run `--reset`. The `--dry-run` flag prints a revenue vs expense summary before committing.
