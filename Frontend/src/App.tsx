import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { getMe } from "./api/auth";

type AuthStatus = "loading" | "authenticated" | "guest";

const RouteGuard: React.FC<{
  mode: "protected" | "public";
  children: React.ReactElement;
}> = ({ mode, children }) => {
  const [authStatus, setAuthStatus] = React.useState<AuthStatus>("loading");

  React.useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        await getMe();
        if (active) {
          setAuthStatus("authenticated");
        }
      } catch {
        if (active) {
          setAuthStatus("guest");
        }
      }
    };

    void checkAuth();

    return () => {
      active = false;
    };
  }, []);

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-on-surface-variant">
        Checking your session...
      </main>
    );
  }

  if (mode === "protected") {
    return authStatus === "authenticated" ? children : <Navigate to="/login" replace />;
  }

  return authStatus === "authenticated" ? <Navigate to="/dashboard" replace /> : children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <RouteGuard mode="public">
              <LoginPage />
            </RouteGuard>
          }
        />
        <Route
          path="/signup"
          element={
            <RouteGuard mode="public">
              <SignupPage />
            </RouteGuard>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <RouteGuard mode="public">
              <VerifyOTPPage />
            </RouteGuard>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RouteGuard mode="public">
              <ForgotPasswordPage />
            </RouteGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteGuard mode="protected">
              <DashboardPage />
            </RouteGuard>
          }
        />
        <Route
          path="/analytics"
          element={
            <RouteGuard mode="protected">
              <AnalyticsPage />
            </RouteGuard>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
