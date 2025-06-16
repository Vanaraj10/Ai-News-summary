// DOM Elements
const urlInput = document.getElementById('urlInput');
const summarizeBtn = document.getElementById('summarizeBtn');
const btnContent = document.querySelector('.btn-content');
const loadingSpinner = document.querySelector('.loading-spinner');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const articleTitle = document.getElementById('articleTitle');
const sentimentBadge = document.getElementById('sentimentBadge');
const summaryContent = document.getElementById('summaryContent');
const entitiesContainer = document.getElementById('entitiesContainer');
const errorMessage = document.getElementById('errorMessage');

// State
let isLoading = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    urlInput.focus();
    
    summarizeBtn.addEventListener('click', handleSummarize);
    
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSummarize();
        }
    });
    
    urlInput.addEventListener('focus', function() {
        this.select();
    });
    
    // Input validation feedback
    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && isValidUrl(url)) {
            summarizeBtn.style.opacity = '1';
        } else {
            summarizeBtn.style.opacity = '0.7';
        }
    });
});

// Main summarize function
async function handleSummarize() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a valid URL');
        urlInput.focus();
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (must start with http:// or https://)');
        urlInput.focus();
        return;
    }
    
    setLoadingState(true);
    hideError();
    hideResults();
    
    try {
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to process article (${response.status})`);
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to summarize the article. Please check the URL and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(loading) {
    isLoading = loading;
    summarizeBtn.disabled = loading;
    
    if (loading) {
        btnContent.style.display = 'none';
        loadingSpinner.style.display = 'flex';
    } else {
        btnContent.style.display = 'flex';
        loadingSpinner.style.display = 'none';
    }
}

// Display results
function displayResults(data) {
    // Set article title
    articleTitle.textContent = data.title || 'Article Summary';
    
    // Set sentiment indicator
    setSentimentIndicator(data.sentiment);
    
    // Display summary points
    displaySummary(data.summary);
    
    // Display entities
    displayEntities(data.entities);
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

// Set sentiment indicator
function setSentimentIndicator(sentiment) {
    const sentimentLower = sentiment?.toLowerCase() || 'neutral';
    sentimentBadge.textContent = sentiment || 'Neutral';
    sentimentBadge.className = `sentiment-indicator sentiment-${sentimentLower}`;
}

// Display summary points
function displaySummary(summaryPoints) {
    summaryContent.innerHTML = '';
    
    if (!summaryPoints || !Array.isArray(summaryPoints)) {
        summaryContent.innerHTML = '<p class="no-content">No summary available.</p>';
        return;
    }
    
    summaryPoints.forEach((point, index) => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <div class="summary-number">${index + 1}</div>
            <div class="summary-text">${escapeHtml(point)}</div>
        `;
        summaryContent.appendChild(summaryItem);
    });
}

// Display entities
function displayEntities(entities) {
    entitiesContainer.innerHTML = '';
    
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
        entitiesContainer.innerHTML = '<span class="entity-tag">No entities found</span>';
        return;
    }
    
    entities.forEach(entity => {
        const entityTag = document.createElement('span');
        entityTag.className = 'entity-tag';
        entityTag.textContent = entity;
        entitiesContainer.appendChild(entityTag);
    });
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    hideResults();
    
    // Smooth scroll to error
    setTimeout(() => {
        errorSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

// Hide error
function hideError() {
    errorSection.style.display = 'none';
}

// Hide results
function hideResults() {
    resultsSection.style.display = 'none';
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to summarize
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
            handleSummarize();
        }
    }
    
    // Escape to clear/reset
    if (e.key === 'Escape') {
        if (isLoading) {
            return;
        }
        
        urlInput.value = '';
        hideResults();
        hideError();
        urlInput.focus();
        summarizeBtn.style.opacity = '0.7';
    }
});

// Add placeholder rotation for better UX
document.addEventListener('DOMContentLoaded', function() {
    const placeholderTexts = [
        'Paste your news article URL here...',
        'Try a BBC, CNN, or Reuters article...',
        'Enter any news article link...',
        'AI-powered article summarization...'
    ];
    
    let currentIndex = 0;
    
    function rotatePlaceholder() {
        if (!urlInput.value && document.activeElement !== urlInput) {
            urlInput.placeholder = placeholderTexts[currentIndex];
            currentIndex = (currentIndex + 1) % placeholderTexts.length;
        }
    }
    
    // Rotate placeholder every 4 seconds
    setInterval(rotatePlaceholder, 4000);
    
    // Add subtle animations when results are displayed
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe summary items for animation
    function observeNewElements() {
        const items = document.querySelectorAll('.summary-item, .entity-tag');
        items.forEach(item => {
            if (!item.hasAttribute('data-observed')) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(item);
                item.setAttribute('data-observed', 'true');
            }
        });
    }
    
    // Call this when results are displayed
    const originalDisplayResults = displayResults;
    displayResults = function(data) {
        originalDisplayResults(data);
        setTimeout(observeNewElements, 100);
    };
});
