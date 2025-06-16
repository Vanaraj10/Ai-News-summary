from newspaper import Article

def scrape_article(url :str) -> dict:
    try:
        article = Article(url)
        article.download()
        article.parse()

        if not article.text.strip():
            raise ValueError("The article text is empty after parsing.")
        
        return {
            "title": article.title,
            "text": article.text,
        }
    except Exception as e:
        raise Exception(f"Failed to scrape article: {e}")