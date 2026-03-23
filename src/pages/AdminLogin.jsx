import "./adminLogin.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");

  function onLogin(e) {
    e.preventDefault();
    setErr("");

    if (email.trim() === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem(
        "rf_admin_auth",
        JSON.stringify({ token: "demo-token", email, loginAt: Date.now() })
      );
      nav("/admin");
      return;
    }

    setErr("Invalid admin credentials ");
  }

  return (
    <div className="alWrap">
      <div className="container">
        <div className="glass alCard">
          <div className="alTitle">Admin Login</div>

          <form onSubmit={onLogin} className="alForm">
            <label>
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {err && <div className="alErr">{err}</div>}

            <button className="btn btnRed alBtn" type="submit">
              Login
            </button>

            <div className="alLinks">
              <Link className="btn" to="/">Home</Link>
              <Link className="btn" to="/trainer-register">Trainer Register</Link>
            </div>

            <div className="muted alDemo">Demo: admin@gmail.com / admin123</div>
          </form>
        </div>
      </div>
    </div>
  );
}