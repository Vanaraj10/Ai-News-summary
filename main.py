from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from schemas import ArticleRequest
from summarizer import scrape_article
from gemini_api import summarize_with_gemini
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files - this must come after other routes to avoid conflicts
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    from fastapi.responses import FileResponse
    return FileResponse('static/index.html')

@app.post("/summarize")
def summarize_article(request: ArticleRequest):
    
    try:
        article_data = scrape_article(str(request.url))
        gemini_summary = summarize_with_gemini(article_data["text"])
        return {
            "title": article_data["title"],
            "summary": gemini_summary["summary"],
            "sentiment": gemini_summary["sentiment"],
            "entities": gemini_summary["entities"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )