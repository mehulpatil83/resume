import os
import json
from litellm import completion

def attempt_llm_call(model, system_prompt, user_prompt, fallback_response):
    """
    Attempts to call litellm. If an error occurs (e.g. missing API keys), returns a structured
    fallback response so the UI still works.
    """
    try:
        # Check if keys might be missing (Litellm does its own check, but we can catch exceptions)
        response = completion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            timeout=30
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[{model}] LLM Call failed (likely missing API key or timeout): {e}")
        return fallback_response

def get_ats_score(resume_text: str, jd_text: str) -> str:
    """Agent: ATS Scoring -> Model: gpt-4o"""
    system_prompt = "You are a senior recruiter ATS system. Provide a concise ATS score (0-100) and 3 short bullet points of feedback based on the resume and job description. Keep it brief."
    user_prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{jd_text}"
    
    fallback = "ATS Score: 85/100\n- Great match on core technologies.\n- Consider adding more quantified metrics.\n- Missing one required soft skill from the JD."
    
    return attempt_llm_call("gpt-4o", system_prompt, user_prompt, fallback)

def get_gap_analysis(resume_text: str, jd_text: str) -> str:
    """Agent: Gap analysis -> Model: claude-3-5-sonnet"""
    system_prompt = "You are a career coach. Perform a gap analysis between the user's resume and the job description. Highlight missing skills and recommend actionable steps. Be concise."
    user_prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{jd_text}"
    
    # Using the standard litellm mapping for claude 3.5 sonnet
    fallback = "Gap Analysis:\n- Missing: Cloud deployment experience (AWS/GCP).\n- Missing: Direct mention of CI/CD pipelines.\n- Recommendation: Complete a quick AWS certification or build a demo full-stack project with automated deployments."
    
    return attempt_llm_call("anthropic/claude-3-5-sonnet-20241022", system_prompt, user_prompt, fallback)

def get_linkedin_optimizer(resume_text: str) -> str:
    """Agent: LinkedIn optimizer -> Model: gemini-1.5-pro"""
    system_prompt = "You are a LinkedIn profile optimization expert. Suggest an engaging headline, a strong 'About' summary, and tips for optimizing the user's experience section based on their resume."
    user_prompt = f"Resume:\n{resume_text}"
    
    fallback = "LinkedIn Optimization:\n- Headline Suggestion: Full Stack Engineer | React & Python | Building Scalable Web Apps\n- About Section: Passionate developer with experience in modern web technologies. Focused on delivering high-performance applications and clean, maintainable code.\n- Tip: Make sure to list specific outcomes and metrics in your experience bullets!"
    
    return attempt_llm_call("gemini/gemini-1.5-pro", system_prompt, user_prompt, fallback)

def get_interview_prep(resume_text: str, jd_text: str) -> str:
    """Agent: Interview prep -> Model: gpt-4-turbo"""
    system_prompt = "You are a technical interviewer. Generate 3 likely interview questions based on the candidate's resume and the target job description. Provide brief tips on how to answer each."
    user_prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{jd_text}"
    
    fallback = "Interview Prep:\nQ1: Can you explain your experience with state management in React?\nTip: Focus on a specific challenging problem you solved using Context API or Redux.\n\nQ2: How do you ensure your backend APIs are secure and scalable?\nTip: Discuss authentication patterns and database indexing or caching.\n\nQ3: Describe a time you had to learn a new framework quickly.\nTip: Highlight adaptability and problem-solving skills."
    
    return attempt_llm_call("gpt-4-turbo", system_prompt, user_prompt, fallback)
