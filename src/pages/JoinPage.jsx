import "./joinPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinPage() {
  const nav = useNavigate();
  const [memberId, setMemberId]   = useState("");
  const [error,    setError]      = useState("");
  const [loading,  setLoading]    = useState(false);

  async function searchMember(e) {
    e.preventDefault();
    setError("");
    if (!memberId.trim()) { setError("Please enter your Member ID"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/members/${memberId.trim()}`);
      const data = await res.json();
      if (!res.ok) { setError(data.errors?.[0] || "Member not found"); return; }
      nav(`/my-profile/${memberId.trim()}`);
    } catch { setError("Cannot connect to server"); }
    finally  { setLoading(false); }
  }

  return (
    <div className="jpWrap">
      <div className="jpContainer">

        {/* Header */}
        <div className="jpHeader">
          <div className="jpBrand" onClick={() => nav("/")}>
            <span className="jpRed">Royal</span>{" "}
            <span className="jpWhite">Fitness</span>
          </div>
          <h1 className="jpTitle">Join Royal Fitness</h1>
          <p className="jpSub">New member or returning? Choose your option below.</p>
        </div>

        {/* Two Cards */}
        <div className="jpCards">

          {/* New Member */}
          <div className="jpCard glass jpCardNew">
            <div className="jpCardIcon">🆕</div>
            <h2 className="jpCardTitle">New Member</h2>
            <p className="jpCardDesc">
              First time here? Register now and get access to our certified trainers,
              easy booking system and fitness tracking.
            </p>
            <ul className="jpCardPerks">
              <li>✅ Book certified trainers</li>
              <li>✅ Track your fitness progress</li>
              <li>✅ Attend group classes</li>
              <li>✅ Get personalized training</li>
            </ul>
            <button className="jpBtn jpBtnRed" onClick={() => nav("/member-register")}>
              Register Now →
            </button>
          </div>

          {/* Divider */}
          <div className="jpDivider">
            <div className="jpDividerLine" />
            <span className="jpDividerText">OR</span>
            <div className="jpDividerLine" />
          </div>

          {/* Old Member */}
          <div className="jpCard glass jpCardOld">
            <div className="jpCardIcon">👤</div>
            <h2 className="jpCardTitle">Existing Member</h2>
            <p className="jpCardDesc">
              Already a member? Enter your Member ID to view your profile,
              book trainers and check your attendance history.
            </p>

            <form className="jpSearchForm" onSubmit={searchMember} noValidate>
              <label className="jpField">
                <span>Member ID</span>
                <input
                  value={memberId}
                  onChange={e => { setMemberId(e.target.value.toUpperCase()); setError(""); }}
                  placeholder="e.g. M001"
                  className={error ? "jpInputErr" : ""}
                />
                {error && <span className="jpErr">{error}</span>}
              </label>
              <button className="jpBtn jpBtnBlue" type="submit" disabled={loading}>
                {loading ? "Searching..." : "Find My Profile →"}
              </button>
            </form>

          </div>
        </div>

        {/* Back to home */}
        <button className="jpBackBtn" onClick={() => nav("/")}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}