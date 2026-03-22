import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OTPInput from "../components/auth/OTPInput";
import MaterialIcon from "../components/ui/MaterialIcon";
import { resendOTP, verifyOTP } from "../api/auth";

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Start cooldown timer
  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOTPComplete = async (otp: string) => {
    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const data = await verifyOTP(email, otp);
      localStorage.setItem(
        "userName",
        localStorage.getItem("pendingUserName") || data.user.name || email.split("@")[0]
      );
      localStorage.removeItem("pendingUserName");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const data = await resendOTP(email);
      setSuccess(data.message || "New OTP sent to your email!");
      startCooldown();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to resend OTP right now.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MaterialIcon icon="mark_email_read" className="text-primary text-3xl" filled />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              Verify your email
            </h1>
            <p className="text-on-surface-variant text-sm">
              We've sent a 6-digit code to
            </p>
            <p className="text-primary font-bold text-sm mt-1">
              {email || "your email"}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <OTPInput onComplete={handleOTPComplete} />
          </div>

          {/* Loading state */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 mb-6 text-primary text-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm text-center font-medium">
              {success}
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            <p className="text-on-surface-variant text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="text-primary font-bold text-sm hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend OTP"}
            </button>
          </div>

          {/* Expiry notice */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-on-surface-variant/60 text-xs">
              <MaterialIcon icon="timer" size="sm" className="mr-1" />
              Code expires in 10 minutes
            </p>
          </div>

          {/* Back to signup */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-on-surface-variant text-xs hover:text-white transition-colors"
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyOTPPage;
