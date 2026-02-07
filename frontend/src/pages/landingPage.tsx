import { useState, useRef } from "react";
// import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../components/Button";

// --- IMAGES ---
const stockBackdrop = "/stockBackdrop.png";
const dashboardMaster = "/dashboard-master.jpg";

gsap.registerPlugin(ScrollTrigger);

// --- ZOOM CONFIGURATION ---
// ADJUSTMENT INSTRUCTIONS BELOW
const zoomPositions = [
  { scale: 2.3, x: "35%", y: "25%" }, // Index 0: Bias (Top Left)
  { scale: 2.3, x: "-35%", y: "25%" }, // Index 1: Watchlist (Top Right)
  { scale: 2.3, x: "-35%", y: "-35%" }, // Index 2: Chatbot (Bottom Right)
];

const features = [
  {
    id: "bias",
    title: "AI Bias Detection",
    description:
      "Instantly analyze news for alarmist rhetoric. Our Risk Score gauge visualizes sentiment danger levels.",
  },
  {
    id: "watchlist",
    title: "Real-time Watchlist",
    description:
      "Track your portfolio with live updates, sparkline charts, and instant alerts.",
  },
  {
    id: "chatbot",
    title: "Market ChatBot",
    description:
      "Ask complex financial questions and get data-backed answers instantly from your AI analyst.",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Jamie Lee",
    role: "Founder @ Pulse",
    quote:
      "These AI tools have completely revolutionized our entire trading strategy overnight.",
  },
  {
    id: 2,
    name: "Alisa Hester",
    role: "Product @ Innovate",
    quote:
      "The user interface is so intuitive. The Risk Score assessment saved us from a bad trade.",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Crypto Analyst",
    quote:
      "I stopped panic selling. The bias detector filters out the noise so I can focus on the signal.",
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    role: "Day Trader",
    quote:
      "MarketPulse is the first tool that actually explains why the market is moving.",
  },
  {
    id: 5,
    name: "David R.",
    role: "FinTech Investor",
    quote:
      "It feels like having a Bloomberg terminal and a data scientist in my pocket.",
  },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(-1);
  const mainRef = useRef<HTMLDivElement>(null);
  const dashboardImageRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".gsap-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      tl.from(".gsap-title", {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      })
        .from(
          ".gsap-desc",
          { y: 40, opacity: 0, duration: 1, ease: "power2.out" },
          "-=0.8",
        )
        .from(
          ".gsap-grid",
          { y: 50, opacity: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6",
        );
    },
    { scope: mainRef },
  );

  // --- ZOOM ANIMATION ---
  useGSAP(() => {
    if (dashboardImageRef.current) {
      if (activeFeature === -1) {
        gsap.to(dashboardImageRef.current, {
          scale: 1,
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "power3.inOut",
        });
      } else {
        const pos = zoomPositions[activeFeature];
        gsap.to(dashboardImageRef.current, {
          scale: pos.scale,
          x: pos.x,
          y: pos.y,
          duration: 1.2,
          ease: "power3.inOut",
        });
      }
    }
  }, [activeFeature]);

  return (
    <main ref={mainRef}>
      {/* HERO SECTION */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${stockBackdrop})` }}
      >
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1
            className="display text-marketpulse-radial"
            style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 800 }}
          >
            MarketPulse
          </h1>
          <h2
            className="body-strong text-primary"
            style={{ margin: "16px auto", maxWidth: "700px", fontSize: "24px" }}
          >
            Trade markets, read news, and build your watchlist in one place.
          </h2>
          <div style={{ marginTop: "32px" }}>
            <Button>Analyze Your Next Trade</Button>
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION */}
      <section className="features-section">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="features-header">
            <h2 className="h1 text-primary gsap-title">
              Increase your profits with precision tools.
            </h2>
            <p className="text-muted features-header-desc gsap-desc">
              Explore our unified dashboard. Click a feature to zoom in.
            </p>
            {activeFeature !== -1 && (
              <button
                onClick={() => setActiveFeature(-1)}
                style={{
                  marginTop: 12,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Reset View
              </button>
            )}
          </div>

          <div className="feature-grid gsap-grid">
            {/* Feature Controls */}
            <div className="feature-list">
              {features.map((feature, index) => {
                const isActive = activeFeature === index;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={`feature-btn ${isActive ? "active" : ""}`}
                  >
                    {isActive && <div className="feature-indicator" />}
                    <h3 className="h3 feature-btn-title">{feature.title}</h3>
                    <p className="body feature-btn-desc">
                      {feature.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Zoomable Image */}
            <div className="feature-preview-box">
              <div className="preview-window-dots">
                <div className="dot dot-red" />
                <div className="dot dot-yellow" />
                <div className="dot dot-green" />
              </div>
              <div
                className="preview-image-container"
                style={{
                  overflow: "hidden",
                  cursor: activeFeature === -1 ? "zoom-in" : "zoom-out",
                }}
                onClick={() => setActiveFeature(-1)}
              >
                <img
                  ref={dashboardImageRef}
                  src={dashboardMaster}
                  alt="Dashboard Interface"
                  className="preview-image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transformOrigin: "center center",
                    willChange: "transform",
                  }}
                />
                <div className="preview-placeholder">
                  {activeFeature !== -1 && (
                    <span
                      className="text-muted"
                      style={{
                        background: "rgba(0,0,0,0.8)",
                        padding: "6px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      Viewing: {features[activeFeature].title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonial-section">
        {/* FIX: Removed 'container' class, applied Flex centering, removed Padding */}
        <div
          className="testimonial-header"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 0,
          }}
        >
          <h2 className="display testimonial-title">Beyond Expectations.</h2>
          <p className="text-muted testimonial-desc">
            Our AI tools have transformed our clients' strategies.
          </p>
        </div>

        <div className="marquee-container">
          <div className="marquee-content">
            {[...testimonials, ...testimonials].map((item, index) => (
              <TestimonialCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
        <div className="fade-edge fade-edge-left" />
        <div className="fade-edge fade-edge-right" />
      </section>
    </main>
  );
}

// COMPONENT: TestimonialCard
function TestimonialCard({ item }: { item: (typeof testimonials)[0] }) {
  return (
    <div className="testimonial-card">
      <div>
        <p className="testimonial-quote">“{item.quote}”</p>
      </div>
      <div className="testimonial-user">
        <div className="user-avatar">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`}
            alt={item.name}
          />
        </div>
        <div className="user-info">
          <p className="user-name">{item.name}</p>
          <p className="user-role">{item.role}</p>
        </div>
      </div>
    </div>
  );
}
