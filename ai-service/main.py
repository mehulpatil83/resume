from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

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

from agent import run_resume_agent

@app.post("/generate", response_model=ResumeResponse)
async def generate_resume(request: ResumeRequest):
    result = run_resume_agent(request.current_resume, request.job_description)
    return {
        "tailored_resume": result["tailored_resume"],
        "analysis": result["analysis"]
    }

from utils import extract_text_from_pdf, extract_keywords_with_qwen

@app.post("/extract-keywords")
async def extract_resume_keywords(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        contents = await file.read()
        extracted_text = extract_text_from_pdf(contents)
        
        if not extracted_text.strip():
             # Fallback or just proceed with empty
             pass
             
        keywords = extract_keywords_with_qwen(extracted_text)
        
        return {
            "keywords": keywords,
            "extracted_text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

