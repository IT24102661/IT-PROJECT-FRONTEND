import "./bookPage.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TAPI = "http://localhost:5000/api/trainers";
const AAPI = "http://localhost:5000/api/appointments";

export default function BookPage() {
  const nav = useNavigate();
  const { trainerId } = useParams();

  const [trainer,    setTrainer]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [ok,         setOk]         = useState("");
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [bookedId,   setBookedId]   = useState(null); // after booking saved

  // ── Rating state ─────────────────────────────────────
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [review,       setReview]       = useState("");
  const [ratingOk,     setRatingOk]     = useState("");
  const [ratingErr,    setRatingErr]    = useState("");
  const [ratingDone,   setRatingDone]   = useState(false);
  const [ratingSubmit, setRatingSubmit] = useState(false);

  const [form, setForm] = useState({ memberId: "", date: "", time: "" });

  useEffect(() => {
    fetch(`${TAPI}/all`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(t => t._id === trainerId);
        setTrainer(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [trainerId]);

  function validate() {
    const e = {};
    if (!form.memberId.trim())                         e.memberId  = "Member ID is required";
    else if (!/^M\d{3,}$/i.test(form.memberId.trim())) e.memberId  = "Member ID must look like M001";
    if (!form.date)                                    e.date      = "Date is required";
    else if (new Date(form.date) < new Date(new Date().toDateString())) e.date = "Date cannot be in the past";
    if (!form.time)                                    e.time      = "Time is required";
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    setOk("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res  = await fetch(AAPI, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainer._id,
          trainerName: trainer.name,
          trainerSpec: trainer.spec,
          memberId: form.memberId.trim().toUpperCase(),
          date: form.date,
          time: form.time,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const be = {};
        (data.errors || []).forEach(msg => {
          if (msg.toLowerCase().includes("member"))     be.memberId = msg;
          else if (msg.toLowerCase().includes("date"))  be.date      = msg;
          else if (msg.toLowerCase().includes("time") || msg.toLowerCase().includes("booked")) be.time = msg;
          else be.general = msg;
        });
        setErrors(be);
        return;
      }
      setOk("✅ Booking sent! Admin will approve soon.");
      setBookedId(data.appt._id);
      setForm({ memberId: "", date: "", time: "" });
    } catch { setErrors({ general: "❌ Cannot connect to server." }); }
    finally  { setSubmitting(false); }
  }

  function onChange(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "", general: "" }));
  }

  // ── Submit rating ────────────────────────────────────
  async function submitRating(e) {
    e.preventDefault();
    setRatingErr("");
    if (!rating) { setRatingErr("Please select a star rating"); return; }
    if (review.length > 300) { setRatingErr("Review cannot exceed 300 characters"); return; }
    setRatingSubmit(true);
    try {
      const res  = await fetch(`${AAPI}/${bookedId}/rate`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });
      const data = await res.json();
      if (!res.ok) { setRatingErr(data.errors?.[0] || "Failed to submit rating"); return; }
      setRatingOk("⭐ Thank you for your rating!");
      setRatingDone(true);
    } catch { setRatingErr("❌ Server error. Try again."); }
    finally  { setRatingSubmit(false); }
  }

  if (loading) return <div className="bkWrap"><div className="container"><div className="glass bkCard"><div className="bkTitle">Loading...</div></div></div></div>;
  if (!trainer) return <div className="bkWrap"><div className="container"><div className="glass bkCard"><div className="bkTitle">Trainer not found</div><button className="btn" onClick={() => nav("/trainers")}>Back</button></div></div></div>;

  return (
    <div className="bkWrap">
      <div className="container">
        <div className="glass bkCard">
          <div className="bkTitle">Book Trainer</div>
          <div className="muted bkInfo">{trainer.name} • {trainer.spec} • {trainer.from} – {trainer.to}</div>
          <div className="bkMemberNotice">Only registered members can book. Member ID is required.</div>

          <form className="bkForm" onSubmit={submit} noValidate>
            {errors.general && <div className="bkErr">{errors.general}</div>}

            <label>
              <span>Member ID</span>
              <input required value={form.memberId} onChange={e => onChange("memberId", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="e.g. M001" className={errors.memberId ? "bkInputErr" : ""} />
              {errors.memberId && <span className="bkFieldErr">{errors.memberId}</span>}
            </label>

            <div className="bkRow">
              <label>
                <span>Date</span>
                <input type="date" value={form.date} onChange={e => onChange("date", e.target.value)} min={new Date().toISOString().split("T")[0]} className={errors.date ? "bkInputErr" : ""} />
                {errors.date && <span className="bkFieldErr">{errors.date}</span>}
              </label>
              <label>
                <span>Time</span>
                <input type="time" value={form.time} onChange={e => onChange("time", e.target.value)} className={errors.time ? "bkInputErr" : ""} />
                {errors.time && <span className="bkFieldErr">{errors.time}</span>}
              </label>
            </div>

            {ok && <div className="bkOk">{ok}</div>}

            <button className="btn btnRed bkBtn" type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Booking"}
            </button>

            <div className="bkLinks">
              <button className="btn" type="button" onClick={() => nav("/trainers")}>Back</button>
              <button className="btn" type="button" onClick={() => nav("/")}>Home</button>
            </div>
          </form>

          {/* ── RATING SECTION ── */}
          {bookedId && (
            <div className="bkRatingSection">
              <div className="bkRatingTitle">⭐ Rate Your Experience</div>
              <div className="bkRatingSub">Help others by rating this trainer</div>

              {ratingDone ? (
                <div className="bkOk" style={{ marginTop: "12px" }}>{ratingOk}</div>
              ) : (
                <form onSubmit={submitRating} noValidate>
                  {/* Stars */}
                  <div className="bkStars">
                    {[1,2,3,4,5].map(i => (
                      <button
                        key={i}
                        type="button"
                        className="bkStar"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        style={{ color: i <= (hoverRating || rating) ? "#ffd700" : "rgba(255,255,255,0.25)" }}
                      >
                        ★
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="bkRatingLabel">
                        {["","Poor","Fair","Good","Very Good","Excellent"][rating]}
                      </span>
                    )}
                  </div>

                  {/* Review */}
                  <label className="bkReviewLabel">
                    <span>Review (optional)</span>
                    <textarea
                      className="bkReviewInput"
                      value={review}
                      onChange={e => setReview(e.target.value)}
                      placeholder="Share your experience with this trainer..."
                      maxLength={300}
                      rows={3}
                    />
                    <span className="bkReviewCount">{review.length}/300</span>
                  </label>

                  {ratingErr && <div className="bkErr">{ratingErr}</div>}

                  <button className="btn btnRed bkBtn" type="submit" disabled={ratingSubmit}>
                    {ratingSubmit ? "Submitting..." : "Submit Rating"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}