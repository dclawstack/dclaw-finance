from app.api.v1.invoices import router as invoices_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.dashboard import router as dashboard_router

__all__ = ["invoices_router", "expenses_router", "dashboard_router"]
