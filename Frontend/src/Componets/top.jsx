import "./top.css";

export function Top() {
    return (
        <div className="top-banner">
            <div className="top-banner-inner">

                {/* Emblem */}
                <div className="top-emblem">
                    <div className="top-chakra-ring">
                        <span className="top-chakra">☸</span>
                    </div>
                </div>

                {/* Title */}
                <div className="top-title">
                    <h1>सुरक्षित नगर पोर्टल</h1>
                    <h2>Safe City Initiative — Citizen Safety Portal</h2>
                    <div className="top-tagline-row">
                        <span className="top-tagline-dot"></span>
                        <span>Government of India</span>
                        <span className="top-tagline-sep">·</span>
                        <span>Ministry of Home Affairs</span>
                        <span className="top-tagline-sep">·</span>
                        <span>Empowering Citizens, Ensuring Safety</span>
                        <span className="top-tagline-dot"></span>
                    </div>
                </div>

                {/* Tricolor Flag */}
                <div className="top-flag">
                    <div className="top-flag-stripe saffron"></div>
                    <div className="top-flag-stripe white">
                        <span className="top-flag-chakra">☸</span>
                    </div>
                    <div className="top-flag-stripe green"></div>
                </div>

            </div>

            {/* Bottom accent line */}
            <div className="top-accent-bar">
                <div className="top-accent-saffron"></div>
                <div className="top-accent-white"></div>
                <div className="top-accent-green"></div>
            </div>
        </div>
    );
}