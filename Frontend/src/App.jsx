import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import Tracking from "./Pages/Tracking";
import FileComplaint from "./Pages/FileComplaint";
import FileSuccess from "./Pages/File_succes";
import "./App.css";
import TrackStatus from "./Pages/TrackStatus";
import Header from "./Componets/Header";
import Footer from "./Componets/Footer";
import AadhaarLogin from "./Pages/Login";
import { Top } from "./Componets/top";
import TrainingAwareness from "./Pages/TrainingAwarness";
import ProtectedRoute from "./Componets/ProtectedRoute";
import Profile from "./Pages/Profile";

function App() {
  return (
    <Router>
      <Top />
      <Header />

      <Routes>

        {/* Public Routes */}
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
              <br />
              <br />
              <FileComplaint />
            </ProtectedRoute>
          }
        />

        {/* ⭐ NEW SUCCESS PAGE ROUTE */}
        <Route
          path="/file_succes"
          element={
            <ProtectedRoute>
              <FileSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
        <Route
          path="/track"
          element={
            <ProtectedRoute>
              <TrackStatus />
            </ProtectedRoute>
          }
        />

      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
