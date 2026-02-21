import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding"; // New Import
import Planner from "./pages/Planner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Point */}
        <Route path="/" element={<Landing />} />
        
        {/* Biometric Link & Onboarding Sequence */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Final Execution Hub */}
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;