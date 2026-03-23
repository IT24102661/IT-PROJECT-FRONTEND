import "./memberRegister.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MemberRegister() {
  const nav = useNavigate();
  const [ok,      setOk]      = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState("");

  const [form, setForm] = useState({
    name:       "",
    email:      "",
    phone:      "",
    nic:        "",
    age:        "",
    address:    "",
    membership: "Basic",
  });

  function validate() {
    const e = {};
    if (!form.name.trim())                             e.name       = "Name is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) e.name       = "Letters only";
    else if (form.name.trim().length < 3)              e.name       = "Min 3 characters";
    if (!form.email.trim())                            e.email      = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))      e.email      = "Invalid email";
    if (!form.phone.trim())                            e.phone      = "Phone is required";
    else if (!/^0\d{9}$/.test(form.phone))             e.phone      = "10 digits starting with 0";
    else if (/^(.)\1+$/.test(form.phone))              e.phone      = "Invalid phone number";
    if (!form.nic.trim())                              e.nic        = "NIC is required";
    else if (!/^(\d{9}[VvXx]|\d{12})$/.test(form.nic)) e.nic       = "Invalid NIC format";
    else if (/^(\d)\1{8}[VvXx]?$/.test(form.nic))     e.nic        = "Invalid NIC";
    if (!form.age)                                     e.age        = "Age is required";
    else if (Number(form.age) < 16)                    e.age        = "Must be at least 16";
    else if (Number(form.age) > 80)                    e.age        = "Invalid age";
    if (!form.address.trim())                          e.address    = "Address is required";
    else if (form.address.trim().length < 10)          e.address    = "Min 10 characters";
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    setOk(""); setErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/members", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.errors?.[0] || "Failed" }); return; }
      setMemberId(data.member.memberId);
      setOk("✅ Registration successful!");
      setForm({ name:"", email:"", phone:"", nic:"", age:"", address:"", membership:"Basic" });
    } catch { setErrors({ general: "❌ Cannot connect to server" }); }
    finally  { setLoading(false); }
  }

  function onChange(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "" }));
  }

  return (
    <div className="mrWrap">
      <div className="mrContainer">

        <div className="mrHeader">
          <div className="mrBrand" onClick={() => nav("/")}>
            <span className="mrRed">Royal</span>{" "}
            <span className="mrWhite">Fitness</span>
          </div>
          <h1 className="mrTitle">New Member Registration</h1>
          <p className="mrSub">Fill in your details to join Royal Fitness</p>
        </div>

        {/* Success */}
        {ok && memberId && (
          <div className="mrSuccess glass">
            <div className="mrSuccessIcon">🎉</div>
            <div className="mrSuccessTitle">Welcome to Royal Fitness!</div>
            <div className="mrSuccessSub">Your registration was successful</div>
            <div className="mrMemberIdBox">
              <div className="mrMemberIdLabel">Your Member ID</div>
              <div className="mrMemberId">{memberId}</div>
              <div className="mrMemberIdNote">Save this ID — you will need it to login</div>
            </div>
            <div className="mrSuccessActions">
              <button className="mrBtn mrBtnRed" onClick={() => nav(`/my-profile/${memberId}`)}>
                Go to My Profile →
              </button>
              <button className="mrBtn mrBtnGhost" onClick={() => nav("/trainers")}>
                Browse Trainers
              </button>
            </div>
          </div>
        )}

        {!ok && (
          <div className="glass mrCard">
            <div className="mrCardHead">
              <div className="mrCardTitle">Personal Details</div>
              <div className="mrCardSub">All fields marked * are required</div>
            </div>

            <form className="mrForm" onSubmit={submit} noValidate>
              {errors.general && <div className="mrErr">{errors.general}</div>}

              <div className="mrGrid">
                <label className="mrField">
                  <span>Full Name *</span>
                  <input value={form.name} onChange={e => onChange("name", e.target.value.replace(/[^a-zA-Z\s]/g,""))} placeholder="e.g. Saman Kumara" className={errors.name?"mrInputErr":""} />
                  {errors.name && <span className="mrFieldErr">{errors.name}</span>}
                </label>

                <label className="mrField">
                  <span>Email Address *</span>
                  <input type="email" value={form.email} onChange={e => onChange("email",e.target.value)} placeholder="e.g. saman@gmail.com" className={errors.email?"mrInputErr":""} />
                  {errors.email && <span className="mrFieldErr">{errors.email}</span>}
                </label>

                <label className="mrField">
                  <span>Phone Number * (digits only)</span>
                  <input value={form.phone} onChange={e => onChange("phone", e.target.value.replace(/\D/g,""))} placeholder="e.g. 0771234567" maxLength={10} inputMode="numeric" className={errors.phone?"mrInputErr":""} />
                  <span className="mrHint">{form.phone.length}/10 digits</span>
                  {errors.phone && <span className="mrFieldErr">{errors.phone}</span>}
                </label>

                <label className="mrField">
                  <span>NIC Number * (Sri Lanka)</span>
                  <input value={form.nic} onChange={e => onChange("nic", e.target.value.replace(/[^0-9VvXx]/g,""))} placeholder="123456789V or 200012345678" maxLength={12} className={errors.nic?"mrInputErr":""} />
                  <span className="mrHint">Old: 9 digits + V/X | New: 12 digits</span>
                  {errors.nic && <span className="mrFieldErr">{errors.nic}</span>}
                </label>

                <label className="mrField">
                  <span>Age * (16+)</span>
                  <input type="number" min="16" max="80" value={form.age} onChange={e => onChange("age",e.target.value)} onKeyDown={e => { if(e.key===" "||e.key==="-"||e.key==="e") e.preventDefault(); }} placeholder="e.g. 25" className={errors.age?"mrInputErr":""} />
                  {errors.age && <span className="mrFieldErr">{errors.age}</span>}
                </label>

                <label className="mrField">
                  <span>Address *</span>
                  <input value={form.address} onChange={e => onChange("address",e.target.value)} placeholder="e.g. 123 Main Street, Colombo" className={errors.address?"mrInputErr":""} />
                  {errors.address && <span className="mrFieldErr">{errors.address}</span>}
                </label>

                <label className="mrField">
                  <span>Membership Plan *</span>
                  <select value={form.membership} onChange={e => onChange("membership",e.target.value)}>
                    <option value="Basic">Basic — Free access</option>
                    <option value="Standard">Standard — Group classes</option>
                    <option value="Premium">Premium — Personal training</option>
                  </select>
                </label>
              </div>

              <div className="mrInfoBox">
                <span>ℹ️</span>
                <span>After registration you will receive a unique Member ID. Save it to access your profile.</span>
              </div>

              <div className="mrActions">
                <button className="mrBtn mrBtnRed mrBtnFull" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Complete Registration →"}
                </button>
                <button className="mrBtn mrBtnGhost" type="button" onClick={() => nav("/join")}>
                  ← Back
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}