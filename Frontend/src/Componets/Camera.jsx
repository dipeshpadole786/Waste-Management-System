import "../Pages/Home.css"

const CameraReporter = () => {
    const handleScanClick = () => {
        // Logic to open the camera or file picker goes here
        alert("Initiating Report: Opening camera or file picker...");
    };

    return (
        <div className="home-card camera-reporter">
            {/* Icon placeholder for camera */}
            <div className="camera-icon" onClick={handleScanClick}>
                📸
            </div>
            <p className="action-text">
                **Scan and send garbage image** if necessary (for reporting issues).
            </p>
            <button className="btn btn-primary" onClick={handleScanClick}>
                Report Issue Now
            </button>
        </div>
    );
};

export default CameraReporter;