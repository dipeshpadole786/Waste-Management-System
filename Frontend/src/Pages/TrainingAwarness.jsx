import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './TrainingAwareness.css';
import API from '../API/api_req';

const TrainingAwareness = () => {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [articles, setArticles] = useState([]);
    const [userProgress, setUserProgress] = useState({}); // Store user progress for each article
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');

    // ⏳ TIMER STATES
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerId, setTimerId] = useState(null);
    const [totalArticleTime, setTotalArticleTime] = useState(0);

    // 🔐 Redirect if not logged in
    useEffect(() => {
        if (!loggedInUser) {
            navigate("/login");
        }
    }, []);

    // 📥 Fetch articles and user progress
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch articles
                const articlesRes = await API.get("/articles");
                setArticles(articlesRes.data);

                // Fetch user progress
                if (loggedInUser?.aadhaarNumber) {
                    const progressRes = await API.get(`/progress/user/${loggedInUser.aadhaarNumber}`);
                    const progressMap = {};
                    progressRes.data.forEach(progress => {
                        progressMap[progress.article] = progress;
                    });
                    setUserProgress(progressMap);
                }
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };
        fetchData();
    }, [loggedInUser]);

    // 🔢 Convert "5 min" → 5 (minutes)
    const getMinutes = (readTime) => {
        const match = readTime.match(/\d+/);
        return match ? parseInt(match[0]) : 1;
    };

    // ⏱ Update progress every 10 seconds and handle completion
    useEffect(() => {
        if (timeLeft > 0 && selectedArticle) {
            // Calculate progress percentage based on time spent
            const timeSpent = totalArticleTime - timeLeft;
            const progressPercent = Math.min(100, Math.floor((timeSpent / totalArticleTime) * 100));
            
            // Update progress every 10 seconds
            if (timeSpent % 10 === 0 && timeSpent > 0) {
                updateProgress(selectedArticle._id, "in_progress", progressPercent, 10/60); // Convert seconds to minutes
            }
        } else if (timeLeft === 0 && selectedArticle && timerId) {
            // Timer ended, mark as completed
            clearInterval(timerId);
            updateProgress(selectedArticle._id, "completed", 100, getMinutes(selectedArticle.readTime));
        }
    }, [timeLeft, selectedArticle]);

    // Auto-complete when timer ends
    useEffect(() => {
        if (timeLeft === 0 && selectedArticle && timerId) {
            clearInterval(timerId);
            setTimerId(null);
            handleCloseArticle();
        }
    }, [timeLeft]);

    // Function to update progress
    const updateProgress = async (articleId, status, progressPercent, timeSpentMinutes = 0) => {
        try {
            const res = await API.post("/progress/update", {
                aadhaar: loggedInUser?.aadhaarNumber,
                articleId: articleId,
                status: status,
                progressPercent: progressPercent,
                timeSpent: timeSpentMinutes,
            });

            // Update local progress state
            setUserProgress(prev => ({
                ...prev,
                [articleId]: res.data.progress
            }));

            return res.data;
        } catch (error) {
            console.log("Error updating progress:", error);
        }
    };

    // ▶ Open article + start timer
    const handleReadArticle = async (article) => {
        setSelectedArticle(article);
        
        const minutes = getMinutes(article.readTime);
        const totalSeconds = minutes * 60;
        
        setTotalArticleTime(totalSeconds);
        setTimeLeft(totalSeconds);

        // Start or update progress
        const articleProgress = userProgress[article._id];
        let initialProgress = 0;
        
        if (articleProgress) {
            // If article was previously started, continue from where left off
            initialProgress = articleProgress.progressPercent || 0;
            // Calculate remaining time based on progress
            const remainingProgress = 100 - initialProgress;
            const estimatedTimeLeft = Math.floor((remainingProgress / 100) * totalSeconds);
            setTimeLeft(estimatedTimeLeft);
        } else {
            // New article, start fresh
            await updateProgress(article._id, "in_progress", 10, 0);
        }

        // Start timer
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setTimerId(id);
    };

    // ❌ Close article + clear timer
    const handleCloseArticle = () => {
        if (timerId) {
            clearInterval(timerId);
            setTimerId(null);
        }
        
        if (selectedArticle) {
            // Calculate how much time was actually spent
            const timeSpentMinutes = (totalArticleTime - timeLeft) / 60;
            const progressPercent = Math.min(100, Math.floor(((totalArticleTime - timeLeft) / totalArticleTime) * 100));
            
            // Update progress with current state
            updateProgress(
                selectedArticle._id,
                progressPercent >= 100 ? "completed" : "in_progress",
                progressPercent,
                timeSpentMinutes
            );
        }
        
        setTimeLeft(0);
        setSelectedArticle(null);
        setTotalArticleTime(0);
    };

    // Get progress for an article
    const getArticleProgress = (articleId) => {
        return userProgress[articleId] || { progressPercent: 0, status: "not_started" };
    };

    // Get progress badge color
    const getProgressColor = (progress) => {
        if (progress >= 100) return "#4CAF50"; // Green for completed
        if (progress >= 50) return "#FF9800"; // Orange for halfway
        if (progress > 0) return "#2196F3"; // Blue for started
        return "#9E9E9E"; // Grey for not started
    };

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

    return (
        <div className="training-awareness-page">
            <br /><br />

            <div className="container">
                {/* PROGRESS SUMMARY */}
                <div className="progress-summary">
                    <h3>📊 Your Learning Progress</h3>
                    <div className="progress-stats">
                        <div className="stat-item">
                            <span className="stat-number">
                                {Object.values(userProgress).filter(p => p.status === "completed").length}
                            </span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {Object.values(userProgress).filter(p => p.status === "in_progress").length}
                            </span>
                            <span className="stat-label">In Progress</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {articles.length - Object.keys(userProgress).length}
                            </span>
                            <span className="stat-label">Not Started</span>
                        </div>
                    </div>
                </div>

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
                        {filteredArticles.map(article => {
                            const progress = getArticleProgress(article._id);
                            
                            return (
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
                                        
                                        {/* Progress overlay */}
                                        {progress.progressPercent > 0 && (
                                            <div 
                                                className="progress-overlay"
                                                style={{
                                                    height: `${progress.progressPercent}%`,
                                                    backgroundColor: getProgressColor(progress.progressPercent) + '80'
                                                }}
                                            >
                                                <span className="progress-text">
                                                    {progress.progressPercent}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="article-info">
                                        <div className="article-header">
                                            <h4>{article.title}</h4>
                                            <div className="article-badges">
                                                <div
                                                    className="difficulty-badge"
                                                    style={{
                                                        backgroundColor: difficultyLevels[article.level].color,
                                                        color: 'white'
                                                    }}
                                                >
                                                    {difficultyLevels[article.level].label}
                                                </div>
                                                {progress.status === "completed" && (
                                                    <div className="status-badge completed">
                                                        ✓ Completed
                                                    </div>
                                                )}
                                                {progress.status === "in_progress" && (
                                                    <div className="status-badge in-progress">
                                                        🔄 {progress.progressPercent}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="article-summary">{article.summary}</p>
                                        <div className="article-footer">
                                            <span className="read-time">{article.readTime}</span>
                                            <span className="read-button">
                                                {progress.status === "completed" ? "Review →" : 
                                                 progress.status === "in_progress" ? "Continue →" : 
                                                 "Read Article →"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SIDEBAR */}
                    <div className="training-sidebar">
                        <div className="sidebar-card quick-tips">
                            <h4>💡 Quick Tips</h4>
                            <ul>
                                <li>Segregate waste daily</li>
                                <li>Clean dry waste</li>
                                <li>Compost kitchen waste</li>
                                <li>Avoid plastic</li>
                            </ul>
                        </div>
                        
                        {/* Progress sidebar card */}
                        <div className="sidebar-card progress-sidebar">
                            <h4>🎯 Your Progress</h4>
                            <div className="progress-circle">
                                <div className="circle-background"></div>
                                <div className="circle-progress" style={{
                                    transform: `rotate(${(Object.values(userProgress).filter(p => p.status === "completed").length / articles.length) * 360}deg)`
                                }}></div>
                                <div className="circle-text">
                                    <span className="percentage">
                                        {articles.length > 0 
                                            ? Math.round((Object.values(userProgress).filter(p => p.status === "completed").length / articles.length) * 100)
                                            : 0}%
                                    </span>
                                    <span className="label">Completed</span>
                                </div>
                            </div>
                            <div className="progress-details">
                                <p>{Object.values(userProgress).filter(p => p.status === "completed").length} of {articles.length} articles completed</p>
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

                            <h2>{selectedArticle.title}</h2>
                            <div className="modal-meta">
                                <div className="timer-display">
                                    ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                                </div>
                                <div className="progress-display">
                                    Progress: {Math.min(100, Math.floor(((totalArticleTime - timeLeft) / totalArticleTime) * 100))}%
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: selectedArticle.fullContent.replace(/\n/g, "<br/>")
                                }}
                            />
                        </div>
                        
                        {/* Mark as complete button */}
                        <div className="modal-footer">
                            <button 
                                className="mark-complete-btn"
                                onClick={() => {
                                    updateProgress(selectedArticle._id, "completed", 100, getMinutes(selectedArticle.readTime));
                                    handleCloseArticle();
                                }}
                            >
                                ✓ Mark as Complete
                            </button>
                        </div>
                    </div>

                    <div className="modal-overlay" onClick={handleCloseArticle}></div>
                </div>
            )}
        </div>
    );
};

export default TrainingAwareness;