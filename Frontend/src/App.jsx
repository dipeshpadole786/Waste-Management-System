import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import "./index.css"

/* 🌐 USER PAGES */
import { Home } from "./Pages/Home";
import Tracking from "./Pages/Tracking";
import FileComplaint from "./Pages/FileComplaint";
import FileSuccess from "./Pages/File_succes";
import TrackStatus from "./Pages/TrackStatus";
import TrainingAwareness from "./Pages/TrainingAwarness";
import Profile from "./Pages/Profile";
import AadhaarLogin from "./Pages/Login";
import SafetyGuidelines from "./Pages/Safety";
import Notification from "./Pages/Notification";
import WasteClassifier from "./Componets/Waste_classifier";

/* 🏢 MONITOR */
import Homef from "./Office/Home";
import ShowComplaints from "./Office/showcomplain";
import UserProgress from "./Office/Userprogress";
import EditArticle from "./Office/ArticalEdit";

/* 👷 WORKER */
import Homew from "./Worker/Home";

/* 🧩 COMPONENTS */
import Header from "./Componets/Header";
import Headerh from "./Office/Header";
import Headerw from "./Worker/Header";
import Footer from "./Componets/Footer";
import Footerw from "./Worker/Footer";
import { Top } from "./Componets/top";
import ProtectedRoute from "./Componets/ProtectedRoute";
import WorkerProfile from "./Worker/Profile";
import WasteBotWidget from "./Componets/WasteBotWidget";

function Layout() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setRole(user?.role || "user");
  }, []);

  return (
    <>
      <Top />

      {/* 🔰 ROLE BASED HEADER */}
      {role === "monitor" ? (
        <Headerh />
      ) : role === "worker" ? (
        <Headerw />
      ) : (
        <Header />
      )}

      {/* 🚦 ROUTES */}
      <Routes>
        {/* 🌐 HOME BASED ON ROLE */}
        <Route
          path="/"
          element={
            role === "monitor" ? (
              <Homef />
            ) : role === "worker" ? (
              <Homew />
            ) : (
              <Home />
            )
          }
        />

        {/* 🌐 PUBLIC */}
        <Route path="/login" element={<AadhaarLogin />} />

        {/* 👤 USER */}
        <Route
          path="/tracking"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Tracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/predict"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <WasteClassifier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/safety"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SafetyGuidelines />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file-complaint"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filecom"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file_succes"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TrainingAwareness />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TrackStatus />
            </ProtectedRoute>
          }
        />

        {/* 🏢 MONITOR */}
        <Route
          path="/monitor"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <Homef />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-progress"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <UserProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/show-complaints"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <ShowComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editArtical"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <EditArticle />
            </ProtectedRoute>
          }
        />

        {/* 👷 WORKER */}
        <Route
          path="/worker-home"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <Homew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-profile"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
      </Routes>


      {/* 🔻 FOOTER */}
      <WasteBotWidget />
      {role === "worker" ? <Footerw /> : <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
