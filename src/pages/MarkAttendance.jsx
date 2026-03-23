import "./markAttendance.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAPI = "http://localhost:5000/api/members";
const ATAPI = "http://localhost:5000/api/attendance";

export default function MarkAttendance() {
  const nav = useNavigate();

  const [step,       setStep]       = useState(1); // 1=search, 2=mark
  const [memberId,   setMemberId]   = useState("");
  const [member,     setMember]     = useState(null);
  const [searchErr,  setSearchErr]  = useState("");
  const [searching,  setSearching]  = useState(false);
  const [status,     setStatus]     = useState("Present");
  const [notes,      setNotes]      = useState("");
  const [msg,        setMsg]        = useState("");
  const [msgType,    setMsgType]    = useState(""); // ok or err
  const [submitting, setSubmitting] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const today     = new Date().toISOString().split("T")[0];
  const todayTime = new Date().toTimeString().slice(0, 5);

  // ── Step 1 — Search Member ───────────────────────────
  async function searchMember(e) {
    e.preventDefault();
    setSearchErr(""); setMember(null); setMsg("");
    if (!memberId.trim()) { setSearchErr("Please enter your Member ID"); return; }
    setSearching(true);
    try {
      const res  = await fetch(`${MAPI}/${memberId.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) { setSearchErr("Member not found. Check your Member ID"); return; }
      setMember(data);

      // Check if already marked today
      const aRes  = await fetch(`${ATAPI}/member/${data.memberId}`);
      const aData = await aRes.json();
      if (Array.isArray(aData)) {
        const todayRecord = aData.find(r => r.date === today);
        if (todayRecord) {
          setAlreadyMarked(true);
          setMsg(`⚠️ Attendance already marked today as: ${todayRecord.status}`);
          setMsgType("warn");
        } else {
          setAlreadyMarked(false);
        }
      }
      setStep(2);
    } catch { setSearchErr("Cannot connect to server"); }
    finally  { setSearching(false); }
  }

  // ── Step 2 — Mark Attendance ─────────────────────────
  async function markAttendance(selectedStatus) {
    setMsg(""); setSubmitting(true);
    try {
      const res  = await fetch(ATAPI, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId:   member.memberId,
          memberName: member.name,
          date:       today,
          time:       todayTime,
          status:     selectedStatus,
          notes:      notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg("❌ " + (data.errors?.[0] || "Failed"));
        setMsgType("err");
        return;
      }
      setMsg(`✅ Attendance marked as ${selectedStatus} for ${member.name}`);
      setMsgType("ok");
      setAlreadyMarked(true);
      setStatus(selectedStatus);
    } catch { setMsg("❌ Cannot connect to server"); setMsgType("err"); }
    finally  { setSubmitting(false); }
  }

  function reset() {
    setStep(1); setMember(null); setMemberId("");
    setMsg(""); setNotes(""); setAlreadyMarked(false);
    setSearchErr(""); setStatus("Present");
  }

  return (
    <div className="maWrap">
      <div className="maContainer">

        {/* Header */}
        <div className="maHeader">
          <div className="maBrand" onClick={() => nav("/")}>
            <span className="maRed">Royal</span>{" "}
            <span className="maWhite">Fitness</span>
          </div>
          <h1 className="maTitle">📋 Daily Attendance</h1>
          <p className="maSub">Mark your attendance for today — {new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
        </div>

        {/* ── STEP 1 — Search ── */}
        {step === 1 && (
          <div className="glass maCard">
            <div className="maCardIcon">🔍</div>
            <div className="maCardTitle">Find Your Profile</div>
            <div className="maCardSub">Enter your Member ID to mark today's attendance</div>

            <form className="maSearchForm" onSubmit={searchMember} noValidate>
              <div className="maField">
                <span>Member ID *</span>
                <input
                  value={memberId}
                  onChange={e => { setMemberId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")); setSearchErr(""); }}
                  placeholder="e.g. M001"
                  className={`maInput maInputLarge ${searchErr?"maInputErr":""}`}
                  autoFocus
                />
                {searchErr && <span className="maErr">{searchErr}</span>}
              </div>
              <button className="maBtn maBtnBlue" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Find Me →"}
              </button>
            </form>

            <div className="maInfoBox">
              <span>ℹ️</span>
              <span>Don't have a Member ID? <span className="maLink" onClick={() => nav("/member-register")}>Register here</span></span>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Mark ── */}
        {step === 2 && member && (
          <>
            {/* Member Info */}
            <div className="glass maMemberCard">
              <div className="maMemberAvatar">{member.name.charAt(0)}</div>
              <div className="maMemberInfo">
                <div className="maMemberName">{member.name}</div>
                <div className="maMemberMeta">
                  <span>ID: {member.memberId}</span>
                  <span>•</span>
                  <span>{member.membership} Member</span>
                  <span>•</span>
                  <span>📞 {member.phone}</span>
                </div>
              </div>
              <button className="maBackBtn" onClick={reset}>✕ Change</button>
            </div>

            {/* Message */}
            {msg && (
              <div className={`maMsg ${msgType==="ok"?"maMsgOk":msgType==="warn"?"maMsgWarn":"maMsgErr"}`}>
                {msg}
              </div>
            )}

            {/* Mark Attendance */}
            {!alreadyMarked ? (
              <div className="glass maCard">
                <div className="maCardTitle">Mark Today's Attendance</div>
                <div className="maCardSub">📅 {today} &nbsp;•&nbsp; 🕐 {todayTime}</div>

                {/* Notes */}
                <div className="maField" style={{margin:"16px 0"}}>
                  <span>Notes (optional)</span>
                  <input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special notes..."
                    className="maInput"
                  />
                </div>

                {/* Present / Absent buttons */}
                <div className="maMarkBtns">
                  <button
                    className="maMarkBtn maMarkPresent"
                    onClick={() => markAttendance("Present")}
                    disabled={submitting}
                  >
                    <span className="maMarkIcon">✅</span>
                    <span className="maMarkLabel">Present</span>
                    <span className="maMarkDesc">I am here today</span>
                  </button>

                  <button
                    className="maMarkBtn maMarkAbsent"
                    onClick={() => markAttendance("Absent")}
                    disabled={submitting}
                  >
                    <span className="maMarkIcon">❌</span>
                    <span className="maMarkLabel">Absent</span>
                    <span className="maMarkDesc">I cannot attend today</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Already marked — show result */
              <div className="glass maCard maAlreadyCard">
                <div className="maAlreadyIcon">
                  {msg.includes("Present") || status === "Present" ? "✅" : "❌"}
                </div>
                <div className="maAlreadyTitle">
                  Attendance Marked!
                </div>
                <div className="maAlreadyStatus">
                  Status: <strong style={{color: status==="Present"||msg.includes("Present") ? "#6effa8" : "#ff9999"}}>
                    {status === "Present" || msg.includes("Present") ? "Present" : "Absent"}
                  </strong>
                </div>
                <div className="maAlreadyDate">📅 {today} &nbsp;•&nbsp; 🕐 {todayTime}</div>
                <div className="maAlreadyActions">
                  <button className="maBtn maBtnRed" onClick={() => nav(`/my-profile/${member.memberId}`)}>
                    View My Profile →
                  </button>
                  <button className="maBtn maBtnGhost" onClick={reset}>
                    Mark Another Member
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <button className="maHomeBtn" onClick={() => nav("/")}>← Back to Home</button>

      </div>
    </div>
  );
}