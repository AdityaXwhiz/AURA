import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/common/ProtectedRoute";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const PlanSelection = lazy(() => import("./pages/PlanSelection"));
const ProtocolPage = lazy(() => import("./pages/ProtocolPage"));
const DailyGoals = lazy(() => import("./pages/dailygoals"));
const RankPage = lazy(() => import("./pages/rank"));
const Profile = lazy(() => import("./pages/Profile"));
const Activity = lazy(() => import("./pages/Activity"));
const DailyCheckin = lazy(() => import("./pages/DailyCheckin"));
const AdaptiveCenter = lazy(() => import("./pages/AdaptiveCenter"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-black text-red-500 flex items-center justify-center">Loading Aura...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* Updated path to lowercase convention for clean URLs */}
          <Route path="/planselection" element={<PlanSelection />} />
          <Route path="/dailygoals" element={<ProtectedRoute><DailyGoals /></ProtectedRoute>} />
          <Route path="/dailygoals/:type" element={<ProtectedRoute><DailyGoals /></ProtectedRoute>} />
          <Route
            path="/daily-checkin"
            element={
              <ProtectedRoute>
                <DailyCheckin />
              </ProtectedRoute>
            }
          />
          <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
          <Route path="/protocol/:type" element={<ProtectedRoute><ProtocolPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
          <Route
            path="/adaptive-center"
            element={
              <ProtectedRoute>
                <AdaptiveCenter />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;