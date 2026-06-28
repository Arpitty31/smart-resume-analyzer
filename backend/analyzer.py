from groq import Groq
import json
import os

client = Groq(api_key=os.environ.get("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"))

def analyze_resume(resume_text: str, job_role: str = "Software Engineer") -> dict:
    prompt = f"""
You are an expert resume analyzer and career coach.

Analyze the following resume for a {job_role} position and provide:

1. ATS Score (out of 100)
2. Strengths - What's good (3-5 points)
3. Weaknesses - What's missing (3-5 points)
4. Skills Gap - Important skills missing for {job_role}
5. Suggestions - Specific actionable improvements (3-5 points)
6. Overall Grade - A/B/C/D with reason

Resume:
{resume_text}

Respond in this EXACT JSON format only, no extra text, no markdown backticks:
{{
    "ats_score": 75,
    "grade": "B",
    "strengths": ["point1", "point2", "point3"],
    "weaknesses": ["point1", "point2", "point3"],
    "skills_gap": ["skill1", "skill2", "skill3"],
    "suggestions": ["point1", "point2", "point3"],
    "summary": "One line overall summary"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    text = response.choices[0].message.content.strip()

    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    result = json.loads(text)
    return result