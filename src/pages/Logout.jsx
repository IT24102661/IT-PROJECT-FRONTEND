import "./auth.css";
import "./logout.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  // Clear all auth on mount
  useEffect(() => {
    localStorage.removeItem("rf_admin_auth");
    localStorage.removeItem("auth");
  }, []);

  return (
    <div className="auth logout-bg">
      <div className="auth-card logout-card">

        {/* Icon */}
        <div className="logout-icon-wrap">
          <div className="logout-icon">👋</div>
        </div>

        {/* Text */}
        <h2 className="logout-title">You've been logged out</h2>
        <p className="logout-sub">
          Thanks for using <span className="logout-brand-red">Royal</span>{" "}
          <span className="logout-brand-white">Fitness</span>. See you again soon!
        </p>

        {/* Actions */}
        <div className="logout-actions">
          <button
            className="auth-btn auth-btn-red"
            onClick={() => navigate("/trainer-register")}
            type="button"
          >
            Login as Trainer
          </button>

          <button
            className="auth-btn auth-btn-ghost"
            onClick={() => navigate("/")}
            type="button"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}