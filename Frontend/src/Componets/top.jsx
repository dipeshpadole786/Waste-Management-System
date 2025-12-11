import "./top.css"
// import "../Pages/Home.css"
export function Top() {
    return (
        <div className="government-top-banner">
            <div className="container">
                <div className="national-emblem">
                    <div className="ashoka-chakra">
                        <div className="chakra-wheel">☸</div>
                    </div>
                </div>
                <div className="portal-title">
                    <h1>सुरक्षित नगर पोर्टल</h1>
                    <h2>Safe City Initiative - Citizen Safety Portal</h2>
                    {/* <p className="tagline">Empowering Citizens, Ensuring Safety</p> */}
                </div>
                <div className="tricolor-flag">
                    <div className="tricolor-stripe saffron"></div>
                    <div className="tricolor-stripe white"></div>
                    <div className="tricolor-stripe green"></div>
                </div>
            </div>
        </div>
    )

}