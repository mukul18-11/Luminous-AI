import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import SocialLoginButton from "./SocialLoginButton";
import MaterialIcon from "../ui/MaterialIcon";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onGoogleSignIn,
  isLoading = false,
  isGoogleLoading = false,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="mb-12 flex items-center justify-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.3)]">
          <MaterialIcon icon="mic" className="text-black text-2xl" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">
          Luminous Voice
        </h1>
      </div>

      {/* Welcome Text */}
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          Welcome back
        </h2>
        <p className="text-on-surface-variant font-medium">
          Please enter your details
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Forgot Password */}
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-primary hover:text-primary-dim transition-colors"
          >
            Forgot password
          </Link>
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Social Login */}
        <SocialLoginButton
          provider="google"
          onClick={onGoogleSignIn}
          label={isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}
        />
      </form>

      {/* Sign Up Link */}
      <p className="mt-10 text-center text-sm text-on-surface-variant font-medium">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
