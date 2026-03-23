import "./home.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import hero4 from "../assets/hero4.jpg";

import a1 from "../assets/activity1.jpg";
import a2 from "../assets/activity2.jpg";
import a3 from "../assets/activity3.jpg";
import a4 from "../assets/activity4.jpg";
import a5 from "../assets/activity5.jpg";
import a6 from "../assets/activity6.jpg";

import t1 from "../assets/trainer1.jpg";
import t2 from "../assets/trainer2.jpg";
import t3 from "../assets/trainer3.jpg";
import t4 from "../assets/trainer4.jpg";
import banner from "../assets/banner.jpg";

const TAPI = "http://localhost:5000/api/trainers";
const AAPI = "http://localhost:5000/api/appointments";
const TRAINER_PHOTOS = [t1, t2, t3, t4];

function getPhoto(trainer, index) {
  if (trainer.photo === "trainer1.jpg") return t1;
  if (trainer.photo === "trainer2.jpg") return t2;
  if (trainer.photo === "trainer3.jpg") return t3;
  if (trainer.photo === "trainer4.jpg") return t4;
  return TRAINER_PHOTOS[index % TRAINER_PHOTOS.length];
}

// ── Featured Trainers Component ──────────────────────
function FeaturedTrainers() {
  const nav = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [ratings,  setRatings]  = useState({});
  const [active,   setActive]   = useState(0);

  useEffect(() => {
    fetch(TAPI)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data.slice(0, 6) : [];
        setTrainers(list);
        list.forEach(async (t) => {
          try {
            const r     = await fetch(`${AAPI}/trainer/${t._id}`);
            const appts = await r.json();
            if (Array.isArray(appts)) {
              const rated = appts.filter(a => a.rating);
              const avg   = rated.length
                ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1)
                : null;
              setRatings(p => ({ ...p, [t._id]: { avg, count: rated.length } }));
            }
          } catch {}
        });
      })
      .catch(() => {});
  }, []);

  if (!trainers.length) return null;

  const slides    = [];
  for (let i = 0; i < trainers.length; i += 3) slides.push(trainers.slice(i, i + 3));
  const totalDots = slides.length;
  let globalIndex = 0;

  return (
    <section className="rf-section rf-team-section">
      <div className="rf-team-label">OUR TEAM</div>
      <h2 className="rf-team-title">TRAIN WITH EXPERTS</h2>
      <div className="rf-team-slider">
        <div className="rf-team-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {slides.map((group, si) => (
            <div className="rf-team-slide" key={si}>
              {group.map((t) => {
                const r     = ratings[t._id];
                const photo = getPhoto(t, globalIndex++);
                return (
                  <div className="rf-team-card" key={t._id}>
                    <div className="rf-team-avatar-wrap">
                      <img src={photo} alt={t.name} className="rf-team-photo" />
                      <span className={`rf-team-avail ${t.available ? "rf-avail-yes" : "rf-avail-no"}`}>
                        {t.available ? "● Available" : "● Unavailable"}
                      </span>
                    </div>
                    <div className="rf-team-info">
                      <div className="rf-team-name">{t.name}</div>
                      <div className="rf-team-spec">{t.spec}</div>
                      <div className="rf-team-stars">
                        {r?.avg ? (
                          <>
                            {[1,2,3,4,5].map(i => (
                              <span key={i} style={{ color: i <= Math.round(r.avg) ? "#ffd700" : "rgba(255,255,255,0.2)" }}>★</span>
                            ))}
                            <span className="rf-team-rating">{r.avg}</span>
                            <span className="rf-team-reviews">({r.count})</span>
                          </>
                        ) : (
                          <span className="rf-team-no-rating">New Trainer</span>
                        )}
                      </div>
                      <div className="rf-team-meta">
                        <span>🎓 {t.exp} yrs</span>
                        <span>🕐 {t.from}–{t.to}</span>
                      </div>
                    </div>
                    <button
                      className={`rf-team-btn ${t.available ? "rf-team-btn-red" : "rf-team-btn-off"}`}
                      disabled={!t.available}
                      onClick={() => nav(`/book/${t._id}`)}
                    >
                      {t.available ? "Book Now" : "Unavailable"}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {totalDots > 1 && (
        <div className="rf-team-dots">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button key={i} className={`rf-team-dot ${i === active ? "rf-team-dot-on" : ""}`} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
      <div className="rf-team-cta">
        <button className="rf-btn rf-btn-red rf-glow" onClick={() => nav("/trainers")}>
          View All Trainers →
        </button>
      </div>
    </section>
  );
}

// ── Main Home Component ───────────────────────────────
export default function Home() {
  const nav = useNavigate();

  const slides = useMemo(() => [hero1, hero2, hero3, hero4], []);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 2600);
    return () => clearInterval(id);
  }, [slides.length]);

  const activities = useMemo(() => [
    { id:"strength", title:"Strength Training", img:a1, level:"Beginner → Advanced", duration:"45–60 min", calories:"250–450 kcal", benefits:["Build muscle & power","Improve posture","Increase metabolism"], plan:"Warm-up 10m → Compound lifts 30m → Core 10m → Stretch 5m" },
    { id:"cardio",   title:"Cardio Burn",       img:a2, level:"Beginner",            duration:"30–45 min", calories:"300–500 kcal", benefits:["Fat burning","Heart health","Boost stamina"],              plan:"Treadmill/Row 25m → Intervals 10m → Cool down 5m" },
    { id:"hiit",     title:"HIIT Workout",      img:a3, level:"Intermediate",        duration:"20–30 min", calories:"250–400 kcal", benefits:["Fast fat loss","Time saving","Full body conditioning"],    plan:"30s work / 30s rest × 12 rounds → Cool down 5m" },
    { id:"yoga",     title:"Yoga & Mobility",   img:a4, level:"All levels",          duration:"30–50 min", calories:"120–220 kcal", benefits:["Flexibility","Stress reduce","Better recovery"],          plan:"Breathing 5m → Flow 30m → Mobility 10m → Relax 5m" },
    { id:"boxing",   title:"Boxing Fitness",    img:a5, level:"Intermediate",        duration:"40–60 min", calories:"350–600 kcal", benefits:["Speed & reflex","Cardio","Confidence"],                   plan:"Jump rope 10m → Bag combos 20m → Footwork 10m → Stretch 5m" },
    { id:"cycling",  title:"Indoor Cycling",    img:a6, level:"Beginner → Advanced", duration:"35–50 min", calories:"300–550 kcal", benefits:["Leg strength","Stamina","Low impact cardio"],             plan:"Warm-up 8m → Hills 15m → Sprint 10m → Cool down 7m" },
  ], []);

  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpenItem(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="rf">

      {/* ── NAV ── */}
      <header className="rf-nav">
        <div className="rf-brand" onClick={() => nav("/")} style={{ cursor:"pointer" }}>
          <div className="rf-brand-icon">RF</div>
          <div className="rf-brand-text">
            <span className="rf-white">Royal</span>
            <span className="rf-red">Fitness</span>
          </div>
        </div>
        <nav className="rf-links">
          <button className="rf-linkbtn rf-linkbtn-active" onClick={() => nav("/")}>Home</button>
          <button className="rf-linkbtn" onClick={() => document.getElementById("activities")?.scrollIntoView({behavior:"smooth"})}>Activity</button>
          <button className="rf-linkbtn" onClick={() => nav("/trainers")}>Trainers</button>
          <button className="rf-linkbtn" onClick={() => document.getElementById("our-service")?.scrollIntoView({behavior:"smooth"})}>Our Service</button>
          <button className="rf-linkbtn" onClick={() => nav("/join")}>Join Us</button>
        </nav>
        <button className="rf-nav-login" onClick={() => nav("/login")}>
          <span>Login</span>
          <span className="rf-nav-login-arrow">→</span>
        </button>
      </header>

      {/* ── HERO ── */}
      <section id="home" className="rf-hero">
        <div className="rf-hero-left">
          <h1 className="rf-title">
            <span className="rf-white">Build Your</span><br />
            <span className="rf-red">Dream Physique</span>
          </h1>
          <p className="rf-sub">Book a trainer appointment and track your fitness journey.</p>
          <div className="rf-actions">
            <button className="rf-hero-btn-primary" onClick={() => nav("/trainers")}>
              <span>Get Started</span>
              <span className="rf-hero-btn-icon">→</span>
            </button>
            <button className="rf-hero-btn-secondary" onClick={() => nav("/trainer-register")}>
              <span>Trainer Register</span>
            </button>
          </div>
          <div className="rf-chips">
            <span className="rf-chip"><span className="rf-chip-icon">✓</span> Certified Trainers</span>
            <span className="rf-chip"><span className="rf-chip-icon">✓</span> Easy Booking</span>
            <span className="rf-chip"><span className="rf-chip-icon">✓</span> Admin Approval</span>
          </div>
        </div>
        <div className="rf-hero-right">
          <div className="rf-slider">
            {slides.map((img, i) => (
              <img key={i} src={img} className={`rf-slide ${i === active ? "isActive" : ""}`} alt={`slide-${i}`} />
            ))}
            <div className="rf-dots">
              {slides.map((_, i) => (
                <button key={i} className={`rf-dot ${i === active ? "on" : ""}`} onClick={() => setActive(i)} aria-label={`go-${i}`} type="button" />
              ))}
            </div>
            <div className="rf-slider-label">Training Moments</div>
          </div>
          <div className="rf-watermark">FITNESS</div>
          <div className="rf-orb rf-orb1" />
          <div className="rf-orb rf-orb2" />
        </div>
      </section>

      {/* ── JOIN US BANNER ── */}
      <section className="rf-banner-section" style={{ backgroundImage:`url(${banner})` }}>
        <div className="rf-banner-overlay" />
        <div className="rf-banner-content">
          <h2 className="rf-banner-title">REGISTRATION NOW TO GET MORE DEALS</h2>
          <p className="rf-banner-sub">WHERE HEALTH, BEAUTY AND FITNESS MEET.</p>
          <button className="rf-banner-btn" onClick={() => nav("/join")}>
            Join Us Now →
          </button>
        </div>
      </section>

      {/* ── ACTIVITIES ── */}
      <section id="activities" className="rf-section">
        <h2 className="rf-h2">Our <span className="rf-red">Activities</span></h2>
        <div className="rf-grid">
          {activities.map((a) => (
            <button key={a.id} className="rf-card rf-card-btn" onClick={() => setOpenItem(a)} type="button">
              <img className="rf-card-img" src={a.img} alt={a.title} />
              <div className="rf-card-shade" />
              <div className="rf-card-title">{a.title}</div>
              <div className="rf-card-cta">Click for details →</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── OUR SERVICE ── */}
      <section id="our-service" className="rf-section rf-service-section">
        <h2 className="rf-h2">Our <span className="rf-red">Services</span></h2>
        <p className="rf-service-sub">Everything you need to reach your fitness goals — all in one place.</p>
        <div className="rf-service-grid">
          {[
            { icon:"🏋️", title:"Personal Training",  desc:"One-on-one sessions with certified trainers tailored to your goals." },
            { icon:"📅", title:"Easy Booking",        desc:"Book trainer appointments online in seconds — anytime, anywhere." },
            { icon:"📊", title:"Progress Tracking",   desc:"Monitor your fitness journey with detailed performance insights." },
            { icon:"🥗", title:"Nutrition Guidance",  desc:"Get personalised diet plans to complement your workout routine." },
            { icon:"🤝", title:"Group Classes",       desc:"Join energetic group sessions for motivation and community support." },
            { icon:"🛡️", title:"Admin Management",   desc:"Seamless trainer approval and management through our admin panel." },
          ].map((s) => (
            <div key={s.title} className="rf-service-card">
              <div className="rf-service-icon">{s.icon}</div>
              <h3 className="rf-service-title">{s.title}</h3>
              <p className="rf-service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED TRAINERS ── */}
      <FeaturedTrainers />

      {/* ── STATS ── */}
      <section className="rf-stats-section">
        <div className="rf-stats-grid">
          <div className="rf-stat-card">
            <div className="rf-stat-num">50+</div>
            <div className="rf-stat-label">Certified Trainers</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-num">200+</div>
            <div className="rf-stat-label">Happy Members</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-num">5★</div>
            <div className="rf-stat-label">Average Rating</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-num">10+</div>
            <div className="rf-stat-label">Years Experience</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="rf-section rf-how-section">
        <div className="rf-how-label">SIMPLE PROCESS</div>
        <h2 className="rf-h2">How It <span className="rf-red">Works</span></h2>
        <p className="rf-how-sub">Get started with Royal Fitness in 3 easy steps</p>
        <div className="rf-how-grid">
          <div className="rf-how-card">
            <div className="rf-how-step">01</div>
            <div className="rf-how-icon">🔍</div>
            <h3 className="rf-how-title">Browse Trainers</h3>
            <p className="rf-how-desc">Browse our certified trainers, check their specialization, experience and ratings.</p>
            <div className="rf-how-line" />
          </div>
          <div className="rf-how-card">
            <div className="rf-how-step">02</div>
            <div className="rf-how-icon">📅</div>
            <h3 className="rf-how-title">Book Appointment</h3>
            <p className="rf-how-desc">Select your preferred trainer and book an appointment at your convenient time.</p>
            <div className="rf-how-line" />
          </div>
          <div className="rf-how-card">
            <div className="rf-how-step">03</div>
            <div className="rf-how-icon">🏋️</div>
            <h3 className="rf-how-title">Start Training</h3>
            <p className="rf-how-desc">Meet your trainer, start your fitness journey and track your progress every day.</p>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="rf-section rf-why-section">
        <div className="rf-why-label">OUR ADVANTAGE</div>
        <h2 className="rf-h2">Why Choose <span className="rf-red">Us</span></h2>
        <p className="rf-why-sub">We are different from the rest — here is why thousands trust Royal Fitness</p>
        <div className="rf-why-grid">
          {[
            { icon:"🏆", title:"Certified Experts",  desc:"All our trainers are certified professionals with verified credentials and years of experience.",     color:"rgba(255,215,0,0.15)",   border:"rgba(255,215,0,0.30)"   },
            { icon:"⚡", title:"Fast Booking",        desc:"Book a trainer in seconds. No waiting, no paperwork — just pick a trainer and confirm your slot.",    color:"rgba(0,180,255,0.12)",   border:"rgba(0,180,255,0.28)"   },
            { icon:"🛡️", title:"Admin Verified",      desc:"Every trainer is reviewed and approved by our admin team before they appear on the platform.",        color:"rgba(100,255,150,0.12)", border:"rgba(100,255,150,0.28)" },
            { icon:"⭐", title:"Rated by Members",    desc:"Real reviews and star ratings from actual members help you pick the best trainer for your goals.",    color:"rgba(255,120,0,0.12)",   border:"rgba(255,120,0,0.28)"   },
            { icon:"📊", title:"Progress Tracking",   desc:"Track your fitness journey with detailed session history and performance insights over time.",         color:"rgba(180,0,255,0.12)",   border:"rgba(180,0,255,0.28)"   },
            { icon:"🤝", title:"Personal Attention",  desc:"Get one-on-one personal training sessions tailored specifically to your fitness goals and schedule.", color:"rgba(255,45,45,0.12)",   border:"rgba(255,45,45,0.28)"   },
          ].map(w => (
            <div className="rf-why-card" key={w.title} style={{ background:w.color, borderColor:w.border }}>
              <div className="rf-why-icon">{w.icon}</div>
              <h3 className="rf-why-title">{w.title}</h3>
              <p className="rf-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="rf-section rf-testi-section">
        <div className="rf-testi-label">WHAT MEMBERS SAY</div>
        <h2 className="rf-h2">Member <span className="rf-red">Reviews</span></h2>
        <p className="rf-testi-sub">Real feedback from our satisfied members</p>
        <div className="rf-testi-grid">
          {[
            { name:"Saman Kumara",   spec:"Strength Training", rating:5, text:"The trainers here are absolutely amazing! I lost 15kg in 3 months with personalized training. Best decision I ever made!", avatar:"S" },
            { name:"Nimali Perera",  spec:"Yoga & Mobility",   rating:5, text:"Booking was so easy and the trainer was very professional. The sessions are perfectly tailored to my schedule and fitness level.", avatar:"N" },
            { name:"Kasun Silva",    spec:"Cardio & HIIT",     rating:5, text:"Royal Fitness changed my life! The certified trainers, easy booking system and admin approval process gives me full confidence.", avatar:"K" },
            { name:"Dilani Fernando",spec:"Weight Training",   rating:5, text:"I have tried many gyms but Royal Fitness is by far the best. The trainers are certified, friendly and very motivating!", avatar:"D" },
            { name:"Ruwan Bandara",  spec:"Boxing Fitness",    rating:5, text:"The boxing trainer was incredible. Very professional and patient. My fitness improved drastically within weeks of training.", avatar:"R" },
            { name:"Chamari Dias",   spec:"Crossfit",          rating:5, text:"Amazing experience from start to finish! The online booking system is very smooth and trainers are always on time.", avatar:"C" },
          ].map((t, i) => (
            <div className="rf-testi-card glass" key={i}>
              <div className="rf-testi-stars">
                {[1,2,3,4,5].map(s => <span key={s} style={{color:"#ffd700",fontSize:"16px"}}>★</span>)}
              </div>
              <p className="rf-testi-text">"{t.text}"</p>
              <div className="rf-testi-author">
                <div className="rf-testi-avatar">{t.avatar}</div>
                <div>
                  <div className="rf-testi-name">{t.name}</div>
                  <div className="rf-testi-spec">{t.spec}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="rf-footer-new">
        <div className="rf-footer-contact">
          <div className="rf-footer-contact-item">
            <div className="rf-footer-icon-wrap">📍</div>
            <div className="rf-footer-contact-text">
              <div>Colombo 1, World Trade Center</div>
              <div>Colombo 2, Moors Sports Club</div>
              <div>Colombo 7, Maitland Crescent</div>
              
            </div>
          </div>
          <div className="rf-footer-contact-item">
            <div className="rf-footer-icon-wrap">📞</div>
            <div className="rf-footer-contact-text">
              <div><strong>Colombo 7</strong></div>
              <div>011-111-5555 &nbsp;|&nbsp; 077-000-0000</div>
              <div><strong>Moors Sport Club</strong></div>
              <div>011-212-2222 &nbsp;|&nbsp; 075-222-1111</div>
              <div><strong>World Trade Center</strong></div>
              <div>011-233-3333 &nbsp;|&nbsp; 077-333-444</div>
              
            </div>
          </div>
          <div className="rf-footer-contact-item">
            <div className="rf-footer-icon-wrap">✉️</div>
            <div className="rf-footer-contact-text">
              <div>royalfitness@gmail.com</div>
            </div>
          </div>
        </div>
        <div className="rf-footer-main">
          <div className="rf-footer-brand-col">
            <div className="rf-footer-brand">
              <span className="rf-white">Royal</span>
              <span className="rf-red">Fitness</span>
            </div>
            <p className="rf-footer-brand-desc">Your trusted fitness partner. Certified trainers, easy booking, and professional management.</p>
            <div className="rf-footer-socials">
              <a href="#" className="rf-social-btn">f</a>
              <a href="#" className="rf-social-btn">in</a>
              <a href="#" className="rf-social-btn">✉</a>
            </div>
          </div>
          <div className="rf-footer-links-col">
            <div className="rf-footer-col-title">Useful Links</div>
            <a className="rf-footer-link" href="#">Terms & Conditions</a>
            <a className="rf-footer-link" href="#">Privacy Policy</a>
            <a className="rf-footer-link" href="#">Refund Policy</a>
          </div>
          <div className="rf-footer-links-col">
            <div className="rf-footer-col-title">Support</div>
            <span className="rf-footer-link" onClick={() => nav("/login")}>Login</span>
            <span className="rf-footer-link" onClick={() => nav("/trainers")}>Find a Trainer</span>
            <span className="rf-footer-link" onClick={() => nav("/trainer-register")}>Register as Trainer</span>
          </div>
          <div className="rf-footer-links-col">
            <div className="rf-footer-col-title">Quick Links</div>
            <span className="rf-footer-link" onClick={() => nav("/")}>Home</span>
            <span className="rf-footer-link" onClick={() => document.getElementById("activities")?.scrollIntoView({behavior:"smooth"})}>Activities</span>
            <span className="rf-footer-link" onClick={() => document.getElementById("our-service")?.scrollIntoView({behavior:"smooth"})}>Our Services</span>
          </div>
        </div>
        <div className="rf-footer-bottom">
          <div className="rf-footer-copy">Copyright © 2026 All rights reserved | ⭐ Royal Fitness</div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {openItem && (
        <div className="rf-modal-backdrop" onClick={() => setOpenItem(null)}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="rf-modal-close" onClick={() => setOpenItem(null)} aria-label="close" type="button">✕</button>
            <div className="rf-modal-media"><img src={openItem.img} alt={openItem.title} /></div>
            <div className="rf-modal-body">
              <h3 className="rf-modal-title">{openItem.title}</h3>
              <div className="rf-modal-meta">
                <span>🧩 Level: {openItem.level}</span>
                <span>⏱ {openItem.duration}</span>
                <span>🔥 {openItem.calories}</span>
              </div>
              <h4 className="rf-modal-h4">Benefits</h4>
              <ul className="rf-modal-list">{openItem.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
              <h4 className="rf-modal-h4">Simple Plan</h4>
              <p className="rf-modal-p">{openItem.plan}</p>
              <div className="rf-modal-actions">
                <button className="rf-btn rf-btn-red" type="button" onClick={() => { setOpenItem(null); nav("/join"); }}>Join Us</button>
                <button className="rf-btn rf-btn-ghost" type="button" onClick={() => setOpenItem(null)}>Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}