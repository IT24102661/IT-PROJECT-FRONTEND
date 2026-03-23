import "./memberDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MAPI  = "http://localhost:5000/api/members";
const AAPI  = "http://localhost:5000/api/appointments";
const ATAPI = "http://localhost:5000/api/attendance";

// ── Mark Today Attendance Component ──────────────────
function MarkTodayAttendance({ memberId, memberName }) {
  const [marked,     setMarked]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState("");
  const [msgType,    setMsgType]    = useState("");
  const [notes,      setNotes]      = useState("");
  const [checking,   setChecking]   = useState(true);

  const today     = new Date().toISOString().split("T")[0];
  const todayTime = new Date().toTimeString().slice(0,5);

  useEffect(() => {
    fetch(`${ATAPI}/member/${memberId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const todayRec = data.find(r => r.date === today);
          if (todayRec) {
            setMarked(todayRec.status);
            setMsg(`Already marked as ${todayRec.status} today`);
            setMsgType(todayRec.status === "Present" ? "ok" : "err");
          }
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [memberId, today]);

  async function markAttendance(status) {
    setSubmitting(true);
    setMsg("");
    try {
      const res  = await fetch(ATAPI, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          memberName,
          date:  today,
          time:  todayTime,
          status,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg("❌ " + (data.errors?.[0] || "Failed"));
        setMsgType("err");
        return;
      }
      setMarked(status);
      setMsg(`✅ Marked as ${status} for today!`);
      setMsgType(status === "Present" ? "ok" : "err");
    } catch {
      setMsg("❌ Server error");
      setMsgType("err");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return (
    <div className="glass mdCard">
      <div className="mdCardTitle">📅 Today's Attendance</div>
      <div className="mdEmpty">Checking...</div>
    </div>
  );

  return (
    <div className="glass mdCard">
      <div className="mdCardTitle">📅 Today's Attendance</div>
      <div className="mdAttDate">📅 {today} &nbsp;•&nbsp; 🕐 {todayTime}</div>

      {msg && (
        <div className={`mdAttMsg ${msgType==="ok"?"mdAttMsgOk":"mdAttMsgErr"}`}>
          {msg}
        </div>
      )}

      {marked ? (
        <div className="mdMarkedBox">
          <div className="mdMarkedIcon">{marked==="Present" ? "✅" : "❌"}</div>
          <div className="mdMarkedText">
            You have already marked attendance today as{" "}
            <strong style={{color: marked==="Present"?"#6effa8":"#ff9999"}}>
              {marked}
            </strong>
          </div>
        </div>
      ) : (
        <>
          <div className="mdAttNoteField">
            <span>Notes (optional)</span>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special notes..."
              className="mdAttNoteInput"
            />
          </div>

          <div className="mdAttMarkBtns">
            <button
              className="mdAttMarkBtn mdAttMarkPresent"
              onClick={() => markAttendance("Present")}
              disabled={submitting}
            >
              <span className="mdAttMarkIcon">✅</span>
              <span className="mdAttMarkLabel">Present</span>
              <span className="mdAttMarkDesc">I am here today</span>
            </button>

            <button
              className="mdAttMarkBtn mdAttMarkAbsent"
              onClick={() => markAttendance("Absent")}
              disabled={submitting}
            >
              <span className="mdAttMarkIcon">❌</span>
              <span className="mdAttMarkLabel">Absent</span>
              <span className="mdAttMarkDesc">Cannot attend today</span>
            </button>
          </div>

          {submitting && <div className="mdEmpty">Saving...</div>}
        </>
      )}
    </div>
  );
}

// ── Attendance History Component ──────────────────────
function AttendanceHistory({ memberId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ATAPI}/member/${memberId}`)
      .then(res => res.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [memberId]);

  const total    = records.length;
  const present  = records.filter(r => r.status === "Present").length;
  const absent   = records.filter(r => r.status === "Absent").length;
  const pct      = total ? Math.round((present / total) * 100) : 0;
  const pctColor = pct >= 80 ? "#6effa8" : pct >= 60 ? "#ffd966" : "#ff9999";
  const pctLabel = pct >= 80 ? "🟢 Good" : pct >= 60 ? "🟡 Average" : "🔴 Poor";

  if (loading) return (
    <div className="glass mdCard">
      <div className="mdCardTitle">📊 Attendance History</div>
      <div className="mdEmpty">Loading...</div>
    </div>
  );

  return (
    <div className="glass mdCard">
      <div className="mdCardTitle">📊 Attendance History</div>

      <div className="mdAttStats">
        <div className="mdAttStat">
          <div className="mdAttNum">{total}</div>
          <div className="mdAttLbl">Total</div>
        </div>
        <div className="mdAttStat">
          <div className="mdAttNum" style={{color:"#6effa8"}}>{present}</div>
          <div className="mdAttLbl">Present ✅</div>
        </div>
        <div className="mdAttStat">
          <div className="mdAttNum" style={{color:"#ff9999"}}>{absent}</div>
          <div className="mdAttLbl">Absent ❌</div>
        </div>
        <div className="mdAttStat">
          <div className="mdAttNum" style={{color: pctColor}}>{pct}%</div>
          <div className="mdAttLbl">{pctLabel}</div>
        </div>
      </div>

      {total > 0 && (
        <div className="mdAttBar">
          <div className="mdAttBarFill" style={{ width:`${pct}%`, background: pctColor }} />
        </div>
      )}

      {records.length === 0 ? (
        <div className="mdEmpty">
          <div style={{fontSize:"36px",marginBottom:"8px"}}>📭</div>
          <div>No attendance records yet</div>
        </div>
      ) : (
        <div className="mdAttTable">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`mdAttBadge ${r.status==="Present"?"mdBadgeGreen":"mdBadgeRed"}`}>
                      {r.status === "Present" ? "✅ Present" : "❌ Absent"}
                    </span>
                  </td>
                  <td className="mdAttNotes">{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Member Dashboard ─────────────────────────────
export default function MemberDashboard() {
  const nav = useNavigate();
  const { memberId } = useParams();

  const [member,       setMember]       = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState("profile");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res  = await fetch(`${MAPI}/${memberId}`);
        const data = await res.json();
        if (!res.ok) { setError("Member not found"); return; }
        setMember(data);

        try {
          const query = new URLSearchParams({
            memberId: data.memberId,
          });
          const aRes  = await fetch(`${AAPI}?${query.toString()}`);
          const aData = await aRes.json();
          const safeList = Array.isArray(aData)
            ? aData.filter((appt) => String(appt.memberId || "").trim().toUpperCase() === data.memberId)
            : [];
          setAppointments(safeList);
        } catch {
          setAppointments([]);
        }
      } catch {
        setError("Cannot connect to server");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [memberId]);

  if (loading) return (
    <div className="mdWrap">
      <div className="mdLoading">Loading your profile...</div>
    </div>
  );

  if (error) return (
    <div className="mdWrap">
      <div className="mdError glass">
        <div style={{fontSize:"48px",marginBottom:"12px"}}>❌</div>
        <div className="mdErrorTitle">{error}</div>
        <button className="mdBtn mdBtnRed" onClick={() => nav("/join")}>Try Again</button>
      </div>
    </div>
  );

  const approved  = appointments.filter(a => a.status === "Approved").length;
  const pending   = appointments.filter(a => a.status === "Pending").length;
  const rated     = appointments.filter(a => a.rating);
  const avgRating = rated.length
    ? (rated.reduce((s,a) => s + a.rating, 0) / rated.length).toFixed(1)
    : null;

  return (
    <div className="mdWrap">
      <div className="mdContainer">

        {/* ── TOP ── */}
        <div className="mdTop">
          <div className="mdTopLeft">
            <div className="mdAvatar">{member.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="mdName">{member.name}</div>
              <div className="mdMeta">
                <span className="mdBadge">{member.membership}</span>
                <span className="mdMemberId">ID: {member.memberId}</span>
              </div>
            </div>
          </div>
          <div className="mdTopRight">
            <button className="mdBtn mdBtnGhost" onClick={() => nav("/")}>🏠 Home</button>
            <button className="mdBtn mdBtnRed" onClick={() => nav("/trainers")}>Book Trainer</button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="mdStats">
          <div className="glass mdStat">
            <div className="mdStatNum">{appointments.length}</div>
            <div className="mdStatLbl">Total Bookings</div>
          </div>
          <div className="glass mdStat">
            <div className="mdStatNum">{approved}</div>
            <div className="mdStatLbl">Approved</div>
          </div>
          <div className="glass mdStat">
            <div className="mdStatNum">{pending}</div>
            <div className="mdStatLbl">Pending</div>
          </div>
          <div className="glass mdStat">
            <div className="mdStatNum">{avgRating ? `${avgRating}⭐` : "—"}</div>
            <div className="mdStatLbl">Avg Rating Given</div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mdTabs">
          <button className={`mdTab ${activeTab==="profile"     ?"mdTabActive":""}`} onClick={() => setActiveTab("profile")}>👤 Profile</button>
          <button className={`mdTab ${activeTab==="appointments"?"mdTabActive":""}`} onClick={() => setActiveTab("appointments")}>📅 My Bookings ({appointments.length})</button>
          <button className={`mdTab ${activeTab==="attendance"  ?"mdTabActive":""}`} onClick={() => setActiveTab("attendance")}>📊 Attendance</button>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="glass mdCard">
            <div className="mdCardTitle">Personal Information</div>
            <div className="mdProfileGrid">
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Full Name</span>
                <span className="mdProfileVal">{member.name}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Member ID</span>
                <span className="mdProfileVal mdHighlight">{member.memberId}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Email</span>
                <span className="mdProfileVal">{member.email}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Phone</span>
                <span className="mdProfileVal">{member.phone}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">NIC</span>
                <span className="mdProfileVal">{member.nic}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Age</span>
                <span className="mdProfileVal">{member.age} years</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Address</span>
                <span className="mdProfileVal">{member.address}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Membership</span>
                <span className={`mdMemberBadge mdMember${member.membership}`}>{member.membership}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Joined</span>
                <span className="mdProfileVal">{new Date(member.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mdProfileItem">
                <span className="mdProfileLabel">Status</span>
                <span className="mdStatusBadge">{member.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === "appointments" && (
          <div className="glass mdCard">
            <div className="mdCardTitle">My Trainer Bookings</div>
            {appointments.length === 0 ? (
              <div className="mdEmpty">
                <div style={{fontSize:"40px",marginBottom:"10px"}}>📭</div>
                <div>No bookings yet</div>
                <button
                  className="mdBtn mdBtnRed"
                  style={{marginTop:"14px"}}
                  onClick={() => nav("/trainers")}
                >
                  Book a Trainer Now
                </button>
              </div>
            ) : (
              <div className="mdBookingList">
                {appointments.map(a => (
                  <div className="mdBookingCard" key={a._id}>
                    <div className="mdBookingTop">
                      <div>
                        <div className="mdBookingTrainer">🏋️ {a.trainerName}</div>
                        <div className="mdBookingSpec">{a.trainerSpec}</div>
                      </div>
                      <span className={`mdBookingBadge ${a.status==="Approved"?"mdBadgeGreen":a.status==="Rejected"?"mdBadgeRed":"mdBadgeYellow"}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="mdBookingMeta">
                      <span>📅 {a.date}</span>
                      <span>🕐 {a.time}</span>
                    </div>
                    {a.rating && (
                      <div className="mdBookingRating">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{color: i<=a.rating?"#ffd700":"rgba(255,255,255,0.2)"}}>★</span>
                        ))}
                        <span className="mdRatingNum">{a.rating}/5</span>
                        {a.review && <span className="mdReview">"{a.review}"</span>}
                      </div>
                    )}
                    {!a.rating && a.status === "Approved" && (
                      <button
                        className="mdRateBtn"
                        onClick={() => nav(`/book/${a.trainerId}`)}
                      >
                        ⭐ Rate this session
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {activeTab === "attendance" && (
          <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>
            <MarkTodayAttendance
              memberId={member.memberId}
              memberName={member.name}
            />
            <AttendanceHistory memberId={member.memberId} />
          </div>
        )}

      </div>
    </div>
  );
}