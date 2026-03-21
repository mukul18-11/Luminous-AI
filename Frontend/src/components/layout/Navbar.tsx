import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-primary">
            Luminous Voice
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-medium tracking-tight">
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive("/dashboard")
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-slate-400 hover:text-primary"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className={`transition-colors ${
                isActive("/analytics")
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-slate-400 hover:text-primary"
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {userName ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary bg-surface-container-high flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm text-on-surface-variant hover:text-error transition-colors font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-primary font-bold hover:underline"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
