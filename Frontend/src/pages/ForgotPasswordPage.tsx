import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import MaterialIcon from "../components/ui/MaterialIcon";
import OTPInput from "../components/auth/OTPInput";
import { forgotPassword, resetPassword } from "../api/auth";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"request" | "reset">("request");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || "Password reset OTP sent to your email.");
      setStep("reset");
    } catch (err: any) {
      const timeoutMessage =
        err.code === "ECONNABORTED"
          ? "Request timed out while sending OTP. The email service may be unavailable right now."
          : null;
      setError(
        timeoutMessage ||
          err.response?.data?.message ||
          (err.request ? "Backend is unreachable. Start the server and check the API port." : "Unable to send OTP right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP from your email.");
      return;
    }

    setIsResetting(true);
    setError("");
    setSuccess("");

    try {
      const data = await resetPassword(email, otp, password);
      setSuccess(data.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to reset password right now.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-12 flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.3)]">
            <MaterialIcon icon="lock_reset" className="text-black text-2xl" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Luminous Voice
          </h1>
        </div>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            {step === "request" ? "Forgot password" : "Reset password"}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {step === "request"
              ? "Enter your email and we will send a reset OTP"
              : "Enter the OTP from Gmail and choose a new password"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm text-center font-medium">
            {success}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <Input
              id="forgot-email"
              label="Email address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <Input
              id="reset-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">OTP code</label>
              <OTPInput onComplete={setOtp} />
              <p className="text-xs text-on-surface-variant text-center">
                Enter the 6-digit OTP sent to your Gmail
              </p>
            </div>

            <Input
              id="reset-password"
              label="New password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              id="reset-confirm-password"
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isResetting}>
              {isResetting ? "Resetting password..." : "Reset password"}
            </Button>
          </form>
        )}

        <p className="mt-10 text-center text-sm text-on-surface-variant font-medium">
          Remember your password?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
