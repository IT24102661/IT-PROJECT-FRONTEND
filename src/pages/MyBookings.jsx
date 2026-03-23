import "./myBookings.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("appointments") || "[]");
    setList(data);
  }, []);

  const del = (id) => {
    if (!confirm("Delete booking?")) return;
    const next = list.filter((b) => b.id !== id);
    setList(next);
    localStorage.setItem("appointments", JSON.stringify(next));
  };

  return (
    <div className="mb">
      <div className="mb-card">
        <div className="mb-top">
          <div>
            <div className="mb-title">My Bookings</div>
            <div className="mb-sub">Your booking requests and status.</div>
          </div>

          <button className="mb-btn mb-btn-ghost" onClick={() => navigate("/trainers")} type="button">
            Back to Trainers
          </button>
        </div>

        {list.length === 0 ? (
          <div className="mb-empty">No bookings yet.</div>
        ) : (
          <div className="mb-list">
            {list.map((b) => (
              <div className="mb-item" key={b.id}>
                <div>
                  <div className="mb-h">{b.trainerName} ({b.trainerSpec})</div>
                  <div className="mb-m">
                    Date: <b>{b.date}</b> | Time: <b>{b.time}</b>
                  </div>
                  <div className="mb-m">
                    Member: <b>{b.memberName}</b> | Phone: <b>{b.memberPhone}</b>
                  </div>

                  <span className={`mb-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>

                <button className="mb-btn mb-btn-danger" onClick={() => del(b.id)} type="button">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}