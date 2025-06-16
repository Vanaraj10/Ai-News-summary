from fastapi import FastAPI,HTTPException
from schemas import ArticleRequest
from summarizer import scrape_article
from gemini_api import summarize_with_gemini

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/summarize")
def summarize_article(request: ArticleRequest):
    
    try:
        article_data = scrape_article(request.url)
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