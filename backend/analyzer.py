from groq import Groq
import json
import os

client = Groq(api_key=os.environ.get("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"))
client = Groq(api_key=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)

def analyze_resume(resume_text: str, job_role: str = "Software Engineer") -> dict:
    prompt = f"""
You are a strict and detailed resume analyzer. Analyze this SPECIFIC resume carefully.

Job Role: {job_role}

Resume Content:
{resume_text}

Based on the ACTUAL content of this resume above, provide a detailed analysis.
Be specific - mention actual skills, projects, and experiences from the resume.
Do NOT give generic advice. Every point must reference something specific from this resume.

Return ONLY this JSON (no markdown, no extra text):
{{
    "ats_score": <calculate based on actual resume content>,
    "grade": "<A/B/C/D based on actual quality>",
    "strengths": [
        "<specific strength from THIS resume>",
        "<specific strength from THIS resume>",
        "<specific strength from THIS resume>"
    ],
    "weaknesses": [
        "<specific weakness found in THIS resume>",
        "<specific weakness found in THIS resume>",
        "<specific weakness found in THIS resume>"
    ],
    "skills_gap": [
        "<skill missing for {job_role} not found in resume>",
        "<skill missing for {job_role} not found in resume>",
        "<skill missing for {job_role} not found in resume>"
    ],
    "suggestions": [
        "<specific actionable suggestion for THIS resume>",
        "<specific actionable suggestion for THIS resume>",
        "<specific actionable suggestion for THIS resume>"
    ],
    "summary": "<one line summary mentioning candidate's name or specific details from resume>"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    text = response.choices[0].message.content.strip()

    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    result = json.loads(text)
    return result