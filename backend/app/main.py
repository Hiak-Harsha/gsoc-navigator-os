import asyncio
import os
import httpx
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, SessionLocal
from app.models.monitoring import MonitoredSource
from app.services.monitoring_service import monitoring_service
from app.services.llm_service import llm_service

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

async def keep_alive_worker():
    """Pings the public service URL externally every 10 minutes to prevent Render free instance from idling into sleep."""
    external_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("KEEP_ALIVE_URL") or "https://gsoc-navigator-os.onrender.com"
    # In local development without explicit KEEP_ALIVE_URL, do not ping
    if settings.ENVIRONMENT != "production" and not os.getenv("KEEP_ALIVE_URL"):
        print("[KeepAlive] Local development environment detected. Keep-alive worker standing by.")
        return

    external_url = external_url.rstrip("/")
    ping_url = f"{external_url}/health"
    print(f"[KeepAlive] Active. Pinging {ping_url} every 10 minutes to prevent idle sleep.")
    
    # Initial grace period before first ping
    await asyncio.sleep(60)
    while True:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(ping_url)
                print(f"[KeepAlive] Self-pinged {ping_url} -> Status {resp.status_code}")
        except Exception as e:
            print(f"[KeepAlive] Notice during self-ping: {e}")
        await asyncio.sleep(600) # 10 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    print("[GSoC Navigator OS] Initializing database tables...")
    init_db()
    
    # Start background worker tasks
    monitoring_task = asyncio.create_task(background_monitoring_worker())
    keep_alive_task = asyncio.create_task(keep_alive_worker())
    yield
    monitoring_task.cancel()
    keep_alive_task.cancel()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="An Intelligent, Evidence-Based Open-Source & GSoC Preparation Operating System",
    lifespan=lifespan
)

# Ensure DB initialization on app import for tests and clients
init_db()

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

# System & Keep-Alive Endpoints
@app.get("/health")
@app.get("/api/health")
def get_health_status():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "target_gsoc_year": 2027
    }

@app.get("/api/system/ai-status")
async def get_system_ai_status():
    ai_health = await llm_service.check_health()
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ai_status": ai_health,
        "github_token_configured": bool(settings.GITHUB_TOKEN),
        "monitoring_interval_seconds": settings.MONITORING_INTERVAL_SECONDS
    }

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
        if full_path in ["health", "api/health"] or full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
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
