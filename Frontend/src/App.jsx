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

function App() {
  return (
    <Router>
      <div>
        <Top></Top>
        <Header />

      </div>


      <Routes>
        <Route path="/" element={

          <Home></Home>
        } />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/filecom" element={<FileComplaint />} />
        <Route path="/login" element={<AadhaarLogin></AadhaarLogin>} />
        <Route path="/training" element={<TrainingAwareness></TrainingAwareness>} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
