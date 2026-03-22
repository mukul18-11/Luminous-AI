import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import MaterialIcon from "../ui/MaterialIcon";
import SocialLoginButton from "./SocialLoginButton";

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  error?: string;
  googleOverlay?: React.ReactNode;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onGoogleSignIn,
  isLoading = false,
  isGoogleLoading = false,
  error,
  googleOverlay,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    onSubmit(name, email, password);
  };

  const displayError = validationError || error;

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
          Create account
        </h2>
        <p className="text-on-surface-variant font-medium">
          Start organizing with your voice
        </p>
      </div>

      {/* Error message */}
      {displayError && (
        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm text-center font-medium">
          {displayError}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="signup-name"
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          id="signup-email"
          label="Email address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="signup-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          id="signup-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>

        <SocialLoginButton
          provider="google"
          onClick={onGoogleSignIn}
          label={isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}
          overlay={googleOverlay}
        />
      </form>

      {/* Login Link */}
      <p className="mt-10 text-center text-sm text-on-surface-variant font-medium">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
