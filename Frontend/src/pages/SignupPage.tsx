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
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number | string;
            }
          ) => void;
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
  const googleButtonHostRef = React.useRef<HTMLDivElement | null>(null);

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      setIsGoogleLoading(true);
      setError("");

      try {
        const data = await googleAuth(credential);
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
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

    if (googleButtonHostRef.current) {
      googleButtonHostRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonHostRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        width: 380,
      });
    }
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
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <SignupForm
        onSubmit={handleSignup}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        error={error}
        googleOverlay={
          <div className="absolute inset-0 z-10 overflow-hidden rounded-lg opacity-0">
            <div ref={googleButtonHostRef} className="h-full w-full" />
          </div>
        }
      />
    </main>
  );
};

export default SignupPage;
