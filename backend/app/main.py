import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, SessionLocal
from app.models.monitoring import MonitoredSource
from app.services.monitoring_service import monitoring_service

# Routers
from app.api.routes_profile import router as profile_router
from app.api.routes_gsoc import router as gsoc_router
from app.api.routes_orgs import router as orgs_router
from app.api.routes_repos import router as repos_router
from app.api.routes_issues import router as issues_router
from app.api.routes_coaching import router as coaching_router
from app.api.routes_contributions import router as contributions_router
from app.api.routes_proposals import router as proposals_router
from app.api.routes_monitoring import router as monitoring_router
from app.api.routes_dashboard import router as dashboard_router

# Background Worker Loop
async def background_monitoring_worker():
    """Persistent background task that monitors official sources periodically."""
    print("[GSoC Navigator OS Worker] Background monitoring service started.")
    while True:
        try:
            db = SessionLocal()
            try:
                monitoring_service.seed_default_sources(db)
                sources = db.query(monitoring_service.MonitoredSource).all()
                for s in sources:
                    await monitoring_service.check_source(s, db)
            finally:
                db.close()
        except Exception as e:
            print(f"[Worker Error] Monitoring loop encountered error: {e}")
        
        # Sleep for configured interval
        await asyncio.sleep(settings.MONITORING_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    print("[GSoC Navigator OS] Initializing database tables...")
    init_db()
    
    # Start background worker task
    worker_task = asyncio.create_task(background_monitoring_worker())
    yield
    worker_task.cancel()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="An Intelligent, Evidence-Based Open-Source & GSoC Preparation Operating System",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(gsoc_router, prefix="/api")
app.include_router(orgs_router, prefix="/api")
app.include_router(repos_router, prefix="/api")
app.include_router(issues_router, prefix="/api")
app.include_router(coaching_router, prefix="/api")
app.include_router(contributions_router, prefix="/api")
app.include_router(proposals_router, prefix="/api")
app.include_router(monitoring_router, prefix="/api")

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Static Assets and SPA Mounting
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend-app/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "online", "app": settings.APP_NAME}
else:
    @app.get("/")
    def health_check():
        return {
            "status": "online",
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "docs_url": "/docs"
        }
