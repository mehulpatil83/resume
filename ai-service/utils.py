import io
import json
import requests
from pypdf import PdfReader
from typing import List

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_keywords_with_qwen(text: str) -> List[str]:
    # Truncate text to avoid token limits if necessary, though 1.5b handles context reasonable well
    truncated_text = text[:8000]
    
    prompt = f"""
    Analyze the following resume text and extract the top 15 technical skills, tools, and keywords relevant to the candidate's profile.
    Return STRICTLY a JSON list of strings (e.g., ["Python", "React", "Project Management"]). 
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
        print("Falling back to MOCK KEYWORDS mode since Ollama appears to be offline or failing.")
        # Fallback to mock data so the app flow isn't broken for the user
        return ["Communication", "Leadership", "Python (Mock)", "Project Management", "Strategic Planning", "Data Analysis"]
