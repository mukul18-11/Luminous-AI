import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { googleAuth, login } from "../api/auth";

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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isGoogleReady, setIsGoogleReady] = React.useState(false);
  const googleButtonHostRef = React.useRef<HTMLDivElement | null>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = React.useState(380);

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
    const host = googleButtonHostRef.current;
    if (!host) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.max(Math.round(host.getBoundingClientRect().width), 220);
      setGoogleButtonWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(host);

    return () => resizeObserver.disconnect();
  }, []);

  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setIsGoogleReady(false);
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonHostRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) {
            void handleGoogleCredential(credential);
          }
        },
      });

      googleButtonHostRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonHostRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: googleButtonWidth,
      });

      setIsGoogleReady(true);
      return true;
    };

    if (renderGoogleButton()) {
      return () => {
        cancelled = true;
      };
    }

    setIsGoogleReady(false);
    const intervalId = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [googleButtonWidth, handleGoogleCredential]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      localStorage.setItem("userName", data.user.name);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.request
          ? "Backend is unreachable. Start the server and check the API port."
          : "Unable to sign in right now.");
      const needsVerification = err.response?.data?.needsVerification;
      const pendingEmail = err.response?.data?.email || email;

      if (needsVerification) {
        navigate("/verify-otp", { state: { email: pendingEmail } });
        return;
      }

      setError(message);
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

    if (!isGoogleReady) {
      setError("Google Sign-In is still loading. Please wait a moment and try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <LoginForm
        onSubmit={handleLogin}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        error={error}
        googleOverlay={
          <div className="w-full rounded-lg border border-outline-variant bg-black/40 px-3 py-3">
            <div ref={googleButtonHostRef} className="flex min-h-[40px] w-full items-center justify-center" />
            {!isGoogleReady && (
              <div className="pt-2 text-center text-sm text-on-surface-variant">
                Loading Google Sign-In...
              </div>
            )}
          </div>
        }
      />
    </main>
  );
};

export default LoginPage;
