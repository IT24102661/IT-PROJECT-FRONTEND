import "./adminDashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const TAPI  = "http://localhost:5000/api/trainers";
const AAPI  = "http://localhost:5000/api/appointments";
const ASAPI = "http://localhost:5000/api/assignments";
const ATAPI = "http://localhost:5000/api/attendance";

const SPECS       = ["Strength", "Weight Training", "Yoga", "Cardio", "Crossfit", "Boxing"];
const CLASS_TYPES = ["Personal Training", "Group Class", "Online Session", "Special Program"];

export default function AdminDashboard() {
  const nav = useNavigate();

  const [trainers,     setTrainers]     = useState([]);
  const [requests,     setRequests]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [attendance,   setAttendance]   = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab,    setActiveTab]    = useState("requests");
  const [msg,          setMsg]          = useState("");
  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", phone:"", nic:"", age:"", address:"",
    spec:"Strength", exp:1, available:true, from:"08:00", to:"14:00", photo:"",
  });
  const [formErrors, setFormErrors] = useState({});

  const [editTrainer, setEditTrainer] = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [editErrors,  setEditErrors]  = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [scheduleTrainer, setScheduleTrainer] = useState(null);
  const [scheduleForm,    setScheduleForm]    = useState({});
  const [scheduleErrors,  setScheduleErrors]  = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [historyTrainer,  setHistoryTrainer]  = useState(null);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);

  const [assignForm,   setAssignForm]   = useState({
    trainerId:"", trainerName:"", trainerSpec:"",
    memberName:"", memberPhone:"", classType:"Personal Training",
    startDate:"", endDate:"", notes:"",
  });
  const [assignErrors,  setAssignErrors]  = useState({});
  const [assignLoading, setAssignLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────
  async function fetchAll() {
    setServerError(false);
    try {
      const [t, r, a, as, at] = await Promise.all([
        fetch(`${TAPI}/all`).then(res => res.json()),
        fetch(`${TAPI}/requests`).then(res => res.json()),
        fetch(AAPI).then(res => res.json()),
        fetch(ASAPI).then(res => res.json()),
        fetch(`${ATAPI}?date=${attendanceDate}`).then(res => res.json()),
      ]);
      setTrainers(Array.isArray(t)  ? t  : []);
      setRequests(Array.isArray(r)  ? r  : []);
      setAppointments(Array.isArray(a)  ? a  : []);
      setAssignments(Array.isArray(as) ? as : []);
      setAttendance(Array.isArray(at) ? at : []);
    } catch { setServerError(true); }
  }

  useEffect(() => { fetchAll(); }, [attendanceDate]);

  // ── Computed ─────────────────────────────────────────
  const approvedTrainers = trainers.filter(t => t.status === "Approved");
  const pendingRequests  = requests.filter(r => r.status === "Pending");
  const pendingAppts     = appointments.filter(a => a.status === "Pending");
  const activeAssigns    = assignments.filter(a => a.status === "Active");
  const presentCount     = attendance.filter(a => a.status === "Present").length;
  const absentCount      = attendance.filter(a => a.status === "Absent").length;

  // ── Validation ───────────────────────────────────────
  function validateTrainer(f) {
    const e = {};

    // Name
    if (!f.name.trim())                        e.name    = "Name is required";
    else if (f.name.trim().length < 3)         e.name    = "Min 3 characters";
    else if (f.name.trim().length > 50)        e.name    = "Max 50 characters";
    else if (!/^[a-zA-Z\s]+$/.test(f.name.trim())) e.name = "Name can only contain letters";

    // Email
    if (!f.email?.trim())                      e.email   = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Valid email required";

    // Phone
    if (!f.phone.trim())                       e.phone   = "Phone is required";
    else if (!/^\d+$/.test(f.phone))           e.phone   = "Digits only";
    else if (f.phone.length !== 10)            e.phone   = "Must be exactly 10 digits";
    else if (!f.phone.startsWith("0"))         e.phone   = "Must start with 0";
    else if (/^(.)\1+$/.test(f.phone))         e.phone   = "Invalid phone number";

    // NIC
    if (!f.nic?.trim())                        e.nic     = "NIC is required";
    else if (!/^(\d{9}[VvXx]|\d{12})$/.test(f.nic.trim())) e.nic = "Invalid NIC format";
    else if (/^(\d)\1{8}[VvXx]?$/.test(f.nic.trim())) e.nic = "Invalid NIC — same digits";
    else {
      const nic = f.nic.trim();
      if (nic.length === 10) {
        const year = parseInt("19" + nic.substring(0, 2));
        const days = parseInt(nic.substring(2, 5));
        if (year < 1900 || year > 2010) e.nic = "Invalid NIC year";
        else if (days < 1 || (days > 366 && days < 501) || days > 866) e.nic = "Invalid NIC day";
      } else if (nic.length === 12) {
        const year = parseInt(nic.substring(0, 4));
        const days = parseInt(nic.substring(4, 7));
        if (year < 1900 || year > 2010) e.nic = "Invalid NIC year";
        else if (days < 1 || (days > 366 && days < 501) || days > 866) e.nic = "Invalid NIC day";
      }
    }

    // Age
    if (!f.age && f.age !== 0)                 e.age     = "Age is required";
    else if (Number(f.age) < 18)               e.age     = "Must be at least 18";
    else if (Number(f.age) > 70)               e.age     = "Max age is 70";

    // Address
    if (!f.address?.trim())                    e.address = "Address is required";
    else if (f.address.trim().length < 10)     e.address = "Min 10 characters";

    // Exp
    if (f.exp === "" || Number(f.exp) < 0)     e.exp     = "Must be 0 or more";
    else if (Number(f.exp) > 50)               e.exp     = "Max 50 years";

    // Time
    if (!f.from)                               e.from    = "Required";
    if (!f.to)                                 e.to      = "Required";
    if (f.from && f.to && f.from >= f.to)      e.to      = "'To' must be after 'From'";

    return e;
  }

  function validateAssign(f) {
    const e = {};
    if (!f.trainerId)                                e.trainerId   = "Please select a trainer";
    if (!f.memberName.trim())                        e.memberName  = "Member name is required";
    else if (f.memberName.trim().length < 3)         e.memberName  = "Min 3 characters";
    else if (!/^[a-zA-Z\s]+$/.test(f.memberName.trim())) e.memberName = "Name — letters only";
    if (!f.memberPhone.trim())                       e.memberPhone = "Phone is required";
    else if (!/^\d+$/.test(f.memberPhone))           e.memberPhone = "Digits only";
    else if (f.memberPhone.length !== 10)            e.memberPhone = "Must be 10 digits";
    else if (!f.memberPhone.startsWith("0"))         e.memberPhone = "Must start with 0";
    else if (/^(.)\1+$/.test(f.memberPhone))         e.memberPhone = "Invalid phone number";
    if (!f.startDate)                                e.startDate   = "Start date required";
    if (!f.endDate)                                  e.endDate     = "End date required";
    if (f.startDate && f.endDate && new Date(f.startDate) > new Date(f.endDate))
      e.endDate = "End date must be after start date";
    return e;
  }

  // ── Input helpers ────────────────────────────────────
  function onlyDigits(val)    { return val.replace(/\D/g, ""); }
  function onlyNic(val)       { return val.replace(/[^0-9VvXx]/g, ""); }
  function onlyLetters(val)   { return val.replace(/[^a-zA-Z\s]/g, ""); }

  // ── Add Trainer ──────────────────────────────────────
  async function addTrainer(e) {
    e.preventDefault();
    setMsg("");
    const errs = validateTrainer(form);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setLoading(true);
    try {
      const res  = await fetch(TAPI, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.errors?.[0] || "Failed")); return; }
      await fetch(`${TAPI}/${data.trainer._id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status:"Approved" }) });
      setMsg("✅ Trainer added and approved!");
      setForm({ name:"", email:"", phone:"", nic:"", age:"", address:"", spec:"Strength", exp:1, available:true, from:"08:00", to:"14:00", photo:"" });
      fetchAll();
    } catch { setMsg("❌ Server error. Make sure backend is running!"); }
    finally  { setLoading(false); }
  }

  function onFormChange(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setFormErrors(p => ({ ...p, [field]: "" }));
  }

  // ── Edit ─────────────────────────────────────────────
  function openEdit(t) {
    setEditTrainer(t);
    setEditForm({
      name:t.name, email:t.email||"", phone:t.phone,
      nic:t.nic||"", age:t.age||"", address:t.address||"",
      spec:t.spec, exp:t.exp, available:t.available,
      from:t.from, to:t.to, photo:t.photo||"",
    });
    setEditErrors({});
  }
  function closeEdit() { setEditTrainer(null); }

  async function saveEdit(e) {
    e.preventDefault();
    const errs = validateTrainer(editForm);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setEditLoading(true);
    try {
      const res  = await fetch(`${TAPI}/${editTrainer._id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(editForm) });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.errors?.[0] || "Failed")); return; }
      setMsg("✅ Trainer updated!");
      closeEdit(); fetchAll();
    } catch { setMsg("❌ Server error."); }
    finally  { setEditLoading(false); }
  }

  function onEditChange(field, value) {
    setEditForm(p => ({ ...p, [field]: value }));
    setEditErrors(p => ({ ...p, [field]: "" }));
  }

  // ── Schedule ─────────────────────────────────────────
  function openSchedule(t) {
    setScheduleTrainer(t);
    setScheduleForm({ available:t.available, from:t.from, to:t.to });
    setScheduleErrors({});
  }
  function closeSchedule() { setScheduleTrainer(null); }

  async function saveSchedule(e) {
    e.preventDefault();
    const errs = {};
    if (!scheduleForm.from) errs.from = "Required";
    if (!scheduleForm.to)   errs.to   = "Required";
    if (scheduleForm.from && scheduleForm.to && scheduleForm.from >= scheduleForm.to)
      errs.to = "'To' must be after 'From'";
    if (Object.keys(errs).length > 0) { setScheduleErrors(errs); return; }
    setScheduleErrors({});
    setScheduleLoading(true);
    try {
      await fetch(`${TAPI}/${scheduleTrainer._id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name:scheduleTrainer.name, email:scheduleTrainer.email||"",
          phone:scheduleTrainer.phone, nic:scheduleTrainer.nic||"",
          age:scheduleTrainer.age||"", address:scheduleTrainer.address||"",
          spec:scheduleTrainer.spec, exp:scheduleTrainer.exp,
          available:scheduleForm.available, from:scheduleForm.from, to:scheduleForm.to,
          photo:scheduleTrainer.photo||"",
        }),
      });
      setMsg("✅ Schedule updated!"); closeSchedule(); fetchAll();
    } catch { setMsg("❌ Server error."); }
    finally  { setScheduleLoading(false); }
  }

  // ── History ──────────────────────────────────────────
  async function openHistory(t) {
    setHistoryTrainer(t); setHistoryBookings([]); setHistoryLoading(true);
    try {
      const res  = await fetch(`${AAPI}/trainer/${t._id}`);
      const data = await res.json();
      setHistoryBookings(Array.isArray(data) ? data : []);
    } catch { setHistoryBookings([]); }
    finally  { setHistoryLoading(false); }
  }
  function closeHistory() { setHistoryTrainer(null); }

  function avgRating(bookings) {
    const rated = bookings.filter(b => b.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1);
  }

  // ── Trainer CRUD ─────────────────────────────────────
  async function approveTrainer(id) { try { await fetch(`${TAPI}/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status:"Approved" }) }); setMsg("✅ Approved!"); fetchAll(); } catch { setMsg("❌ Failed"); } }
  async function rejectTrainer(id)  { try { await fetch(`${TAPI}/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status:"Rejected" }) }); setMsg("✅ Rejected");  fetchAll(); } catch { setMsg("❌ Failed"); } }
  async function deleteTrainer(id)  { if (!window.confirm("Delete?")) return; try { await fetch(`${TAPI}/${id}`, { method:"DELETE" }); setMsg("✅ Deleted"); fetchAll(); } catch { setMsg("❌ Failed"); } }

  // ── Appointment CRUD ─────────────────────────────────
  async function approveAppt(id) { try { await fetch(`${AAPI}/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status:"Approved" }) }); setMsg("✅ Approved!"); fetchAll(); } catch { setMsg("❌ Failed"); } }
  async function rejectAppt(id)  { try { await fetch(`${AAPI}/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status:"Rejected" }) }); setMsg("✅ Rejected");  fetchAll(); } catch { setMsg("❌ Failed"); } }
  async function deleteAppt(id)  { if (!window.confirm("Delete?")) return; try { await fetch(`${AAPI}/${id}`, { method:"DELETE" }); setMsg("✅ Deleted"); fetchAll(); } catch { setMsg("❌ Failed"); } }

  // ── Assignment CRUD ──────────────────────────────────
  async function createAssignment(e) {
    e.preventDefault(); setMsg("");
    const errs = validateAssign(assignForm);
    if (Object.keys(errs).length > 0) { setAssignErrors(errs); return; }
    setAssignErrors({}); setAssignLoading(true);
    try {
      const res  = await fetch(ASAPI, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(assignForm) });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.errors?.[0] || "Failed")); return; }
      setMsg("✅ Trainer assigned successfully!");
      setAssignForm({ trainerId:"", trainerName:"", trainerSpec:"", memberName:"", memberPhone:"", classType:"Personal Training", startDate:"", endDate:"", notes:"" });
      fetchAll();
    } catch { setMsg("❌ Server error."); }
    finally  { setAssignLoading(false); }
  }

  async function updateAssignStatus(id, status) { try { await fetch(`${ASAPI}/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status }) }); setMsg(`✅ Marked as ${status}`); fetchAll(); } catch { setMsg("❌ Failed"); } }
  async function deleteAssignment(id) { if (!window.confirm("Delete?")) return; try { await fetch(`${ASAPI}/${id}`, { method:"DELETE" }); setMsg("✅ Deleted"); fetchAll(); } catch { setMsg("❌ Failed"); } }

  function onAssignChange(field, value) {
    setAssignForm(p => ({ ...p, [field]: value }));
    setAssignErrors(p => ({ ...p, [field]: "" }));
  }
  function selectTrainerForAssign(t) {
    setAssignForm(p => ({ ...p, trainerId:t._id, trainerName:t.name, trainerSpec:t.spec }));
    setAssignErrors(p => ({ ...p, trainerId:"" }));
  }

  function logout() { localStorage.removeItem("rf_admin_auth"); nav("/admin-login"); }

  // ── RENDER ───────────────────────────────────────────
  return (
    <div className="adWrap">
      <div className="container">

        {/* TOP */}
        <div className="adTop">
          <div>
            <div className="adTitle">Admin Dashboard</div>
            <div className="adSub muted">Manage trainers • Approve requests • Handle appointments</div>
          </div>
          <div className="adNav">
            <Link className="btn" to="/">Home</Link>
            <Link className="btn" to="/trainers">Trainers Page</Link>
            <button className="btn btnRed" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* SERVER ERROR */}
        {serverError && (
          <div className="adServerError">
            ⚠️ Cannot connect to backend. Run <strong>node server.js</strong> then{" "}
            <button className="adRetryBtn" onClick={fetchAll}>Retry</button>
          </div>
        )}

        {/* STATS */}
        <div className="adStats">
          <div className="glass adStat"><div className="adStatNum">{approvedTrainers.length}</div><div className="adStatLbl">Active Trainers</div></div>
          <div className="glass adStat"><div className="adStatNum">{pendingRequests.length}</div><div className="adStatLbl">Pending Requests</div></div>
          <div className="glass adStat"><div className="adStatNum">{pendingAppts.length}</div><div className="adStatLbl">Pending Appointments</div></div>
          <div className="glass adStat"><div className="adStatNum">{activeAssigns.length}</div><div className="adStatLbl">Active Assignments</div></div>
        </div>

        {/* MESSAGE */}
        {msg && (
          <div className={msg.startsWith("✅") ? "adOk" : "adErr"} onClick={() => setMsg("")}>
            {msg} <span className="adMsgClose">✕</span>
          </div>
        )}

        {/* TABS */}
        <div className="adTabs">
          <button className={`adTab ${activeTab==="requests"     ?"adTabActive":""}`} onClick={() => setActiveTab("requests")}>📋 Requests ({pendingRequests.length})</button>
          <button className={`adTab ${activeTab==="trainers"     ?"adTabActive":""}`} onClick={() => setActiveTab("trainers")}>🏋️ Trainers ({approvedTrainers.length})</button>
          <button className={`adTab ${activeTab==="schedule"     ?"adTabActive":""}`} onClick={() => setActiveTab("schedule")}>📅 Schedules</button>
          <button className={`adTab ${activeTab==="assign"       ?"adTabActive":""}`} onClick={() => setActiveTab("assign")}>👥 Assign Trainer</button>
          <button className={`adTab ${activeTab==="attendance"   ?"adTabActive":""}`} onClick={() => setActiveTab("attendance")}>📊 Attendance ({attendance.length})</button>
          <button className={`adTab ${activeTab==="appointments" ?"adTabActive":""}`} onClick={() => setActiveTab("appointments")}>🗓️ Appointments ({appointments.length})</button>
          <button className={`adTab ${activeTab==="add"          ?"adTabActive":""}`} onClick={() => setActiveTab("add")}>➕ Add Trainer</button>
        </div>

        {/* ── REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">Trainer Register Requests</div><div className="muted">Approve to make visible to customers</div></div>
            <div className="adTableWrap">
              <table className="adTable">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>NIC</th><th>Age</th><th>Address</th><th>Spec</th><th>Exp</th><th>Time</th><th>Status</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {requests.length === 0
                    ? <tr><td colSpan="11" className="muted center">No requests yet</td></tr>
                    : requests.map(r => (
                      <tr key={r._id}>
                        <td className="strong">{r.name}</td>
                        <td>{r.email||"—"}</td><td>{r.phone}</td><td>{r.nic||"—"}</td>
                        <td>{r.age||"—"}</td><td>{r.address||"—"}</td>
                        <td>{r.spec}</td><td>{r.exp} yrs</td><td>{r.from}–{r.to}</td>
                        <td><span className={`adBadge ${r.status==="Approved"?"badgeGreen":r.status==="Rejected"?"badgeRed":"badgeYellow"}`}>{r.status}</span></td>
                        <td className="right"><div className="rowBtns">
                          <button className="btn btnSmall btnGreen" disabled={r.status!=="Pending"} onClick={() => approveTrainer(r._id)}>Approve</button>
                          <button className="btn btnSmall" disabled={r.status!=="Pending"} onClick={() => rejectTrainer(r._id)}>Reject</button>
                          <button className="btn btnSmall btnDanger" onClick={() => deleteTrainer(r._id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRAINERS ── */}
        {activeTab === "trainers" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">Available Trainers</div><div className="muted">Edit • Schedule • History</div></div>
            <div className="adTableWrap">
              <table className="adTable">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>NIC</th><th>Age</th><th>Spec</th><th>Exp</th><th>Available</th><th>Time</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {approvedTrainers.length === 0
                    ? <tr><td colSpan="10" className="muted center">No approved trainers yet</td></tr>
                    : approvedTrainers.map(t => (
                      <tr key={t._id}>
                        <td className="strong">{t.name}</td>
                        <td>{t.email||"—"}</td><td>{t.phone}</td><td>{t.nic||"—"}</td>
                        <td>{t.age||"—"}</td><td>{t.spec}</td><td>{t.exp} yrs</td>
                        <td><span className={`adBadge ${t.available?"badgeGreen":"badgeRed"}`}>{t.available?"Yes":"No"}</span></td>
                        <td>{t.from}–{t.to}</td>
                        <td className="right"><div className="rowBtns">
                          <button className="btn btnSmall btnPurple" onClick={() => openHistory(t)}>📋 History</button>
                          <button className="btn btnSmall btnBlue" onClick={() => openEdit(t)}>✏️ Edit</button>
                          <button className="btn btnSmall btnDanger" onClick={() => deleteTrainer(t._id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SCHEDULES ── */}
        {activeTab === "schedule" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">📅 Manage Trainer Schedules</div><div className="muted">Update availability and time slots</div></div>
            {approvedTrainers.length === 0
              ? <div className="muted center" style={{padding:"30px"}}>No approved trainers yet</div>
              : <div className="adScheduleGrid">
                  {approvedTrainers.map(t => (
                    <div className="adScheduleCard glass" key={t._id}>
                      <div className="adScheduleTop">
                        <div className="adScheduleAvatar">{t.name.charAt(0)}</div>
                        <div style={{flex:1}}>
                          <div className="adScheduleName">{t.name}</div>
                          <div className="adScheduleSpec muted">{t.spec} • Age: {t.age||"—"}</div>
                        </div>
                        <span className={`adBadge ${t.available?"badgeGreen":"badgeRed"}`}>{t.available?"Available":"Unavailable"}</span>
                      </div>
                      <div className="adScheduleTime">🕐 {t.from} – {t.to}</div>
                      <button className="btn btnBlue adScheduleBtn" onClick={() => openSchedule(t)}>✏️ Update Schedule</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── ASSIGN ── */}
        {activeTab === "assign" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">👥 Assign Trainer to Member</div><div className="muted">Directly assign a trainer to a member</div></div>
            <form className="adForm" onSubmit={createAssignment} noValidate>
              <div className="adAssignSection">
                <div className="adAssignLabel">1. Select Trainer *</div>
                {assignErrors.trainerId && <span className="adFieldErr" style={{marginBottom:"8px",display:"block"}}>{assignErrors.trainerId}</span>}
                {approvedTrainers.length === 0
                  ? <div className="adNoTrainers">⚠️ No approved trainers. Go to <strong>Add Trainer</strong> tab first.</div>
                  : <div className="adTrainerPicker">
                      {approvedTrainers.map(t => (
                        <div key={t._id} className={`adTrainerOption ${assignForm.trainerId===t._id?"adTrainerSelected":""}`} onClick={() => selectTrainerForAssign(t)}>
                          <div className="adTrainerOptionAvatar">{t.name.charAt(0)}</div>
                          <div><div className="adTrainerOptionName">{t.name}</div><div className="adTrainerOptionSpec muted">{t.spec}</div></div>
                          {assignForm.trainerId===t._id && <span className="adTrainerCheck">✓</span>}
                        </div>
                      ))}
                    </div>
                }
              </div>
              <div className="adAssignSection">
                <div className="adAssignLabel">2. Member Details *</div>
                <div className="adGrid">
                  <label className="adField"><span>Member Name *</span>
                    <input
                      value={assignForm.memberName}
                      onChange={e => onAssignChange("memberName", onlyLetters(e.target.value))}
                      placeholder="e.g. Saman Kumara"
                      className={assignErrors.memberName?"adInputErr":""}
                    />
                    {assignErrors.memberName && <span className="adFieldErr">{assignErrors.memberName}</span>}
                  </label>
                  <label className="adField"><span>Member Phone *</span>
                    <input
                      value={assignForm.memberPhone}
                      onChange={e => onAssignChange("memberPhone", onlyDigits(e.target.value))}
                      onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                      placeholder="0771234567"
                      maxLength={10}
                      inputMode="numeric"
                      className={assignErrors.memberPhone?"adInputErr":""}
                    />
                    <span style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>
                      {assignForm.memberPhone.length}/10 digits
                    </span>
                    {assignErrors.memberPhone && <span className="adFieldErr">{assignErrors.memberPhone}</span>}
                  </label>
                </div>
              </div>
              <div className="adAssignSection">
                <div className="adAssignLabel">3. Class & Schedule *</div>
                <div className="adGrid">
                  <label className="adField"><span>Class Type *</span>
                    <select value={assignForm.classType} onChange={e => onAssignChange("classType",e.target.value)}>
                      {CLASS_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="adField"><span>Notes (optional)</span>
                    <input value={assignForm.notes} onChange={e => onAssignChange("notes",e.target.value)} placeholder="Any special instructions..." />
                  </label>
                  <label className="adField"><span>Start Date *</span>
                    <input type="date" value={assignForm.startDate} onChange={e => onAssignChange("startDate",e.target.value)} min={new Date().toISOString().split("T")[0]} className={assignErrors.startDate?"adInputErr":""} />
                    {assignErrors.startDate && <span className="adFieldErr">{assignErrors.startDate}</span>}
                  </label>
                  <label className="adField"><span>End Date *</span>
                    <input type="date" value={assignForm.endDate} onChange={e => onAssignChange("endDate",e.target.value)} min={assignForm.startDate||new Date().toISOString().split("T")[0]} className={assignErrors.endDate?"adInputErr":""} />
                    {assignErrors.endDate && <span className="adFieldErr">{assignErrors.endDate}</span>}
                  </label>
                </div>
              </div>
              <div className="adFormActions">
                <button className="btn btnRed" type="submit" disabled={assignLoading}>{assignLoading?"Assigning...":"✅ Assign Trainer"}</button>
              </div>
            </form>

            {assignments.length > 0 && <>
              <div className="adAssignDivider" />
              <div className="adCardHead"><div className="adCardTitle">Current Assignments</div><div className="muted">All trainer-member assignments</div></div>
              <div className="adTableWrap">
                <table className="adTable">
                  <thead><tr><th>Trainer</th><th>Member</th><th>Phone</th><th>Class</th><th>Start</th><th>End</th><th>Status</th><th className="right">Action</th></tr></thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a._id}>
                        <td className="strong">{a.trainerName}</td><td>{a.memberName}</td><td>{a.memberPhone}</td>
                        <td>{a.classType}</td><td>{a.startDate}</td><td>{a.endDate}</td>
                        <td><span className={`adBadge ${a.status==="Active"?"badgeGreen":a.status==="Completed"?"badgeBlue":"badgeRed"}`}>{a.status}</span></td>
                        <td className="right"><div className="rowBtns">
                          <button className="btn btnSmall btnGreen" disabled={a.status!=="Active"} onClick={() => updateAssignStatus(a._id,"Completed")}>Complete</button>
                          <button className="btn btnSmall" disabled={a.status!=="Active"} onClick={() => updateAssignStatus(a._id,"Cancelled")}>Cancel</button>
                          <button className="btn btnSmall btnDanger" onClick={() => deleteAssignment(a._id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>}
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {activeTab === "appointments" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">Customer Appointments</div><div className="muted">Approve or reject bookings</div></div>
            <div className="adTableWrap">
              <table className="adTable">
                <thead><tr><th>Customer</th><th>Phone</th><th>Trainer</th><th>Date</th><th>Time</th><th>Status</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {appointments.length === 0
                    ? <tr><td colSpan="7" className="muted center">No appointments yet</td></tr>
                    : appointments.map(a => (
                      <tr key={a._id}>
                        <td className="strong">{a.userName}</td><td>{a.userPhone}</td><td>{a.trainerName}</td>
                        <td>{a.date}</td><td>{a.time}</td>
                        <td><span className={`adBadge ${a.status==="Approved"?"badgeGreen":a.status==="Rejected"?"badgeRed":"badgeYellow"}`}>{a.status}</span></td>
                        <td className="right"><div className="rowBtns">
                          <button className="btn btnSmall btnGreen" disabled={a.status!=="Pending"} onClick={() => approveAppt(a._id)}>Approve</button>
                          <button className="btn btnSmall" disabled={a.status!=="Pending"} onClick={() => rejectAppt(a._id)}>Reject</button>
                          <button className="btn btnSmall btnDanger" onClick={() => deleteAppt(a._id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ATTENDANCE ── */}
        {activeTab === "attendance" && (
          <div className="glass adCard">
            <div className="adCardHead">
              <div>
                <div className="adCardTitle">Member Attendance</div>
                <div className="muted">Admin view for daily Present/Absent marks</div>
              </div>
              <div className="adAttendanceFilter">
                <span>Date</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="adAttendanceStats">
              <div className="adAttendanceStat adAttendancePresent">
                <div className="adAttendanceNum">{presentCount}</div>
                <div className="adAttendanceLbl">Present</div>
              </div>
              <div className="adAttendanceStat adAttendanceAbsent">
                <div className="adAttendanceNum">{absentCount}</div>
                <div className="adAttendanceLbl">Absent</div>
              </div>
              <div className="adAttendanceStat">
                <div className="adAttendanceNum">{attendance.length}</div>
                <div className="adAttendanceLbl">Total Marked</div>
              </div>
            </div>

            <div className="adTableWrap">
              <table className="adTable">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Member Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan="6" className="muted center">No attendance marked for this date</td></tr>
                  ) : attendance.map(rec => (
                    <tr key={rec._id}>
                      <td className="strong">{rec.memberId}</td>
                      <td>{rec.memberName}</td>
                      <td>{rec.date}</td>
                      <td>{rec.time}</td>
                      <td>
                        <span className={`adBadge ${rec.status === "Present" ? "badgeGreen" : "badgeRed"}`}>
                          {rec.status === "Present" ? "✅ Present" : "❌ Absent"}
                        </span>
                      </td>
                      <td>{rec.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ADD TRAINER ── */}
        {activeTab === "add" && (
          <div className="glass adCard">
            <div className="adCardHead"><div className="adCardTitle">Add New Trainer</div><div className="muted">Auto approved by admin</div></div>
            <form className="adForm" onSubmit={addTrainer} noValidate>
              <div className="adGrid">
                <label className="adField"><span>Trainer Name *</span>
                  <input value={form.name} onChange={e => onFormChange("name", onlyLetters(e.target.value))} placeholder="e.g. Kamal Perera" className={formErrors.name?"adInputErr":""} />
                  {formErrors.name && <span className="adFieldErr">{formErrors.name}</span>}
                </label>
                <label className="adField"><span>Email *</span>
                  <input type="email" value={form.email} onChange={e => onFormChange("email",e.target.value)} placeholder="e.g. kamal@gmail.com" className={formErrors.email?"adInputErr":""} />
                  {formErrors.email && <span className="adFieldErr">{formErrors.email}</span>}
                </label>
                <label className="adField"><span>Phone *</span>
                  <input
                    value={form.phone}
                    onChange={e => onFormChange("phone", onlyDigits(e.target.value))}
                    onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="0771234567"
                    maxLength={10}
                    inputMode="numeric"
                    className={formErrors.phone?"adInputErr":""}
                  />
                  <span style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>{form.phone.length}/10</span>
                  {formErrors.phone && <span className="adFieldErr">{formErrors.phone}</span>}
                </label>
                <label className="adField"><span>NIC *</span>
                  <input
                    value={form.nic}
                    onChange={e => onFormChange("nic", onlyNic(e.target.value))}
                    onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="123456789V or 200012345678"
                    maxLength={12}
                    className={formErrors.nic?"adInputErr":""}
                  />
                  {formErrors.nic && <span className="adFieldErr">{formErrors.nic}</span>}
                </label>
                <label className="adField"><span>Age * (18+)</span>
                  <input type="number" min="18" max="70" value={form.age} onChange={e => onFormChange("age",e.target.value)} onKeyDown={e => { if (e.key===" "||e.key==="-"||e.key==="e") e.preventDefault(); }} placeholder="e.g. 25" className={formErrors.age?"adInputErr":""} />
                  {formErrors.age && <span className="adFieldErr">{formErrors.age}</span>}
                </label>
                <label className="adField"><span>Address *</span>
                  <input value={form.address} onChange={e => onFormChange("address",e.target.value)} placeholder="e.g. 123 Main St, Colombo" className={formErrors.address?"adInputErr":""} />
                  {formErrors.address && <span className="adFieldErr">{formErrors.address}</span>}
                </label>
                <label className="adField"><span>Specialization</span>
                  <select value={form.spec} onChange={e => onFormChange("spec",e.target.value)}>
                    {SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="adField"><span>Experience (years)</span>
                  <input type="number" min="0" max="50" value={form.exp} onChange={e => onFormChange("exp",e.target.value)} onKeyDown={e => { if (e.key===" "||e.key==="-"||e.key==="e") e.preventDefault(); }} className={formErrors.exp?"adInputErr":""} />
                  {formErrors.exp && <span className="adFieldErr">{formErrors.exp}</span>}
                </label>
                <label className="adField"><span>Available</span>
                  <select value={form.available?"Yes":"No"} onChange={e => onFormChange("available",e.target.value==="Yes")}>
                    <option value="Yes">Yes</option><option value="No">No</option>
                  </select>
                </label>
                <label className="adField"><span>Time From</span>
                  <input type="time" value={form.from} onChange={e => onFormChange("from",e.target.value)} className={formErrors.from?"adInputErr":""} />
                  {formErrors.from && <span className="adFieldErr">{formErrors.from}</span>}
                </label>
                <label className="adField"><span>Time To</span>
                  <input type="time" value={form.to} onChange={e => onFormChange("to",e.target.value)} className={formErrors.to?"adInputErr":""} />
                  {formErrors.to && <span className="adFieldErr">{formErrors.to}</span>}
                </label>
                <label className="adField"><span>Trainer Photo</span>
                  <select value={form.photo} onChange={e => onFormChange("photo",e.target.value)}>
                    <option value="">-- No Photo --</option>
                    <option value="trainer1.jpg">trainer1.jpg</option>
                    <option value="trainer2.jpg">trainer2.jpg</option>
                    <option value="trainer3.jpg">trainer3.jpg</option>
                  </select>
                </label>
              </div>
              <div className="adFormActions">
                <button className="btn btnRed" type="submit" disabled={loading}>{loading?"Adding...":"Add Trainer"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="adFooter muted">© 2026 Royal Fitness</div>
      </div>

      {/* ══ EDIT MODAL ══ */}
      {editTrainer && (
        <div className="adModalBackdrop" onClick={closeEdit}>
          <div className="adModal adModalLarge" onClick={e => e.stopPropagation()}>
            <div className="adModalHead">
              <div className="adModalTitle">✏️ Edit Trainer</div>
              <div className="adModalSub">Admin only — saved to MongoDB</div>
              <button className="adModalClose" onClick={closeEdit}>✕</button>
            </div>
            <form onSubmit={saveEdit} noValidate>
              <div className="adModalGrid">
                <label className="adField"><span>Name *</span>
                  <input value={editForm.name} onChange={e => onEditChange("name", onlyLetters(e.target.value))} className={editErrors.name?"adInputErr":""} />
                  {editErrors.name && <span className="adFieldErr">{editErrors.name}</span>}
                </label>
                <label className="adField"><span>Email *</span>
                  <input type="email" value={editForm.email} onChange={e => onEditChange("email",e.target.value)} className={editErrors.email?"adInputErr":""} />
                  {editErrors.email && <span className="adFieldErr">{editErrors.email}</span>}
                </label>
                <label className="adField"><span>Phone *</span>
                  <input
                    value={editForm.phone}
                    onChange={e => onEditChange("phone", onlyDigits(e.target.value))}
                    onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                    maxLength={10}
                    inputMode="numeric"
                    className={editErrors.phone?"adInputErr":""}
                  />
                  <span style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>{editForm.phone?.length||0}/10</span>
                  {editErrors.phone && <span className="adFieldErr">{editErrors.phone}</span>}
                </label>
                <label className="adField"><span>NIC *</span>
                  <input
                    value={editForm.nic}
                    onChange={e => onEditChange("nic", onlyNic(e.target.value))}
                    onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                    maxLength={12}
                    className={editErrors.nic?"adInputErr":""}
                  />
                  {editErrors.nic && <span className="adFieldErr">{editErrors.nic}</span>}
                </label>
                <label className="adField"><span>Age * (18+)</span>
                  <input type="number" min="18" max="70" value={editForm.age} onChange={e => onEditChange("age",e.target.value)} onKeyDown={e => { if (e.key===" "||e.key==="-"||e.key==="e") e.preventDefault(); }} className={editErrors.age?"adInputErr":""} />
                  {editErrors.age && <span className="adFieldErr">{editErrors.age}</span>}
                </label>
                <label className="adField"><span>Address *</span>
                  <input value={editForm.address} onChange={e => onEditChange("address",e.target.value)} className={editErrors.address?"adInputErr":""} />
                  {editErrors.address && <span className="adFieldErr">{editErrors.address}</span>}
                </label>
                <label className="adField"><span>Specialization</span>
                  <select value={editForm.spec} onChange={e => onEditChange("spec",e.target.value)}>
                    {SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="adField"><span>Experience</span>
                  <input type="number" min="0" max="50" value={editForm.exp} onChange={e => onEditChange("exp",e.target.value)} onKeyDown={e => { if (e.key===" "||e.key==="-"||e.key==="e") e.preventDefault(); }} className={editErrors.exp?"adInputErr":""} />
                  {editErrors.exp && <span className="adFieldErr">{editErrors.exp}</span>}
                </label>
                <label className="adField"><span>Available</span>
                  <select value={editForm.available?"Yes":"No"} onChange={e => onEditChange("available",e.target.value==="Yes")}>
                    <option value="Yes">Yes</option><option value="No">No</option>
                  </select>
                </label>
                <label className="adField"><span>Time From</span>
                  <input type="time" value={editForm.from} onChange={e => onEditChange("from",e.target.value)} className={editErrors.from?"adInputErr":""} />
                  {editErrors.from && <span className="adFieldErr">{editErrors.from}</span>}
                </label>
                <label className="adField"><span>Time To</span>
                  <input type="time" value={editForm.to} onChange={e => onEditChange("to",e.target.value)} className={editErrors.to?"adInputErr":""} />
                  {editErrors.to && <span className="adFieldErr">{editErrors.to}</span>}
                </label>
                <label className="adField"><span>Trainer Photo</span>
                  <select value={editForm.photo||""} onChange={e => onEditChange("photo",e.target.value)}>
                    <option value="">-- No Photo --</option>
                    <option value="trainer1.jpg">trainer1.jpg</option>
                    <option value="trainer2.jpg">trainer2.jpg</option>
                    <option value="trainer3.jpg">trainer3.jpg</option>
                  </select>
                </label>
              </div>
              <div className="adModalActions">
                <button className="btn btnRed" type="submit" disabled={editLoading}>{editLoading?"Saving...":"Save Changes"}</button>
                <button className="btn" type="button" onClick={closeEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ SCHEDULE MODAL ══ */}
      {scheduleTrainer && (
        <div className="adModalBackdrop" onClick={closeSchedule}>
          <div className="adModal adModalSmall" onClick={e => e.stopPropagation()}>
            <div className="adModalHead">
              <div className="adModalTitle">📅 Update Schedule</div>
              <div className="adModalSub">{scheduleTrainer.name} — {scheduleTrainer.spec}</div>
              <button className="adModalClose" onClick={closeSchedule}>✕</button>
            </div>
            <form onSubmit={saveSchedule} noValidate>
              <div className="adScheduleModalBody">
                <label className="adField"><span>Availability</span>
                  <select value={scheduleForm.available?"Yes":"No"} onChange={e => setScheduleForm(p => ({ ...p, available:e.target.value==="Yes" }))}>
                    <option value="Yes">✅ Available</option>
                    <option value="No">❌ Not available</option>
                  </select>
                </label>
                <div className="adScheduleTimeRow">
                  <label className="adField"><span>From *</span>
                    <input type="time" value={scheduleForm.from} onChange={e => { setScheduleForm(p => ({ ...p, from:e.target.value })); setScheduleErrors(p => ({ ...p, from:"" })); }} className={scheduleErrors.from?"adInputErr":""} />
                    {scheduleErrors.from && <span className="adFieldErr">{scheduleErrors.from}</span>}
                  </label>
                  <div className="adTimeSep">to</div>
                  <label className="adField"><span>To *</span>
                    <input type="time" value={scheduleForm.to} onChange={e => { setScheduleForm(p => ({ ...p, to:e.target.value })); setScheduleErrors(p => ({ ...p, to:"" })); }} className={scheduleErrors.to?"adInputErr":""} />
                    {scheduleErrors.to && <span className="adFieldErr">{scheduleErrors.to}</span>}
                  </label>
                </div>
                <div className="adScheduleInfo">ℹ️ Changes reflect immediately on the trainers page.</div>
              </div>
              <div className="adModalActions">
                <button className="btn btnRed" type="submit" disabled={scheduleLoading}>{scheduleLoading?"Saving...":"Save Schedule"}</button>
                <button className="btn" type="button" onClick={closeSchedule}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ HISTORY MODAL ══ */}
      {historyTrainer && (
        <div className="adModalBackdrop" onClick={closeHistory}>
          <div className="adModal adModalLarge" onClick={e => e.stopPropagation()}>
            <div className="adModalHead">
              <div className="adModalTitle">📋 Booking History — {historyTrainer.name}</div>
              <div className="adModalSub">{historyTrainer.spec} • Avg: {avgRating(historyBookings)?`⭐ ${avgRating(historyBookings)}/5`:"No ratings"}</div>
              <button className="adModalClose" onClick={closeHistory}>✕</button>
            </div>
            {historyLoading
              ? <div className="muted center" style={{padding:"30px"}}>Loading...</div>
              : historyBookings.length === 0
                ? <div className="adHistoryEmpty"><div style={{fontSize:"36px"}}>📭</div><div>No bookings yet</div></div>
                : <div className="adTableWrap">
                    <table className="adTable">
                      <thead><tr><th>Customer</th><th>Phone</th><th>Date</th><th>Time</th><th>Status</th><th>Rating</th><th>Review</th></tr></thead>
                      <tbody>
                        {historyBookings.map(b => (
                          <tr key={b._id}>
                            <td className="strong">{b.userName}</td><td>{b.userPhone}</td><td>{b.date}</td><td>{b.time}</td>
                            <td><span className={`adBadge ${b.status==="Approved"?"badgeGreen":b.status==="Rejected"?"badgeRed":"badgeYellow"}`}>{b.status}</span></td>
                            <td>{b.rating?<span style={{color:"#ffd700"}}>{b.rating}/5 ⭐</span>:<span className="muted">—</span>}</td>
                            <td>{b.review?<span className="adReviewText">"{b.review}"</span>:<span className="muted">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            }
            <div className="adModalActions" style={{marginTop:"16px"}}>
              <button className="btn" onClick={closeHistory}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}