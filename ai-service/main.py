from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI(title="Resume Generator AI Service")

class ResumeRequest(BaseModel):
    current_resume: Dict[str, Any]
    job_description: Optional[str] = None
    user_preferences: Optional[Dict[str, Any]] = None

class ResumeResponse(BaseModel):
    tailored_resume: Dict[str, Any]
    analysis: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

from .agent import run_resume_agent

@app.post("/generate", response_model=ResumeResponse)
async def generate_resume(request: ResumeRequest):
    result = run_resume_agent(request.current_resume, request.job_description)
    return {
        "tailored_resume": result["tailored_resume"],
        "analysis": result["analysis"]
    }
