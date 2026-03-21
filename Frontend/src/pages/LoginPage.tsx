import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    // TODO: integrate with backend API
    console.log("Login:", { email, password });
    // Store user name (use email prefix until backend returns real name)
    const name = email.split("@")[0];
    localStorage.setItem("userName", name);
    // After successful login, redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <LoginForm onSubmit={handleLogin} />
    </main>
  );
};

export default LoginPage;
