import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './TrainingAwareness.css';
import API from '../API/api_req';

const TrainingAwareness = () => {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [articles, setArticles] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [timeLeft, setTimeLeft] = useState(0);
    const [timerId, setTimerId] = useState(null);
    const [totalArticleTime, setTotalArticleTime] = useState(0);

    useEffect(() => {
        if (!loggedInUser) navigate("/login");
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const articlesRes = await API.get("/articles");
                setArticles(articlesRes.data);
                if (loggedInUser?.aadhaarNumber) {
                    const progressRes = await API.get(`/progress/user/${loggedInUser.aadhaarNumber}`);
                    const progressMap = {};
                    progressRes.data.forEach(p => { progressMap[p.article] = p; });
                    setUserProgress(progressMap);
                }
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };
        fetchData();
    }, [loggedInUser]);

    const getMinutes = (readTime) => {
        const match = readTime.match(/\d+/);
        return match ? parseInt(match[0]) : 1;
    };

    useEffect(() => {
        if (timeLeft > 0 && selectedArticle) {
            const timeSpent = totalArticleTime - timeLeft;
            const progressPercent = Math.min(100, Math.floor((timeSpent / totalArticleTime) * 100));
            if (timeSpent % 10 === 0 && timeSpent > 0) {
                updateProgress(selectedArticle._id, "in_progress", progressPercent, 10 / 60);
            }
        } else if (timeLeft === 0 && selectedArticle && timerId) {
            clearInterval(timerId);
            updateProgress(selectedArticle._id, "completed", 100, getMinutes(selectedArticle.readTime));
        }
    }, [timeLeft, selectedArticle]);

    useEffect(() => {
        if (timeLeft === 0 && selectedArticle && timerId) {
            clearInterval(timerId);
            setTimerId(null);
            handleCloseArticle();
        }
    }, [timeLeft]);

    const updateProgress = async (articleId, status, progressPercent, timeSpentMinutes = 0) => {
        try {
            const res = await API.post("/progress/update", {
                aadhaar: loggedInUser?.aadhaarNumber,
                articleId,
                status,
                progressPercent,
                timeSpent: timeSpentMinutes,
            });
            setUserProgress(prev => ({ ...prev, [articleId]: res.data.progress }));
            return res.data;
        } catch (error) {
            console.log("Error updating progress:", error);
        }
    };

    const handleReadArticle = async (article) => {
        setSelectedArticle(article);
        const minutes = getMinutes(article.readTime);
        const totalSeconds = minutes * 60;
        setTotalArticleTime(totalSeconds);
        setTimeLeft(totalSeconds);

        const articleProgress = userProgress[article._id];
        if (articleProgress) {
            const remainingProgress = 100 - (articleProgress.progressPercent || 0);
            const estimatedTimeLeft = Math.floor((remainingProgress / 100) * totalSeconds);
            setTimeLeft(estimatedTimeLeft);
        } else {
            await updateProgress(article._id, "in_progress", 10, 0);
        }

        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(id); return 0; }
                return prev - 1;
            });
        }, 1000);
        setTimerId(id);
    };

    const handleCloseArticle = () => {
        if (timerId) { clearInterval(timerId); setTimerId(null); }
        if (selectedArticle) {
            const timeSpentMinutes = (totalArticleTime - timeLeft) / 60;
            const progressPercent = Math.min(100, Math.floor(((totalArticleTime - timeLeft) / totalArticleTime) * 100));
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

    const getArticleProgress = (articleId) => userProgress[articleId] || { progressPercent: 0, status: "not_started" };

    const getProgressColor = (progress) => {
        if (progress >= 100) return "#1A6B3A";
        if (progress >= 50) return "#E07B2A";
        if (progress > 0) return "#0C1B33";
        return "#94A3B8";
    };

    const categories = [
        { id: 'all', name: 'All Topics', icon: '📚' },
        { id: 'segregation', name: 'Waste Segregation', icon: '🗑️' },
        { id: 'recycling', name: 'Recycling', icon: '♻️' },
        { id: 'hazardous', name: 'Hazardous Waste', icon: '⚠️' },
        { id: 'government', name: 'Gov. Schemes', icon: '🏛️' },
        { id: 'technology', name: 'Technology', icon: '⚡' },
        { id: 'community', name: 'Community', icon: '👥' },
    ];

    const difficultyLevels = {
        beginner: { label: 'Beginner', color: '#1A6B3A' },
        intermediate: { label: 'Intermediate', color: '#E07B2A' },
        advanced: { label: 'Advanced', color: '#C0392B' },
        all: { label: 'All Levels', color: '#0C1B33' },
    };

    const completedCount = Object.values(userProgress).filter(p => p.status === "completed").length;
    const inProgressCount = Object.values(userProgress).filter(p => p.status === "in_progress").length;
    const completionPct = articles.length > 0 ? Math.round((completedCount / articles.length) * 100) : 0;

    const filteredArticles = categoryFilter === 'all'
        ? articles
        : articles.filter(a => a.category === categoryFilter);

    return (
        <div className="ta-page">
            <div className="ta-container">

                {/* Page Header */}
                <div className="ta-page-header">
                    <div className="ta-page-header-left">
                        <div className="ta-page-eyebrow">Training & Awareness</div>
                        <h1 className="ta-page-title">Learning Centre</h1>
                        <p className="ta-page-sub">Complete articles to earn progress and stay informed on safe waste management practices.</p>
                    </div>
                    <div className="ta-summary-cards">
                        <div className="ta-summary-card">
                            <div className="ta-summary-val">{completedCount}</div>
                            <div className="ta-summary-lbl">Completed</div>
                        </div>
                        <div className="ta-summary-card accent">
                            <div className="ta-summary-val">{inProgressCount}</div>
                            <div className="ta-summary-lbl">In Progress</div>
                        </div>
                        <div className="ta-summary-card">
                            <div className="ta-summary-val">{articles.length - Object.keys(userProgress).length}</div>
                            <div className="ta-summary-lbl">Not Started</div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="ta-progress-bar-wrap">
                    <div className="ta-progress-bar-header">
                        <span>Overall Progress</span>
                        <span className="ta-progress-pct">{completionPct}%</span>
                    </div>
                    <div className="ta-progress-track">
                        <div className="ta-progress-fill" style={{ width: `${completionPct}%` }}></div>
                    </div>
                    <div className="ta-progress-sub">{completedCount} of {articles.length} articles completed</div>
                </div>

                {/* Category Filters */}
                <div className="ta-filters">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`ta-filter-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(cat.id)}
                        >
                            <span>{cat.icon}</span> {cat.name}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="ta-content-grid">
                    {/* Articles */}
                    <div className="ta-articles-grid">
                        {filteredArticles.map(article => {
                            const progress = getArticleProgress(article._id);
                            return (
                                <div key={article._id} className="ta-article-card" onClick={() => handleReadArticle(article)}>
                                    <div className="ta-article-poster" style={{ background: article.posterColor || '#0C1B33' }}>
                                        <div className="ta-poster-icon">{article.icon}</div>
                                        <div className="ta-poster-gradient"></div>
                                        {progress.progressPercent > 0 && (
                                            <div className="ta-poster-progress-bar">
                                                <div
                                                    className="ta-poster-progress-fill"
                                                    style={{
                                                        width: `${progress.progressPercent}%`,
                                                        background: getProgressColor(progress.progressPercent)
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                        {progress.status === "completed" && (
                                            <div className="ta-poster-complete-badge">✓</div>
                                        )}
                                    </div>

                                    <div className="ta-article-body">
                                        <div className="ta-article-badges">
                                            <span
                                                className="ta-level-badge"
                                                style={{ background: difficultyLevels[article.level]?.color || '#0C1B33' }}
                                            >
                                                {difficultyLevels[article.level]?.label || article.level}
                                            </span>
                                            {progress.status === "completed" && (
                                                <span className="ta-status-badge completed">✓ Done</span>
                                            )}
                                            {progress.status === "in_progress" && (
                                                <span className="ta-status-badge in-progress">⏳ {progress.progressPercent}%</span>
                                            )}
                                        </div>
                                        <h4 className="ta-article-title">{article.title}</h4>
                                        <p className="ta-article-summary">{article.summary}</p>
                                        <div className="ta-article-footer">
                                            <span className="ta-read-time">⏱ {article.readTime}</span>
                                            <span className="ta-read-cta">
                                                {progress.status === "completed" ? "Review →" :
                                                    progress.status === "in_progress" ? "Continue →" : "Read →"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sidebar */}
                    <div className="ta-sidebar">
                        <div className="ta-sidebar-card">
                            <div className="ta-sidebar-card-head">🎯 Your Progress</div>
                            <div className="ta-donut-wrap">
                                <svg viewBox="0 0 80 80" className="ta-donut">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="#EEF2F8" strokeWidth="8" />
                                    <circle
                                        cx="40" cy="40" r="32"
                                        fill="none"
                                        stroke="#E07B2A"
                                        strokeWidth="8"
                                        strokeDasharray={`${completionPct * 2.01} 201`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                    />
                                </svg>
                                <div className="ta-donut-label">
                                    <span className="ta-donut-pct">{completionPct}%</span>
                                    <span className="ta-donut-sub">Done</span>
                                </div>
                            </div>
                            <div className="ta-progress-rows">
                                {[
                                    { label: "Completed", val: completedCount, color: "#1A6B3A" },
                                    { label: "In Progress", val: inProgressCount, color: "#E07B2A" },
                                    { label: "Remaining", val: articles.length - completedCount - inProgressCount, color: "#94A3B8" },
                                ].map(r => (
                                    <div className="ta-progress-row" key={r.label}>
                                        <span className="ta-pr-dot" style={{ background: r.color }}></span>
                                        <span className="ta-pr-label">{r.label}</span>
                                        <span className="ta-pr-val">{r.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ta-sidebar-card">
                            <div className="ta-sidebar-card-head">💡 Quick Tips</div>
                            <ul className="ta-tips-list">
                                {["Segregate waste daily", "Clean dry waste before disposal", "Compost kitchen waste", "Avoid single-use plastic", "Sanitize after handling bins"].map(tip => (
                                    <li key={tip} className="ta-tip-item">
                                        <span className="ta-tip-dot"></span>{tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <div className="ta-modal-overlay" onClick={handleCloseArticle}>
                    <div className="ta-modal" onClick={e => e.stopPropagation()}>
                        <div className="ta-modal-head">
                            <div className="ta-modal-title-row">
                                <h2 className="ta-modal-title">{selectedArticle.title}</h2>
                                <button className="ta-modal-close" onClick={handleCloseArticle}>✕</button>
                            </div>
                            <div className="ta-modal-meta">
                                <div className="ta-timer">
                                    ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                                </div>
                                <div className="ta-modal-progress-track">
                                    <div
                                        className="ta-modal-progress-fill"
                                        style={{ width: `${Math.min(100, Math.floor(((totalArticleTime - timeLeft) / totalArticleTime) * 100))}%` }}
                                    ></div>
                                </div>
                                <span className="ta-modal-pct">
                                    {Math.min(100, Math.floor(((totalArticleTime - timeLeft) / totalArticleTime) * 100))}%
                                </span>
                            </div>
                        </div>
                        <div
                            className="ta-modal-body"
                            dangerouslySetInnerHTML={{ __html: selectedArticle.fullContent.replace(/\n/g, "<br/>") }}
                        />
                        <div className="ta-modal-foot">
                            <button className="ta-complete-btn" onClick={() => {
                                updateProgress(selectedArticle._id, "completed", 100, getMinutes(selectedArticle.readTime));
                                handleCloseArticle();
                            }}>
                                ✓ Mark as Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingAwareness;