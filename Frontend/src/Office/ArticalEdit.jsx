import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditArticle.css";
import API from "../API/api_req";

const BLANK_FORM = { title: "", category: "segregation", level: "beginner", readTime: "", posterColor: "#0C1B33", icon: "", summary: "", fullContent: "" };
const CATEGORIES = ["segregation", "recycling", "hazardous", "government", "technology", "community"];
const LEVELS = ["beginner", "intermediate", "advanced", "all"];

export default function EditArticle() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data = [] } = location.state || {};

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingArticleId, setEditingArticleId] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addFormData, setAddFormData] = useState({ ...BLANK_FORM });
    const [editFormData, setEditFormData] = useState({ ...BLANK_FORM });
    const [search, setSearch] = useState("");

    useEffect(() => { if (Array.isArray(data)) setArticles(data); }, [data]);

    const handleAddChange = e => setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    const handleEditChange = e => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

    const handleAddSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await API.post("/articles", addFormData);
            const newArticle = res.data.data || res.data;
            setArticles([...articles, newArticle]);
            setAddFormData({ ...BLANK_FORM });
            setShowAddForm(false);
            alert("Article added successfully!");
        } catch { alert("Failed to add article. Please try again."); }
        finally { setIsSubmitting(false); }
    };

    const handleEditSubmit = async e => {
        e.preventDefault();
        if (!editingArticleId) return;
        setIsSubmitting(true);
        try {
            await API.put(`/articles/${editingArticleId}`, editFormData);
            setArticles(articles.map(a => a._id === editingArticleId ? { ...a, ...editFormData } : a));
            setEditingArticleId(null);
            alert("Article updated successfully!");
        } catch { alert("Failed to update article. Please try again."); }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = async (articleId) => {
        if (editingArticleId === articleId) { setEditingArticleId(null); return; }
        setLoading(true);
        setShowAddForm(false);
        try {
            const res = await API.get(`/articles/${articleId}`);
            const d = res.data.data || res.data;
            setEditFormData({ title: d.title || "", category: d.category || "segregation", level: d.level || "beginner", readTime: d.readTime || "", posterColor: d.posterColor || "#0C1B33", icon: d.icon || "", summary: d.summary || "", fullContent: d.fullContent || "" });
            setEditingArticleId(articleId);
            setTimeout(() => {
                document.getElementById(`ea-form-${articleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch { alert("Failed to load article details"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (articleId) => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;
        try {
            await API.delete(`/articles/${articleId}`);
            setArticles(articles.filter(a => a._id !== articleId));
            if (editingArticleId === articleId) setEditingArticleId(null);
            alert("Article deleted successfully!");
        } catch { alert("Failed to delete article"); }
    };

    const cancelAdd = () => { setShowAddForm(false); setAddFormData({ ...BLANK_FORM }); };
    const cancelEdit = () => setEditingArticleId(null);

    const filtered = articles.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.toLowerCase().includes(search.toLowerCase())
    );

    const ArticleForm = ({ formData, onChange, onSubmit, onCancel, mode }) => (
        <div className={`ea-form-section ea-form-section--${mode}`}>
            <div className="ea-form-head">
                <h3>{mode === 'add' ? '➕ New Article' : `✏️ Editing: ${formData.title}`}</h3>
                <button type="button" className="ea-btn ea-btn--ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
            </div>
            <form onSubmit={onSubmit} className="ea-form">
                <div className="ea-form-grid">
                    {/* Title */}
                    <div className="ea-field ea-field--full">
                        <label className="ea-label">TITLE <span className="ea-req">*</span></label>
                        <input name="title" value={formData.title} onChange={onChange} placeholder="Article title" required disabled={isSubmitting} className="ea-input" />
                    </div>

                    {/* Category */}
                    <div className="ea-field">
                        <label className="ea-label">CATEGORY</label>
                        <div className="ea-select-wrap">
                            <select name="category" value={formData.category} onChange={onChange} disabled={isSubmitting} className="ea-select">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Level */}
                    <div className="ea-field">
                        <label className="ea-label">LEVEL</label>
                        <div className="ea-select-wrap">
                            <select name="level" value={formData.level} onChange={onChange} disabled={isSubmitting} className="ea-select">
                                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Read Time */}
                    <div className="ea-field">
                        <label className="ea-label">READ TIME <span className="ea-req">*</span></label>
                        <input name="readTime" value={formData.readTime} onChange={onChange} placeholder="e.g. 5 min" required disabled={isSubmitting} className="ea-input" />
                    </div>

                    {/* Icon */}
                    <div className="ea-field">
                        <label className="ea-label">ICON <span className="ea-req">*</span></label>
                        <div className="ea-icon-row">
                            <input name="icon" value={formData.icon} onChange={onChange} placeholder="e.g. 📚 ♻️ ⚠️" required disabled={isSubmitting} className="ea-input" />
                            {formData.icon && <span className="ea-icon-preview">{formData.icon}</span>}
                        </div>
                    </div>

                    {/* Poster Color */}
                    <div className="ea-field">
                        <label className="ea-label">POSTER COLOR</label>
                        <div className="ea-color-row">
                            <div className="ea-color-swatch" style={{ background: formData.posterColor }}></div>
                            <input type="color" name="posterColor" value={formData.posterColor} onChange={onChange} disabled={isSubmitting} className="ea-color-input" />
                            <span className="ea-color-val">{formData.posterColor}</span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="ea-field ea-field--full">
                        <label className="ea-label">SUMMARY</label>
                        <textarea name="summary" value={formData.summary} onChange={onChange} rows={3} placeholder="Brief article summary…" disabled={isSubmitting} className="ea-textarea" />
                    </div>

                    {/* Full Content */}
                    <div className="ea-field ea-field--full">
                        <label className="ea-label">FULL CONTENT <span className="ea-hint">(Markdown)</span></label>
                        <textarea name="fullContent" value={formData.fullContent} onChange={onChange} rows={8} placeholder="Write article content in Markdown format…" disabled={isSubmitting} className="ea-textarea ea-textarea--code" />
                    </div>
                </div>

                <div className="ea-form-footer">
                    <button type="button" className="ea-btn ea-btn--outline" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="ea-btn ea-btn--primary" disabled={isSubmitting}>
                        {isSubmitting ? <><span className="ea-spinner"></span> {mode === 'add' ? 'Creating…' : 'Updating…'}</> : (mode === 'add' ? '➕ Create Article' : '💾 Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="ea-page">

            {/* Page Header */}
            <div className="ea-header">
                <div>
                    <div className="ea-eyebrow">Admin · Training Content</div>
                    <h1 className="ea-title">Article Management</h1>
                    <p className="ea-sub">{articles.length} article{articles.length !== 1 ? 's' : ''} total</p>
                </div>
                <button
                    className={`ea-btn ${showAddForm ? 'ea-btn--outline' : 'ea-btn--primary'}`}
                    onClick={() => { if (showAddForm) cancelAdd(); else { setShowAddForm(true); setEditingArticleId(null); } }}
                >
                    {showAddForm ? '✕ Cancel' : '➕ Add New Article'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <ArticleForm formData={addFormData} onChange={handleAddChange} onSubmit={handleAddSubmit} onCancel={cancelAdd} mode="add" />
            )}

            {/* Search */}
            <div className="ea-search-wrap">
                <span className="ea-search-icon">🔍</span>
                <input type="text" className="ea-search" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="ea-search-clear" onClick={() => setSearch('')}>✕</button>}
                <span className="ea-search-count">{filtered.length} of {articles.length}</span>
            </div>

            {/* Articles List */}
            <div className="ea-articles">
                {filtered.length === 0 ? (
                    <div className="ea-empty">
                        <div className="ea-empty-icon">📝</div>
                        <h3>{articles.length === 0 ? 'No articles yet' : 'No results found'}</h3>
                        <p>{articles.length === 0 ? 'Create your first article to get started.' : 'Try a different search term.'}</p>
                    </div>
                ) : filtered.map(article => (
                    <div key={article._id}>
                        {/* Article Card */}
                        <div className={`ea-card ${editingArticleId === article._id ? 'ea-card--editing' : ''}`}>
                            <div className="ea-card-left">
                                <div className="ea-article-icon">{article.icon || '📄'}</div>
                                <div className="ea-article-info">
                                    <h4 className="ea-article-title">{article.title}</h4>
                                    <div className="ea-article-meta">
                                        <span className={`ea-cat-badge ea-cat--${article.category}`}>{article.category}</span>
                                        <span className={`ea-lvl-badge ea-lvl--${article.level}`}>{article.level}</span>
                                        <span className="ea-read-time">⏱️ {article.readTime}</span>
                                        {article.posterColor && (
                                            <span className="ea-color-dot" style={{ background: article.posterColor }} title={`Poster: ${article.posterColor}`}></span>
                                        )}
                                    </div>
                                    {article.summary && <p className="ea-article-summary">{article.summary.substring(0, 100)}{article.summary.length > 100 ? '…' : ''}</p>}
                                </div>
                            </div>
                            <div className="ea-card-actions">
                                <button
                                    className={`ea-btn ${editingArticleId === article._id ? 'ea-btn--active' : 'ea-btn--outline'}`}
                                    onClick={() => handleEdit(article._id)}
                                    disabled={loading || isSubmitting}
                                >
                                    {editingArticleId === article._id ? '✕ Cancel Edit' : '✏️ Edit'}
                                </button>
                                <button className="ea-btn ea-btn--delete" onClick={() => handleDelete(article._id)} disabled={loading || isSubmitting}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>

                        {/* Inline Edit Form */}
                        {editingArticleId === article._id && (
                            <div id={`ea-form-${article._id}`}>
                                <ArticleForm formData={editFormData} onChange={handleEditChange} onSubmit={handleEditSubmit} onCancel={cancelEdit} mode="edit" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}