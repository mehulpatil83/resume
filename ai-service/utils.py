import io
import json
import requests
import pdfplumber
from typing import List

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_keywords_with_qwen(text: str) -> List[str]:
    # Truncate text to avoid token limits if necessary, though 1.5b handles context reasonable well
    truncated_text = text[:8000]
    
    prompt = f"""
    Analyze the following resume text and extract the top 15 technical skills, tools, and keywords relevant to the candidate's profile.
    CRITICAL: You must ONLY extract skills and keywords that are EXPLICITLY mentioned in the text below. 
    DO NOT hallucinate, guess, or infer any skills that are not literally written in the document. No bluffing.
    Return STRICTLY a JSON list of strings (e.g., ["Python", "React"]). 
    Do not include any explanation or markdown formatting.

    Resume Text:
    {truncated_text}
    """
    
    try:
        # We try to use a generic 'qwen' or 'qwen2.5-coder' model name. 
        # You might need to adjust this based on what's installed via `ollama pull ...`
        model_name = "qwen2.5-coder:1.5b" 
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name, 
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=60 # Wait up to 60s
        )
        response.raise_for_status()
        result_json = response.json()
        response_text = result_json.get("response", "[]")
        
        # Clean up potential markdown code blocks
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        
        keywords = json.loads(clean_text)
        if isinstance(keywords, list):
            return keywords
        return []
        
    except Exception as e:
        print(f"Error calling LLM: {e}")
        print("Falling back to exact text-matching mode since Ollama appears to be offline.")
        
        # Fallback to exact text matching so we don't bluff
        common_skills = [
            "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin", 
            "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", ".NET", 
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "AWS", "Azure", "GCP", "Docker", 
            "Kubernetes", "Git", "CI/CD", "Linux", "Unix", "Agile", "Scrum", "Project Management", "Leadership", 
            "Communication", "Data Analysis", "Machine Learning", "Data Science", "AI", "DevOps", "Frontend", 
            "Backend", "Full Stack", "Microservices", "REST", "GraphQL", "Jenkins", "Terraform", "Ansible",
            "Excel", "Sales", "Marketing", "Customer Service", "Accounting", "Problem Solving"
        ]
        
        text_lower = text.lower()
        found = []
        for skill in common_skills:
            if skill.lower() in text_lower:
                found.append(skill)
        
        return found[:15]

def extract_structured_data(text: str) -> dict:
    """
    Uses the LLM to extract Name, Summary, and Experience from the resume text.
    """
    prompt = f"""
    Analyze the following resume text and extract:
    1. Full Name
    2. Professional Summary
    3. Core Skills (list)
    4. Work Experience (keep formatting)
    
    Return STRICTLY a JSON object with keys: "full_name", "summary", "skills", "experience".
    No other text.
    
    Resume Text:
    {text[:8000]}
    """
    
    try:
        model_name = "qwen2.5-coder:1.5b" 
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name, 
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=10 # Fast fail for startup/empty env
        )
        response.raise_for_status()
        result_json = response.json()
        return json.loads(result_json.get("response", "{}"))
    except Exception as e:
        print(f"Structured extraction LLM call failed: {e}")
        # Basic heuristic fallback
        return {
            "full_name": "Extracted Lead",
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "skills": [],
            "experience": text
        }
