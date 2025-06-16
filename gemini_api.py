import google.generativeai as genai
import os
import json

# Configure with API key from environment variable or fallback to hardcoded
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyCBvlcrpezINt5mwYdawr3vvETyrDCeIBI")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-1.5-flash")

def summarize_with_gemini(text: str,max_chars:int = 12000) -> str:

    if len(text) > max_chars:
        text = text[:max_chars]

    prompt = f"""
    You are a news article summarizer AI.

    Task:
    - Read the article text below
    - Provide 8 bullet point summary (short and informative)
    - Perform sentiment analysis: positive, neutral, or negative
    - Extract top 3 named entities (people, places, organizations)

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
    response_text = response.text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]  # Remove ```json
    if response_text.endswith("```"):
        response_text = response_text[:-3]  # Remove ```
    print(f"Gemini API response: {response.text}")
    try:
        return json.loads(response_text)
    except Exception:
        raise ValueError("Invalid response format from Gemini API. Expected JSON format.")