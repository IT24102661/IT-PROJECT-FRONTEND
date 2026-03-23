import "./auth.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Enter your name");
    if (!phone.trim()) return alert("Enter your phone");

    // demo auth
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: "demo-user-token",
        role: "user",
        name: name.trim(),
        phone: phone.trim(),
      })
    );

    navigate("/trainers");
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-top">
          <div>
            <div className="auth-title">User Login</div>
            <div className="auth-sub">Login to book trainers.</div>
          </div>

          <button className="auth-link" onClick={() => navigate("/admin-login")} type="button">
            Admin Login →
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Amal" />
          </label>

          <label>
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
            />
          </label>

          <button className="auth-btn auth-btn-red" type="submit">
            Login
          </button>

          <button className="auth-btn auth-btn-ghost" type="button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}