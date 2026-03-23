import "./trainersPage.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const TAPI = "http://localhost:5000/api/trainers";
const AAPI = "http://localhost:5000/api/appointments";

export default function TrainersPage() {
  const nav = useNavigate();

  const [trainers,  setTrainers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [q,         setQ]         = useState("");
  const [onlyAvail, setOnlyAvail] = useState(true);

  // ── Booking history modal ────────────────────────────
  const [historyTrainer,  setHistoryTrainer]  = useState(null);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);

  // ── Fetch approved trainers ──────────────────────────
  useEffect(() => {
    fetch(TAPI)
      .then(res => res.json())
      .then(data => { setTrainers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Filter ───────────────────────────────────────────
  const filtered = trainers.filter((t) => {
    const text  = `${t.name} ${t.phone} ${t.spec}`.toLowerCase();
    const okQ   = text.includes(q.toLowerCase());
    const okAvl = onlyAvail ? t.available === true : true;
    return okQ && okAvl;
  });

  // ── Open booking history ─────────────────────────────
  async function openHistory(trainer) {
    setHistoryTrainer(trainer);
    setHistoryBookings([]);
    setHistoryLoading(true);
    try {
      const res  = await fetch(`${AAPI}/trainer/${trainer._id}`);
      const data = await res.json();
      setHistoryBookings(Array.isArray(data) ? data : []);
    } catch { setHistoryBookings([]); }
    finally  { setHistoryLoading(false); }
  }

  function closeHistory() { setHistoryTrainer(null); setHistoryBookings([]); }

  // ── Average rating ───────────────────────────────────
  function avgRating(bookings) {
    const rated = bookings.filter(b => b.rating);
    if (!rated.length) return null;
    return (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1);
  }

  // ── Stars display ────────────────────────────────────
  function Stars({ rating, size = 16 }) {
    if (!rating) return <span className="tpNoRating">No ratings yet</span>;
    return (
      <span className="tpStars">
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ color: i <= Math.round(rating) ? "#ffd700" : "rgba(255,255,255,0.2)", fontSize: size }}>★</span>
        ))}
        <span className="tpStarsNum">{rating}</span>
      </span>
    );
  }

  // ── Trainer avg rating from appointments ─────────────
  const [trainerRatings, setTrainerRatings] = useState({});

  useEffect(() => {
    if (!trainers.length) return;
    trainers.forEach(async (t) => {
      try {
        const res  = await fetch(`${AAPI}/trainer/${t._id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const rated = data.filter(b => b.rating);
          const avg   = rated.length
            ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
            : null;
          setTrainerRatings(p => ({ ...p, [t._id]: { avg, count: rated.length, total: data.length } }));
        }
      } catch {}
    });
  }, [trainers]);

  return (
    <div className="tpWrap">
      <div className="container">

        {/* TOP */}
        <div className="tpTop">
          <div>
            <div className="tpTitle">Our Trainers</div>
            <div className="muted">All approved trainers — book your session today</div>
          </div>
          <div className="tpNav">
            <Link className="btn" to="/">Home</Link>
            <Link className="btn" to="/trainer-register">Register as Trainer</Link>
          </div>
        </div>

        {/* FILTERS */}
        <div className="glass tpFilters">
          <input
            className="tpSearch"
            placeholder="🔍 Search by name / specialization..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <label className="tpCheck">
            <input
              type="checkbox"
              checked={onlyAvail}
              onChange={e => setOnlyAvail(e.target.checked)}
            />
            <span>Only Available</span>
          </label>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="tpLoading">Loading trainers...</div>
        )}

        {/* TRAINER CARDS */}
        {!loading && (
          <>
            {filtered.length === 0 ? (
              <div className="tpEmpty">
                <div className="tpEmptyIcon">🏋️</div>
                <div>No trainers found</div>
              </div>
            ) : (
              <div className="tpCards">
                {filtered.map((t) => {
                  const rInfo = trainerRatings[t._id];
                  return (
                    <div className="tpCard glass" key={t._id}>

                      {/* Card Top */}
                      <div className="tpCardTop">
                        <div className="tpCardAvatar">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="tpCardInfo">
                          <div className="tpCardName">{t.name}</div>
                          <div className="tpCardSpec">{t.spec}</div>
                        </div>
                        <span className={`tpAvailBadge ${t.available ? "tpAvailYes" : "tpAvailNo"}`}>
                          {t.available ? "● Available" : "● Unavailable"}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="tpCardRating">
                        {rInfo?.avg ? (
                          <>
                            {[1,2,3,4,5].map(i => (
                              <span key={i} style={{ color: i <= Math.round(rInfo.avg) ? "#ffd700" : "rgba(255,255,255,0.2)", fontSize: "18px" }}>★</span>
                            ))}
                            <span className="tpCardRatingNum">{rInfo.avg}</span>
                            <span className="tpCardRatingCount">({rInfo.count} reviews)</span>
                          </>
                        ) : (
                          <span className="tpNoRating">No ratings yet</span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="tpCardDetails">
                        <div className="tpCardDetail">
                          <span className="tpDetailIcon">🎓</span>
                          <span>{t.exp} years experience</span>
                        </div>
                        <div className="tpCardDetail">
                          <span className="tpDetailIcon">📞</span>
                          <span>{t.phone}</span>
                        </div>
                        <div className="tpCardDetail">
                          <span className="tpDetailIcon">🕐</span>
                          <span>{t.from} – {t.to}</span>
                        </div>
                        <div className="tpCardDetail">
                          <span className="tpDetailIcon">📋</span>
                          <span>{rInfo?.total ?? 0} total bookings</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="tpCardActions">
                        <button
                          className="btn btnRed tpBookBtn"
                          disabled={!t.available}
                          onClick={() => nav(`/book/${t._id}`)}
                        >
                          {t.available ? "Book Now" : "Unavailable"}
                        </button>
                        <button
                          className="btn tpHistoryBtn"
                          onClick={() => openHistory(t)}
                        >
                          📋 Reviews
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            <div className="muted tpFoot">
              Showing {filtered.length} trainer{filtered.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      {/* ══ BOOKING HISTORY MODAL ══ */}
      {historyTrainer && (
        <div className="tpModalBackdrop" onClick={closeHistory}>
          <div className="tpModal" onClick={e => e.stopPropagation()}>

            <button className="tpModalClose" onClick={closeHistory}>✕</button>

            {/* Modal Header */}
            <div className="tpModalHead">
              <div className="tpModalAvatar">{historyTrainer.name.charAt(0)}</div>
              <div>
                <div className="tpModalName">{historyTrainer.name}</div>
                <div className="tpModalSpec">{historyTrainer.spec} • {historyTrainer.exp} yrs exp</div>
                {historyBookings.length > 0 && avgRating(historyBookings) && (
                  <div className="tpModalRating">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ color: i <= Math.round(avgRating(historyBookings)) ? "#ffd700" : "rgba(255,255,255,0.2)", fontSize: "20px" }}>★</span>
                    ))}
                    <span className="tpModalRatingNum">
                      {avgRating(historyBookings)}/5 ({historyBookings.filter(b => b.rating).length} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="tpModalDivider" />

            {/* Bookings */}
            {historyLoading ? (
              <div className="tpModalEmpty">Loading...</div>
            ) : historyBookings.length === 0 ? (
              <div className="tpModalEmpty">
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                <div>No bookings yet for this trainer</div>
              </div>
            ) : (
              <div className="tpModalList">
                {historyBookings.map((b) => (
                  <div className="tpModalItem" key={b._id}>
                    <div className="tpModalItemTop">
                      <div className="tpModalItemUser">👤 {b.userName}</div>
                      <span className={`tpModalBadge ${b.status === "Approved" ? "badgeGreen" : b.status === "Rejected" ? "badgeRed" : "badgeYellow"}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="tpModalItemMeta">
                      📅 {b.date} &nbsp;•&nbsp; 🕐 {b.time} &nbsp;•&nbsp; 📞 {b.userPhone}
                    </div>
                    {b.rating && (
                      <div className="tpModalItemRating">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ color: i <= b.rating ? "#ffd700" : "rgba(255,255,255,0.2)", fontSize: "16px" }}>★</span>
                        ))}
                        <span className="tpStarsNum">{b.rating}/5</span>
                        {b.review && <span className="tpModalReview">"{b.review}"</span>}
                      </div>
                    )}
                    {!b.rating && b.status === "Approved" && (
                      <div className="tpModalNoRating">No rating yet</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button className="btn tpModalCloseBtn" onClick={closeHistory}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}