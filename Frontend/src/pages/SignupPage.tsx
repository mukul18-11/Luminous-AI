import React from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignup = (name: string, email: string, password: string) => {
    // TODO: integrate with backend API
    // POST /api/auth/signup → then navigate to verify-otp
    console.log("Signup:", { name, email, password });

    // Store name for later use after verification
    localStorage.setItem("pendingUserName", name);

    // Navigate to OTP verification page, passing email via route state
    navigate("/verify-otp", { state: { email } });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <SignupForm onSubmit={handleSignup} />
    </main>
  );
};

export default SignupPage;
