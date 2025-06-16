import google.generativeai as genai
import os
import json

genai.configure(api_key="AIzaSyCBvlcrpezINt5mwYdawr3vvETyrDCeIBI")

model = genai.GenerativeModel("gemini-1.5-flash")

def summarize_with_gemini(text: str,max_chars:int = 12000) -> str:

    if len(text) > max_chars:
        text = text[:max_chars]

    prompt = f"""
    You are a news article summarizer AI.

    Task:
    - Read the article text below
    - Provide 3-5 bullet point summary (short and informative)
    - Perform sentiment analysis: positive, neutral, or negative
    - Extract top 3-5 named entities (people, places, organizations)

    Article:
    \"\"\"
    {text}
    \"\"\"

    Respond ONLY in valid JSON like:
    {{
        "summary": ["point 1", "point 2",...],
        "sentiment": "neutral",
        "entities": ["entity1", "entity2"]
    }}
    """

    response = model.generate_content(prompt)
    try:
        return json.loads(response.text)
    except Exception:
        raise ValueError("Invalid response format from Gemini API. Expected JSON format.")