import "./loginChoice.css";
import { useNavigate } from "react-router-dom";

export default function LoginChoice() {
  const nav = useNavigate();

  return (
    <div className="lc-wrap">
      <div className="lc-box">

        {/* Header */}
        <div className="lc-header">
          <div className="lc-brand">
            <span className="lc-red">Royal</span>{" "}
            <span className="lc-white">Fitness</span>
          </div>
          <h2 className="lc-title">Welcome Back!</h2>
          <p className="lc-sub">Choose how you want to login</p>
        </div>

        {/* Cards */}
        <div className="lc-cards">

          {/* Admin Login */}
          <button className="lc-card lc-card-admin" onClick={() => nav("/admin-login")} type="button">
            <div className="lc-card-icon">🛡️</div>
            <div className="lc-card-info">
              <div className="lc-card-title">Admin Login</div>
              <div className="lc-card-desc">Manage trainers, bookings & dashboard</div>
            </div>
            <div className="lc-arrow">→</div>
          </button>

          {/* Customer Login */}
          <button className="lc-card lc-card-user" onClick={() => nav("/user-login")} type="button">
            <div className="lc-card-icon">👤</div>
            <div className="lc-card-info">
              <div className="lc-card-title">Customer Login</div>
              <div className="lc-card-desc">Book trainers & manage your appointments</div>
            </div>
            <div className="lc-arrow">→</div>
          </button>

        </div>

        {/* Back */}
        <button className="lc-back" onClick={() => nav("/")} type="button">
          ← Back to Home
        </button>

      </div>
    </div>
  );
}