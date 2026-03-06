from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

app = FastAPI(title="Resume Generator AI Service")

# Allow CORS so frontend can call directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local MVP, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

from utils import extract_text_from_pdf, extract_keywords_with_qwen, extract_structured_data

@app.post("/extract-keywords")
async def extract_resume_keywords(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        contents = await file.read()
        extracted_text = extract_text_from_pdf(contents)
        
        if not extracted_text.strip():
             # Basic handling for empty PDFs
             return {
                 "keywords": [],
                 "structured_data": {
                     "full_name": "",
                     "summary": "",
                     "skills": [],
                     "experience": ""
                 }
             }
             
        keywords = extract_keywords_with_qwen(extracted_text)
        structured = extract_structured_data(extracted_text)
        
        return {
            "keywords": keywords,
            "structured_data": structured,
            "extracted_text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from agent_services import get_ats_score, get_gap_analysis, get_linkedin_optimizer, get_interview_prep

class AgentRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None

@app.post("/ats-score")
async def ats_score_endpoint(request: AgentRequest):
    return {"result": get_ats_score(request.resume_text, request.job_description or "")}

@app.post("/gap-analysis")
async def gap_analysis_endpoint(request: AgentRequest):
    return {"result": get_gap_analysis(request.resume_text, request.job_description or "")}

@app.post("/linkedin-optimizer")
async def linkedin_optimizer_endpoint(request: AgentRequest):
    return {"result": get_linkedin_optimizer(request.resume_text)}

@app.post("/interview-prep")
async def interview_prep_endpoint(request: AgentRequest):
    return {"result": get_interview_prep(request.resume_text, request.job_description or "")}
