from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import router

app = FastAPI(title="Castlumen API", version="1.0.0")

# ✅ Production-ready CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Local development
        "https://castlumen.vercel.app",  # Vercel deployment
        "https://castlumen.com",  # Custom domain
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

@app.get("/")
async def health_check():
    return {
        "status": "healthy", 
        "message": "Castlumen API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

# ✅ Production server configuration
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
