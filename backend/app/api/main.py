from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health
from app.api.v1 import (
    invoices_router,
    expenses_router,
    dashboard_router,
    forecast_router,
    reports_router,
    clients_router,
    budgets_router,
    chat_router,
    demo_router,
    cash_flow_router,
    testsprite_router,
)
from app.core.auth import require_auth
from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="DClaw Finance",
        version="1.2.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3014",
            "http://localhost:3000",
            "http://localhost:3007",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _auth = [Depends(require_auth)]

    app.include_router(health.router)
    app.include_router(invoices_router,   prefix="/api/v1", dependencies=_auth)
    app.include_router(expenses_router,   prefix="/api/v1", dependencies=_auth)
    app.include_router(dashboard_router,  prefix="/api/v1", dependencies=_auth)
    app.include_router(forecast_router,   prefix="/api/v1", dependencies=_auth)
    app.include_router(reports_router,    prefix="/api/v1", dependencies=_auth)
    app.include_router(clients_router,    prefix="/api/v1", dependencies=_auth)
    app.include_router(budgets_router,    prefix="/api/v1", dependencies=_auth)
    app.include_router(chat_router,       prefix="/api/v1", dependencies=_auth)
    app.include_router(cash_flow_router,  prefix="/api/v1", dependencies=_auth)
    app.include_router(demo_router,       prefix="/api/v1")
    app.include_router(testsprite_router, prefix="/api/v1")

    return app


app = create_app()
