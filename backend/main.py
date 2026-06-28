from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf
from analyzer import analyze_resume

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Smart Resume Analyzer API is running!"}

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_role: str = Form(default="Software Engineer")
):
    contents = await file.read()
    resume_text = extract_text_from_pdf(contents)
    result = analyze_resume(resume_text, job_role)
    return result