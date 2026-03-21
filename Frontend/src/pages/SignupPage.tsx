import React from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignup = (name: string, email: string, password: string) => {
    // TODO: integrate with backend API
    console.log("Signup:", { name, email, password });
    // Store user name for navbar display
    localStorage.setItem("userName", name);
    // After successful signup, redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <SignupForm onSubmit={handleSignup} />
    </main>
  );
};

export default SignupPage;
