import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import Tracking from "./Pages/Tracking";
import FileComplaint from "./Pages/FileComplaint";
import "./App.css";
import Header from "./Componets/Header";
import Footer from "./Componets/Footer";
import AadhaarLogin from "./Pages/Login";
import { Top } from "./Componets/top";
import TrainingAwareness from "./Pages/TrainingAwarness";
import ProtectedRoute from "./Componets/ProtectedRoute";

function App() {
  return (
    <Router>
      <Top />
      <Header />

      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<AadhaarLogin />} />

        {/* Protected Routes */}
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/filecom"
          element={
            <ProtectedRoute>
              <FileComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <TrainingAwareness />
            </ProtectedRoute>
          }
        />

      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
