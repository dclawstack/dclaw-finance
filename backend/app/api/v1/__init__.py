from app.api.v1.invoices import router as invoices_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.finance import router as forecast_router
from app.api.v1.reports import router as reports_router
from app.api.v1.clients import router as clients_router
from app.api.v1.budgets import router as budgets_router
from app.api.v1.chat import router as chat_router
from app.api.v1.demo import router as demo_router
from app.api.v1.cash_flow import router as cash_flow_router
from app.api.v1.testsprite import router as testsprite_router

__all__ = [
    "invoices_router",
    "expenses_router",
    "dashboard_router",
    "forecast_router",
    "reports_router",
    "clients_router",
    "budgets_router",
    "chat_router",
    "demo_router",
    "cash_flow_router",
    "testsprite_router",
]
