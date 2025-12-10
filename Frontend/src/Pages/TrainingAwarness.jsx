// TrainingAwareness.jsx
import React, { useState, useEffect } from 'react';
import './TrainingAwareness.css';
import API from '../API/api_req';

const TrainingAwareness = () => {
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Fetch articles from backend
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await API.get("/articles");
                setArticles(res.data);
            } catch (error) {
                console.log("Error fetching articles:", error);
            }
        };
        fetchArticles();
    }, []);

    const categories = [
        { id: 'all', name: 'All Topics', icon: '📚' },
        { id: 'segregation', name: 'Waste Segregation', icon: '🗑️' },
        { id: 'recycling', name: 'Recycling', icon: '♻️' },
        { id: 'hazardous', name: 'Hazardous Waste', icon: '⚠️' },
        { id: 'government', name: 'Government Schemes', icon: '🏛️' },
        { id: 'technology', name: 'Technology', icon: '⚡' },
        { id: 'community', name: 'Community', icon: '👥' }
    ];

    const difficultyLevels = {
        beginner: { label: 'Beginner', color: '#4CAF50' },
        intermediate: { label: 'Intermediate', color: '#FF9800' },
        advanced: { label: 'Advanced', color: '#F44336' },
        all: { label: 'All Levels', color: '#2196F3' }
    };

    const filteredArticles =
        categoryFilter === 'all'
            ? articles
            : articles.filter(article => article.category === categoryFilter);

    const handleReadArticle = (article) => {
        setSelectedArticle(article);
    };

    const handleCloseArticle = () => {
        setSelectedArticle(null);
    };

    const handleCategoryFilter = (categoryId) => {
        setCategoryFilter(categoryId);
    };

    return (
        <div className="training-awareness-page">
            <br /><br />

            <div className="container">

                {/* CATEGORY FILTERS */}
                <div className="category-filters">
                    <h3><span className="filter-icon">📂</span> Browse by Category</h3>
                    <div className="filter-buttons">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`filter-button ${categoryFilter === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryFilter(category.id)}
                            >
                                <span className="button-icon">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="training-main-content">

                    {/* ARTICLE GRID */}
                    <div className="articles-grid">
                        {filteredArticles.map(article => (
                            <div
                                key={article._id}
                                className="article-card"
                                onClick={() => handleReadArticle(article)}
                            >
                                <div
                                    className="article-poster"
                                    style={{ backgroundColor: article.posterColor }}
                                >
                                    <div className="poster-icon">{article.icon}</div>
                                    <div className="poster-title">{article.title}</div>
                                    <div className="poster-gradient"></div>
                                </div>

                                <div className="article-info">
                                    <div className="article-header">
                                        <h4>{article.title}</h4>
                                        <div
                                            className="difficulty-badge"
                                            style={{
                                                backgroundColor: difficultyLevels[article.level].color,
                                                color: 'white'
                                            }}
                                        >
                                            {difficultyLevels[article.level].label}
                                        </div>
                                    </div>

                                    <p className="article-summary">{article.summary}</p>
                                    <div className="article-footer">
                                        <span className="read-time">{article.readTime}</span>
                                        <span className="read-button">Read Article →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SIDEBAR */}
                    <div className="training-sidebar">
                        {/* QUICK TIPS */}
                        <div className="sidebar-card quick-tips">
                            <h4><span className="sidebar-icon">💡</span> Quick Tips</h4>
                            <ul className="tips-list">
                                <li>Segregate waste at source daily</li>
                                <li>Clean dry waste before disposal</li>
                                <li>Compost kitchen waste at home</li>
                                <li>Avoid single-use plastics</li>
                                <li>Dispose e-waste properly</li>
                                <li>Participate in community drives</li>
                            </ul>
                        </div>

                        {/* PROGRESS */}
                        <div className="sidebar-card progress-tracker">
                            <h4><span className="sidebar-icon">📊</span> Your Progress</h4>
                            <div className="progress-stats">
                                <div className="progress-item">
                                    <span className="progress-label">Articles Read</span>
                                    <span className="progress-value">0/{articles.length}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className="encouragement">
                                <span className="encourage-icon">🏆</span>
                                Start reading to track progress!
                            </div>
                        </div>

                        {/* RESOURCES */}
                        <div className="sidebar-card resources">
                            <h4><span className="sidebar-icon">📚</span> Resources</h4>
                            <div className="resource-links">
                                <a href="#download" className="resource-link">
                                    <span className="link-icon">📥</span> Download Guides
                                </a>
                                <a href="#videos" className="resource-link">
                                    <span className="link-icon">🎬</span> Training Videos
                                </a>
                                <a href="#quiz" className="resource-link">
                                    <span className="link-icon">🧠</span> Take Quiz
                                </a>
                                <a href="#certificate" className="resource-link">
                                    <span className="link-icon">🏅</span> Get Certificate
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ARTICLE MODAL */}
            {selectedArticle && (
                <div className="article-reader-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close-button" onClick={handleCloseArticle}>✕</button>

                            <div className="modal-title-section">
                                <div
                                    className="modal-icon"
                                    style={{ backgroundColor: selectedArticle.posterColor }}
                                >
                                    {selectedArticle.icon}
                                </div>

                                <div className="modal-title">
                                    <h2>{selectedArticle.title}</h2>
                                    <div className="modal-meta">
                                        <span className="meta-item">
                                            <span className="meta-icon">⏱️</span>
                                            {selectedArticle.readTime}
                                        </span>

                                        <span
                                            className="meta-item difficulty"
                                            style={{
                                                color: difficultyLevels[selectedArticle.level].color
                                            }}
                                        >
                                            <span className="meta-icon">📊</span>
                                            {difficultyLevels[selectedArticle.level].label}
                                        </span>

                                        <span className="meta-item">
                                            <span className="meta-icon">📁</span>
                                            {
                                                categories.find(c => c.id === selectedArticle.category)?.name
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="article-content">

                                <div className="content-section">
                                    <h3>Summary</h3>
                                    <p className="article-summary-full">{selectedArticle.summary}</p>
                                </div>

                                <div className="content-section">
                                    <h3>Full Article</h3>
                                    <div
                                        className="article-full-content"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedArticle.fullContent
                                                .replace(/\n/g, '<br/>')
                                                .replace(/#/g, '<br/><strong>')
                                                .replace(/\n-/g, '<br/>• ')
                                        }}
                                    />
                                </div>

                                <div className="content-section key-points">
                                    <h3>Key Takeaways</h3>
                                    <ul>
                                        <li>Practice waste segregation daily</li>
                                        <li>Follow proper disposal methods</li>
                                        <li>Participate in recycling programs</li>
                                        <li>Educate others in community</li>
                                        <li>Stay updated with new guidelines</li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="action-buttons">
                                <button className="action-btn bookmark-btn">
                                    <span className="btn-icon">🔖</span> Bookmark
                                </button>
                                <button className="action-btn share-btn">
                                    <span className="btn-icon">📤</span> Share
                                </button>
                                <button className="action-btn download-btn">
                                    <span className="btn-icon">📥</span> Download PDF
                                </button>
                                <button className="action-btn complete-btn" onClick={handleCloseArticle}>
                                    <span className="btn-icon">✅</span> Mark as Read
                                </button>
                            </div>

                            <div className="navigation-buttons">
                                <button className="nav-btn prev-btn">← Previous Article</button>
                                <button className="nav-btn next-btn">Next Article →</button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-overlay" onClick={handleCloseArticle}></div>
                </div>
            )}
        </div>
    );
};

export default TrainingAwareness;
