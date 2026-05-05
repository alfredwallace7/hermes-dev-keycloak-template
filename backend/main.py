"""Hermes Auth Demo API — entry point.

FastAPI application with modular routers under /api/v1 prefix.
Serves the SPA frontend in production builds.
"""

import os
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routers import auth_router, admin_router, users_router

app = FastAPI(title="Hermes Auth Demo API", version="1.0.0")

# --- CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount routers under /api/v1 prefix ---
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")


# --- SPA serving (production build) ---
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the SPA for any non-API route."""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        html_file = FRONTEND_DIST / "index.html"
        if html_file.exists():
            return FileResponse(str(html_file))
        raise HTTPException(status_code=404, detail="Frontend not built")


@app.get("/")
async def root():
    """Serve SPA index.html at root."""
    if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
        return FileResponse(str(FRONTEND_DIST / "index.html"))
    return {"message": "Hermes Auth Demo API", "status": "running"}
