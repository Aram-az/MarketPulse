import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../components/Button";
import { Brain, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const stockBackdrop = "/stockBackdrop.png";
const dashboardMaster = "/dashboard-master.jpg";
const aiVideo = "/AI_Speaking.mp4";

gsap.registerPlugin(ScrollTrigger);

const zoomPositions = [
  { scale: 1.355, x: "24.5%", y: "-1%" },
  { scale: 2.8, x: "-80%", y: "50%" },
  { scale: 2.7, x: "-85%", y: "-53%" },
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

const aiPersonas = [
  {
    id: "norman",
    name: "Norman",
    role: "Behavioral Psychologist",
    desc: "Detects emotional trading patterns like revenge trading and loss aversion.",
    icon: Brain,
    color: "#DC143C",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Quantitative Analyst",
    desc: "Analyzes raw P/L data, win-rates, and statistical anomalies in your portfolio.",
    icon: BarChart3,
    color: "#3b82f6",
  },
  {
    id: "sage",
    name: "Sage",
    role: "Risk Manager",
    desc: "Provides cooling-off strategies and discipline enforcement when you tilt.",
    icon: Shield,
    color: "#10b981",
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
  const aiSectionRef = useRef<HTMLDivElement>(null);

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

      const aiTl = gsap.timeline({
        scrollTrigger: {
          trigger: aiSectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      aiTl.from(".ai-header", { y: 50, opacity: 0, duration: 0.8 }).from(
        ".ai-card",
        {
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        },
        "-=0.4",
      );
    },
    { scope: mainRef },
  );

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
            style={{ margin: "16px auto", maxWidth: "700px", fontSize: "18px" }}
          >
            Eliminate emotional trading with the world's first AI behavioral
            coach.
          </h2>
          <div style={{ marginTop: "32px" }}>
            <Link to="/dashboard">
              <Button>Analyze Your Next Trade</Button>
            </Link>
          </div>
        </div>
      </section>

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

      <section
        ref={aiSectionRef}
        style={{
          background: "#050505",
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(220,20,60,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="container"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="ai-header"
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <span
              style={{
                color: "#DC143C",
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "12px",
                display: "block",
              }}
            >
              Meet The Team
            </span>
            <h2
              className="display"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                color: "white",
                lineHeight: 1.1,
              }}
            >
              Introducing Our AIs
            </h2>
            <p
              className="text-muted"
              style={{
                fontSize: "18px",
                maxWidth: "600px",
                margin: "16px auto 0",
              }}
            >
              Three specialized intelligence models working in harmony to
              optimize your trading performance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            {aiPersonas.map((ai) => (
              <AiCard key={ai.id} ai={ai} />
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-section">
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

function AiCard({ ai }: { ai: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="ai-card"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "8px",
        overflow: "hidden",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px)";
        e.currentTarget.style.borderColor = ai.color;
        videoRef.current?.play();
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        videoRef.current?.pause();
      }}
    >
      <div
        style={{
          height: "240px",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          background: "black",
        }}
      >
        <video
          ref={videoRef}
          src={aiVideo}
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, black 0%, ${ai.color} 100%)`,
            opacity: 0.2,
            mixBlendMode: "overlay",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${ai.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ai.color,
          }}
        >
          <ai.icon size={20} />
        </div>
      </div>

      <div style={{ padding: "24px 16px" }}>
        <h3 className="h3" style={{ color: "white", marginBottom: "4px" }}>
          {ai.name}
        </h3>
        <p
          style={{
            color: ai.color,
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          {ai.role}
        </p>
        <p
          className="body"
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}
        >
          {ai.desc}
        </p>
      </div>
    </div>
  );
}

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
