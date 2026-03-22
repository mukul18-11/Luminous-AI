import React from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";
import { googleAuth, signup } from "../api/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      setIsGoogleLoading(true);
      setError("");

      try {
        const data = await googleAuth(credential);
        localStorage.setItem("userName", data.user.name);
        navigate("/dashboard");
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Google Sign-In failed. Check your Google client ID setup."
        );
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate]
  );

  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        if (credential) {
          void handleGoogleCredential(credential);
        }
      },
    });
  }, [handleGoogleCredential]);

  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      await signup(name, email, password);
      localStorage.setItem("pendingUserName", name);
      navigate("/verify-otp", { state: { email } });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (err.request
            ? "Backend is unreachable. Start the server and check the API port."
            : "Unable to create your account.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Set VITE_GOOGLE_CLIENT_ID in Frontend/.env to enable Google Sign-In.");
      return;
    }

    if (!window.google?.accounts?.id) {
      setError("Google Sign-In script is not loaded yet. Refresh and try again.");
      return;
    }

    setError("");
    window.google.accounts.id.prompt();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <SignupForm
        onSubmit={handleSignup}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        error={error}
      />
    </main>
  );
};

export default SignupPage;
