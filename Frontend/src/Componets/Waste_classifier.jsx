import React, { useState, useCallback } from 'react';
import api from '../API/model_api';
import './WasteClassifier.css';

const WasteClassifier = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [apiStatus, setApiStatus] = useState('checking');

    // Check API health on component mount
    React.useEffect(() => {
        checkApiHealth();
    }, []);

    const checkApiHealth = async () => {
        const result = await api.checkHealth();
        if (result.success && result.data?.status === 'healthy') {
            setApiStatus('connected');
        } else {
            setApiStatus('disconnected');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);

        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        } else {
            setError('Please drop an image file (PNG, JPG, JPEG, GIF, BMP)');
        }
    };

    const processFile = (file) => {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size should be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setPrediction(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handlePredict = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        if (apiStatus !== 'connected') {
            setError('Backend API is not connected. Please make sure the server is running.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await api.predictImage(selectedFile);

            if (result.success && result.data.success) {
                setPrediction(result.data);
            } else {
                setError(result.error || result.data?.error || 'Prediction failed');
            }
        } catch (err) {
            setError('Failed to connect to server. Please check if the backend is running.');
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setPrediction(null);
        setError(null);
        setDragOver(false);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="waste-classifier-container">
            <div className="header">
                <h1>♻️ Waste Classification System</h1>
                <p>Upload an image to classify waste as Organic or Recyclable</p>

                <div className="api-status">
                    <div className={`status-indicator ${apiStatus}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">
                            {apiStatus === 'connected' ? 'Backend Connected' :
                                apiStatus === 'checking' ? 'Checking Connection...' :
                                    'Backend Disconnected'}
                        </span>
                    </div>
                    <button onClick={checkApiHealth} className="refresh-btn">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="upload-section">
                    <h2>📤 Upload Image</h2>

                    {!previewUrl ? (
                        <div
                            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <div className="upload-icon">
                                📁
                            </div>
                            <p className="upload-text">Drag & drop your image here</p>
                            <p className="upload-subtext">or click to browse</p>
                            <div className="file-info">
                                <span>Supported: PNG, JPG, JPEG, GIF, BMP</span>
                                <span>Max size: 10MB</span>
                            </div>
                        </div>
                    ) : (
                        <div className="preview-section">
                            <div className="image-preview">
                                <img src={previewUrl} alt="Preview" />
                                <button className="remove-btn" onClick={handleReset}>×</button>
                            </div>
                            <div className="file-details">
                                <h3>Selected File</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="label">Name:</span>
                                        <span className="value">{selectedFile.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Size:</span>
                                        <span className="value">{formatBytes(selectedFile.size)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Type:</span>
                                        <span className="value">{selectedFile.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {previewUrl && !prediction && (
                        <div className="action-buttons">
                            <button
                                onClick={handlePredict}
                                disabled={loading || apiStatus !== 'connected'}
                                className={`predict-btn ${loading ? 'loading' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    '🔍 Classify Waste'
                                )}
                            </button>
                            <button onClick={handleReset} className="secondary-btn">
                                Choose Different Image
                            </button>
                        </div>
                    )}
                </div>

                {prediction && (
                    <div className="results-section">
                        <h2>📊 Classification Results</h2>

                        <div className={`prediction-card ${prediction.isRecyclable ? 'recyclable' : 'organic'}`}>
                            <div className="prediction-header">
                                <div className="prediction-type">
                                    <div className="type-icon">
                                        {prediction.isRecyclable ? '♻️' : '🌱'}
                                    </div>
                                    <div className="type-info">
                                        <h3>{prediction.prediction} Waste</h3>
                                        <p className="type-description">
                                            {prediction.isRecyclable
                                                ? 'This item can be recycled and reused'
                                                : 'This organic waste can be composted'}
                                        </p>
                                    </div>
                                </div>
                                <div className="confidence-score">
                                    <div className="score-value">{prediction.confidence}%</div>
                                    <div className="score-label">Confidence</div>
                                </div>
                            </div>

                            <div className="prediction-details">
                                <div className="details-grid">
                                    <div className="detail-box">
                                        <span className="detail-label">Prediction</span>
                                        <span className="detail-value">{prediction.prediction}</span>
                                    </div>
                                    <div className="detail-box">
                                        <span className="detail-label">Confidence</span>
                                        <span className="detail-value">{prediction.confidence}%</span>
                                    </div>
                                    <div className="detail-box">
                                        <span className="detail-label">Probability Score</span>
                                        <span className="detail-value">{prediction.probability}</span>
                                    </div>
                                    <div className="detail-box">
                                        <span className="detail-label">Analysis Time</span>
                                        <span className="detail-value">{formatDate(prediction.timestamp)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="recommendation">
                                <h4>💡 Recommendation</h4>
                                <p>
                                    {prediction.isRecyclable
                                        ? 'Place this item in the recycling bin. Make sure it is clean and dry before recycling.'
                                        : 'This organic material should be composted or placed in the organic waste bin. It will decompose naturally and can be used as fertilizer.'}
                                </p>
                            </div>

                            <div className="action-buttons">
                                <button onClick={handleReset} className="primary-btn">
                                    🆕 Classify Another Image
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="secondary-btn"
                                >
                                    🖨️ Print Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="info-section">
                <h3>ℹ️ How It Works</h3>
                <div className="info-cards">
                    <div className="info-card">
                        <div className="card-icon">📸</div>
                        <h4>1. Upload Image</h4>
                        <p>Take a clear photo of the waste item you want to classify</p>
                    </div>
                    <div className="info-card">
                        <div className="card-icon">🤖</div>
                        <h4>2. AI Analysis</h4>
                        <p>Our AI model analyzes the image using deep learning</p>
                    </div>
                    <div className="info-card">
                        <div className="card-icon">📊</div>
                        <h4>3. Get Results</h4>
                        <p>Receive instant classification with confidence score</p>
                    </div>
                    <div className="info-card">
                        <div className="card-icon">♻️</div>
                        <h4>4. Proper Disposal</h4>
                        <p>Follow the recommendation for proper waste disposal</p>
                    </div>
                </div>
            </div>

            <div className="footer">
                <p>Powered by TensorFlow & React • Waste Classification System</p>
                <div className="footer-links">
                    <a href="/about">About</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/contact">Contact</a>
                    <a href="/help">Help</a>
                </div>
            </div>
        </div>
    );
};

export default WasteClassifier;