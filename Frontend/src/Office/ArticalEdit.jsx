import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./EditArticle.css";
import API from "../API/api_req";
import { useNavigate } from "react-router-dom";

export default function EditArticle() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data = [] } = location.state || {};

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingArticleId, setEditingArticleId] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Separate form states for Add and Edit
    const [addFormData, setAddFormData] = useState({
        title: "",
        category: "segregation",
        level: "beginner",
        readTime: "",
        posterColor: "#0056b3",
        icon: "",
        summary: "",
        fullContent: "",
    });

    const [editFormData, setEditFormData] = useState({
        title: "",
        category: "segregation",
        level: "beginner",
        readTime: "",
        posterColor: "#0056b3",
        icon: "",
        summary: "",
        fullContent: "",
    });

    useEffect(() => {
        if (Array.isArray(data)) {
            setArticles(data);
        }
    }, [data]);

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddFormData({ ...addFormData, [name]: value });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await API.post("/articles", addFormData);
            console.log("Article created:", res.data);

            // Add new article to local state
            const newArticle = res.data.data || res.data;
            setArticles([...articles, newArticle]);

            // Reset form and close
            setAddFormData({
                title: "",
                category: "segregation",
                level: "beginner",
                readTime: "",
                posterColor: "#0056b3",
                icon: "",
                summary: "",
                fullContent: "",
            });

            setShowAddForm(false);
            alert("Article added successfully!");

        } catch (err) {
            console.error("Error adding article:", err);
            alert("Failed to add article. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingArticleId) return;

        setIsSubmitting(true);

        try {
            const res = await API.put(`/articles/${editingArticleId}`, editFormData);
            console.log("Article updated:", res.data);

            // Update the article in local state
            setArticles(articles.map(article =>
                article._id === editingArticleId
                    ? { ...article, ...editFormData }
                    : article
            ));

            // Close edit form
            setEditingArticleId(null);
            alert("Article updated successfully!");

        } catch (err) {
            console.error("Error updating article:", err);
            alert("Failed to update article. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (articleId) => {
        if (editingArticleId === articleId) {
            // Cancel editing
            setEditingArticleId(null);
            return;
        }

        setLoading(true);
        setShowAddForm(false); // Close add form if open

        try {
            // Fetch article details from backend
            const res = await API.get(`/articles/${articleId}`);
            const articleData = res.data.data || res.data;

            setEditFormData({
                title: articleData.title || "",
                category: articleData.category || "segregation",
                level: articleData.level || "beginner",
                readTime: articleData.readTime || "",
                posterColor: articleData.posterColor || "#0056b3",
                icon: articleData.icon || "",
                summary: articleData.summary || "",
                fullContent: articleData.fullContent || "",
            });

            setEditingArticleId(articleId);

            // Scroll to the edit form
            setTimeout(() => {
                const editFormElement = document.getElementById(`edit-form-${articleId}`);
                if (editFormElement) {
                    editFormElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);

        } catch (err) {
            console.error("Error fetching article:", err);
            alert("Failed to load article details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (articleId) => {
        if (!window.confirm("Are you sure you want to delete this article?")) {
            return;
        }

        try {
            await API.delete(`/articles/${articleId}`);

            // Remove from local state
            setArticles(articles.filter(article => article._id !== articleId));

            // If deleting the article being edited, cancel edit
            if (editingArticleId === articleId) {
                setEditingArticleId(null);
            }

            alert("Article deleted successfully!");

        } catch (err) {
            console.error("Error deleting article:", err);
            alert("Failed to delete article");
        }
    };

    const cancelAdd = () => {
        setShowAddForm(false);
        setAddFormData({
            title: "",
            category: "segregation",
            level: "beginner",
            readTime: "",
            posterColor: "#0056b3",
            icon: "",
            summary: "",
            fullContent: "",
        });
    };

    const cancelEdit = () => {
        setEditingArticleId(null);
    };

    return (
        <div className="article-management-container">
            <div className="article-header">
                <h2>Article Management</h2>
                <button
                    onClick={() => {
                        if (showAddForm) {
                            cancelAdd();
                        } else {
                            setShowAddForm(true);
                            setEditingArticleId(null); // Close any open edit form
                        }
                    }}
                    className={`gov-btn ${showAddForm ? 'cancel-btn-style' : ''}`}
                >
                    <span>{showAddForm ? "−" : "+"}</span>
                    {showAddForm ? "Cancel Add" : "Add New Article"}
                </button>
            </div>

            {/* ADD NEW ARTICLE FORM */}
            {showAddForm && (
                <div className="article-form-section add-mode">
                    <div className="form-header">
                        <h3>Add New Article</h3>
                    </div>
                    <form onSubmit={handleAddSubmit} className="article-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    name="title"
                                    placeholder="Enter article title"
                                    value={addFormData.title}
                                    onChange={handleAddChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={addFormData.category}
                                    onChange={handleAddChange}
                                    disabled={isSubmitting}
                                >
                                    <option value="segregation">Segregation</option>
                                    <option value="recycling">Recycling</option>
                                    <option value="hazardous">Hazardous</option>
                                    <option value="government">Government</option>
                                    <option value="technology">Technology</option>
                                    <option value="community">Community</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Level</label>
                                <select
                                    name="level"
                                    value={addFormData.level}
                                    onChange={handleAddChange}
                                    disabled={isSubmitting}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="all">All</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Read Time</label>
                                <input
                                    name="readTime"
                                    placeholder="e.g. 5 min"
                                    value={addFormData.readTime}
                                    onChange={handleAddChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label>Poster Color</label>
                                <div className="color-input-wrapper">
                                    <div
                                        className="color-preview"
                                        style={{ backgroundColor: addFormData.posterColor }}
                                    ></div>
                                    <input
                                        type="color"
                                        name="posterColor"
                                        value={addFormData.posterColor}
                                        onChange={handleAddChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Icon</label>
                                <input
                                    name="icon"
                                    placeholder="e.g. 📚, ♻️, ⚠️"
                                    value={addFormData.icon}
                                    onChange={handleAddChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group textarea-full">
                                <label>Summary</label>
                                <textarea
                                    name="summary"
                                    placeholder="Brief summary of the article"
                                    value={addFormData.summary}
                                    onChange={handleAddChange}
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group textarea-full">
                                <label>Full Content (Markdown)</label>
                                <textarea
                                    name="fullContent"
                                    placeholder="Write article content in Markdown format"
                                    value={addFormData.fullContent}
                                    onChange={handleAddChange}
                                    rows={8}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-actions textarea-full">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : "Create Article"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={cancelAdd}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className="gov-seal">📘</div>
                    </form>
                </div>
            )}

            <div className="articles-section">
                <h3>All Articles</h3>

                {articles.length === 0 ? (
                    <div className="no-articles">
                        <p>No articles found. Create your first article to get started.</p>
                    </div>
                ) : (
                    articles.map((article) => (
                        <div key={article._id}>
                            {/* ARTICLE CARD */}
                            <div className="article-card">
                                <div className="article-info">
                                    <h4>{article.title}</h4>
                                    <div className="article-meta">
                                        <span
                                            className="category-badge"
                                            data-category={article.category}
                                        >
                                            {article.category}
                                        </span>
                                        <span
                                            className="level-badge"
                                            data-level={article.level}
                                        >
                                            {article.level}
                                        </span>
                                        <span className="read-time">
                                            ⏱️ {article.readTime}
                                        </span>
                                    </div>
                                    {article.icon && (
                                        <div className="article-icon">
                                            {article.icon}
                                        </div>
                                    )}
                                </div>
                                <div className="article-actions">
                                    <button
                                        className={`edit-btn ${editingArticleId === article._id ? 'editing' : ''}`}
                                        onClick={() => handleEdit(article._id)}
                                        disabled={loading || isSubmitting}
                                    >
                                        {editingArticleId === article._id ? "Cancel Edit" : "Edit"}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(article._id)}
                                        disabled={loading || isSubmitting}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* EDIT FORM FOR THIS SPECIFIC ARTICLE */}
                            {editingArticleId === article._id && (
                                <div
                                    id={`edit-form-${article._id}`}
                                    className="article-form-section edit-mode"
                                >
                                    <div className="form-header">
                                        <h3>Edit Article: {article.title}</h3>
                                    </div>
                                    <form onSubmit={handleEditSubmit} className="article-form">
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input
                                                    name="title"
                                                    placeholder="Enter article title"
                                                    value={editFormData.title}
                                                    onChange={handleEditChange}
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Category</label>
                                                <select
                                                    name="category"
                                                    value={editFormData.category}
                                                    onChange={handleEditChange}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="segregation">Segregation</option>
                                                    <option value="recycling">Recycling</option>
                                                    <option value="hazardous">Hazardous</option>
                                                    <option value="government">Government</option>
                                                    <option value="technology">Technology</option>
                                                    <option value="community">Community</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Level</label>
                                                <select
                                                    name="level"
                                                    value={editFormData.level}
                                                    onChange={handleEditChange}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="beginner">Beginner</option>
                                                    <option value="intermediate">Intermediate</option>
                                                    <option value="advanced">Advanced</option>
                                                    <option value="all">All</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Read Time</label>
                                                <input
                                                    name="readTime"
                                                    placeholder="e.g. 5 min"
                                                    value={editFormData.readTime}
                                                    onChange={handleEditChange}
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Poster Color</label>
                                                <div className="color-input-wrapper">
                                                    <div
                                                        className="color-preview"
                                                        style={{ backgroundColor: editFormData.posterColor }}
                                                    ></div>
                                                    <input
                                                        type="color"
                                                        name="posterColor"
                                                        value={editFormData.posterColor}
                                                        onChange={handleEditChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Icon</label>
                                                <input
                                                    name="icon"
                                                    placeholder="e.g. 📚, ♻️, ⚠️"
                                                    value={editFormData.icon}
                                                    onChange={handleEditChange}
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="form-group textarea-full">
                                                <label>Summary</label>
                                                <textarea
                                                    name="summary"
                                                    placeholder="Brief summary of the article"
                                                    value={editFormData.summary}
                                                    onChange={handleEditChange}
                                                    rows={3}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="form-group textarea-full">
                                                <label>Full Content (Markdown)</label>
                                                <textarea
                                                    name="fullContent"
                                                    placeholder="Write article content in Markdown format"
                                                    value={editFormData.fullContent}
                                                    onChange={handleEditChange}
                                                    rows={8}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="form-actions textarea-full">
                                                <button
                                                    type="submit"
                                                    className="submit-btn"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Updating..." : "Update Article"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancel-btn"
                                                    onClick={cancelEdit}
                                                    disabled={isSubmitting}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                        <div className="gov-seal">✏️</div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div className="gov-seal">📋</div>
            </div>
        </div>
    );
}