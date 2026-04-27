import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import PlanSelection from "./pages/PlanSelection"; // Matches component name
import ProtocolPage from "./pages/ProtocolPage";
import DailyGoals from "./pages/dailygoals";
import RankPage from "./pages/rank";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* Updated path to lowercase convention for clean URLs */}
        <Route path="/planselection" element={<PlanSelection />} />
        <Route path="/dailygoals" element={<ProtectedRoute><DailyGoals /></ProtectedRoute>} />
        <Route path="/dailygoals/:type" element={<ProtectedRoute><DailyGoals /></ProtectedRoute>} />
        <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
        <Route path="/protocol/:type" element={<ProtectedRoute><ProtocolPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;