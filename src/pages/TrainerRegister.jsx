import "./trainerRegister.css";
import { useState } from "react";
import { Link } from "react-router-dom";

const SPECS = ["Strength", "Weight Training", "Yoga", "Cardio", "Crossfit", "Boxing"];

export default function TrainerRegister() {
  const [ok,      setOk]      = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name:      "",
    email:     "",
    phone:     "",
    nic:       "",
    age:       "",
    address:   "",
    spec:      "Strength",
    exp:       1,
    available: true,
    from:      "08:00",
    to:        "14:00",
  });

  // ── Validation ───────────────────────────────────────
  function validate() {
    const e = {};

    // Name
    if (!form.name.trim())
      e.name = "Trainer name is required";
    else if (form.name.trim().length < 3)
      e.name = "Name must be at least 3 characters";
    else if (form.name.trim().length > 50)
      e.name = "Name cannot exceed 50 characters";
    else if (!/^[a-zA-Z\s]+$/.test(form.name.trim()))
      e.name = "Name can only contain letters";

    // Email
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Please enter a valid email address";

    // Phone
    if (!form.phone.trim())
      e.phone = "Phone number is required";
    else if (!/^\d+$/.test(form.phone))
      e.phone = "Phone must contain digits only";
    else if (form.phone.length !== 10)
      e.phone = "Phone must be exactly 10 digits";
    else if (!form.phone.startsWith("0"))
      e.phone = "Phone must start with 0";
    else if (/^(.)\1+$/.test(form.phone))
      e.phone = "Invalid phone number — cannot be all same digits";

    // NIC
    if (!form.nic.trim())
      e.nic = "NIC is required";
    else if (!/^(\d{9}[VvXx]|\d{12})$/.test(form.nic.trim()))
      e.nic = "NIC must be 9 digits + V/X or 12 digits";
    else if (/^(\d)\1{8}[VvXx]?$/.test(form.nic.trim()))
      e.nic = "Invalid NIC — cannot be all same digits";
    else {
      const nic = form.nic.trim();
      if (nic.length === 10) {
        const year = parseInt("19" + nic.substring(0, 2));
        const days = parseInt(nic.substring(2, 5));
        if (year < 1900 || year > 2010)
          e.nic = "Invalid NIC — year out of range";
        else if (days < 1 || (days > 366 && days < 501) || days > 866)
          e.nic = "Invalid NIC — day value is incorrect";
      } else if (nic.length === 12) {
        const year = parseInt(nic.substring(0, 4));
        const days = parseInt(nic.substring(4, 7));
        if (year < 1900 || year > 2010)
          e.nic = "Invalid NIC — year out of range";
        else if (days < 1 || (days > 366 && days < 501) || days > 866)
          e.nic = "Invalid NIC — day value is incorrect";
      }
    }

    // Age
    if (!form.age && form.age !== 0)
      e.age = "Age is required";
    else if (isNaN(Number(form.age)))
      e.age = "Age must be a number";
    else if (Number(form.age) < 18)
      e.age = "Must be at least 18 years old";
    else if (Number(form.age) > 70)
      e.age = "Age cannot exceed 70";

    // Address
    if (!form.address.trim())
      e.address = "Address is required";
    else if (form.address.trim().length < 10)
      e.address = "Address must be at least 10 characters";

    // Experience
    if (form.exp === "" || Number(form.exp) < 0)
      e.exp = "Experience must be 0 or more";
    else if (Number(form.exp) > 50)
      e.exp = "Experience cannot exceed 50";

    // Time
    if (!form.from) e.from = "Start time is required";
    if (!form.to)   e.to   = "End time is required";
    if (form.from && form.to && form.from >= form.to)
      e.to = "'To' time must be after 'From' time";

    return e;
  }

  // ── Submit ───────────────────────────────────────────
  async function submit(e) {
    e.preventDefault();
    setOk("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/trainers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const be = {};
        (data.errors || []).forEach(msg => {
          if (msg.toLowerCase().includes("phone"))        be.phone   = msg;
          else if (msg.toLowerCase().includes("name"))    be.name    = msg;
          else if (msg.toLowerCase().includes("email"))   be.email   = msg;
          else if (msg.toLowerCase().includes("nic"))     be.nic     = msg;
          else if (msg.toLowerCase().includes("age"))     be.age     = msg;
          else if (msg.toLowerCase().includes("address")) be.address = msg;
          else                                            be.general = msg;
        });
        setErrors(be);
        return;
      }
      setOk("✅ Request submitted! Admin will review and approve.");
      setForm({
        name:"", email:"", phone:"", nic:"", age:"", address:"",
        spec:"Strength", exp:1, available:true, from:"08:00", to:"14:00",
      });
    } catch {
      setErrors({ general: "❌ Cannot connect to server. Make sure backend is running." });
    } finally {
      setLoading(false);
    }
  }

  // ── onChange helpers ─────────────────────────────────
  function onChange(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "", general: "" }));
  }

  // Only digits
  function onPhoneChange(val) {
    const digits = val.replace(/\D/g, "");
    onChange("phone", digits);
  }

  // Only digits + V/v/X/x
  function onNicChange(val) {
    const cleaned = val.replace(/[^0-9VvXx]/g, "");
    onChange("nic", cleaned);
  }

  // Only letters and spaces for name
  function onNameChange(val) {
    const cleaned = val.replace(/[^a-zA-Z\s]/g, "");
    onChange("name", cleaned);
  }

  return (
    <div className="trWrap">
      <div className="trContainer">

        {/* Header */}
        <div className="trHeader">
          <div className="trBrand">
            <span className="trBrandRed">Royal</span>{" "}
            <span className="trBrandWhite">Fitness</span>
          </div>
          <h1 className="trPageTitle">Register as a Trainer</h1>
          <p className="trPageSub">
            Fill in your details below. Our admin team will review and approve
            your profile before it goes live.
          </p>
        </div>

        {/* Card */}
        <div className="glass trCard">
          <div className="trCardHead">
            <div className="trCardTitle">Personal & Professional Details</div>
            <div className="trCardSub muted">All fields marked * are required</div>
          </div>

          <form className="trForm" onSubmit={submit} noValidate>

            {errors.general && <div className="trErr">{errors.general}</div>}

            {/* ── Row 1: Name & Email ── */}
            <div className="trGrid">
              <label className="trField">
                <span>Trainer Name *</span>
                <input
                  value={form.name}
                  onChange={e => onNameChange(e.target.value)}
                  placeholder="e.g. Kamal Perera"
                  className={errors.name ? "trInputErr" : ""}
                />
                {errors.name && <span className="trFieldErr">{errors.name}</span>}
              </label>

              <label className="trField">
                <span>Email Address *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => onChange("email", e.target.value)}
                  placeholder="e.g. kamal@gmail.com"
                  className={errors.email ? "trInputErr" : ""}
                />
                {errors.email && <span className="trFieldErr">{errors.email}</span>}
              </label>
            </div>

            {/* ── Row 2: Phone & NIC ── */}
            <div className="trGrid">
              <label className="trField">
                <span>Phone Number * (digits only)</span>
                <input
                  value={form.phone}
                  onChange={e => onPhoneChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === " ") e.preventDefault();
                  }}
                  placeholder="e.g. 0771234567"
                  maxLength={10}
                  inputMode="numeric"
                  className={errors.phone ? "trInputErr" : ""}
                />
                <span className="trFieldHint">
                  {form.phone.length}/10 digits
                  {form.phone.length === 10 && !errors.phone
                    ? " ✅" : ""}
                </span>
                {errors.phone && <span className="trFieldErr">{errors.phone}</span>}
              </label>

              <label className="trField">
                <span>NIC Number </span>
                <input
                  value={form.nic}
                  onChange={e => onNicChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === " ") e.preventDefault();
                  }}
                  placeholder="123456789V or 200012345678"
                  maxLength={12}
                  className={errors.nic ? "trInputErr" : ""}
                />
                <span className="trFieldHint">
                  Old NIC: 9 digits + V/X &nbsp;|&nbsp; New NIC: 12 digits
                </span>
                {errors.nic && <span className="trFieldErr">{errors.nic}</span>}
              </label>
            </div>

            {/* ── Row 3: Age & Address ── */}
            <div className="trGrid">
              <label className="trField">
                <span>Age * (18–70 only)</span>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={form.age}
                  onChange={e => onChange("age", e.target.value)}
                  onKeyDown={e => {
                    if (e.key === " " || e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  placeholder="e.g. 25"
                  className={errors.age ? "trInputErr" : ""}
                />
                {errors.age && <span className="trFieldErr">{errors.age}</span>}
              </label>

              <label className="trField">
                <span>Address *</span>
                <input
                  value={form.address}
                  onChange={e => onChange("address", e.target.value)}
                  placeholder="e.g. 123 Main Street, Colombo"
                  className={errors.address ? "trInputErr" : ""}
                />
                {errors.address && <span className="trFieldErr">{errors.address}</span>}
              </label>
            </div>

            {/* ── Row 4: Spec & Experience ── */}
            <div className="trGrid">
              <label className="trField">
                <span>Specialization *</span>
                <select value={form.spec} onChange={e => onChange("spec", e.target.value)}>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="trField">
                <span>Experience (years) *</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.exp}
                  onChange={e => onChange("exp", e.target.value)}
                  onKeyDown={e => {
                    if (e.key === " " || e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  placeholder="e.g. 3"
                  className={errors.exp ? "trInputErr" : ""}
                />
                {errors.exp && <span className="trFieldErr">{errors.exp}</span>}
              </label>
            </div>

            {/* ── Row 5: Available & Time ── */}
            <div className="trGrid">
              <label className="trField">
                <span>Available for Booking *</span>
                <select
                  value={form.available ? "Yes" : "No"}
                  onChange={e => onChange("available", e.target.value === "Yes")}
                >
                  <option value="Yes">Yes — I am available</option>
                  <option value="No">No — Not available yet</option>
                </select>
              </label>

              <div className="trField">
                <span>Available Time Slot *</span>
                <div className="trTimeRow">
                  <div className="trTimeField">
                    <input
                      type="time"
                      value={form.from}
                      onChange={e => onChange("from", e.target.value)}
                      className={errors.from ? "trInputErr" : ""}
                    />
                    {errors.from && <span className="trFieldErr">{errors.from}</span>}
                  </div>
                  <span className="trTimeSep">to</span>
                  <div className="trTimeField">
                    <input
                      type="time"
                      value={form.to}
                      onChange={e => onChange("to", e.target.value)}
                      className={errors.to ? "trInputErr" : ""}
                    />
                    {errors.to && <span className="trFieldErr">{errors.to}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="trInfoBox">
              <span className="trInfoIcon">ℹ️</span>
              <span>
                Your profile will be reviewed by admin before appearing to customers.
                Phone must be 10 digits starting with 0. NIC must be valid Sri Lanka format.
              </span>
            </div>

            {ok && <div className="trOk">{ok}</div>}

            {/* Actions */}
            <div className="trActions">
              <button className="btn btnRed trBtn" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
              <Link className="btn trHomeBtn" to="/">← Back to Home</Link>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}