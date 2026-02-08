import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[rgba(255,255,255,0.1)] py-12 px-6 mt-auto">
      <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-white font-bold text-lg tracking-tight">
              MarketPulse
            </span>
          </Link>
          <p className="text-muted text-sm leading-relaxed">
            AI-powered behavioral finance tools for the modern trader. Detect
            bias, manage risk, and trade smarter.
          </p>
          <div className="flex gap-4 mt-6">
            <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink
              href="#"
              icon={<Linkedin size={18} />}
              label="LinkedIn"
            />
            <SocialLink href="#" icon={<Github size={18} />} label="GitHub" />
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/chatbot">Bias Detector AI</FooterLink>
            </li>
            <li>
              <FooterLink to="/watchlist">Real-time Watchlist</FooterLink>
            </li>
            <li>
              <FooterLink to="/pricing">Pricing</FooterLink>
            </li>
            <li>
              <FooterLink to="/features">All Features</FooterLink>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/about">About Us</FooterLink>
            </li>
            <li>
              <FooterLink to="/careers">Careers</FooterLink>
            </li>
            <li>
              <FooterLink to="/blog">Blog</FooterLink>
            </li>
            <li>
              <FooterLink to="/contact">Contact</FooterLink>
            </li>
          </ul>
        </div>

        {/* Links Column 3: Legal & Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/faq">FAQ</FooterLink>
            </li>
            <li>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
            </li>
            <li>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </li>
            <li>
              <a
                href="mailto:support@marketpulse.com"
                className="hover:text-white transition-colors"
              >
                support@marketpulse.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar - INCREASED MARGIN TOP HERE (mt-24) */}
      <div className="container max-w-6xl mx-auto mt-48 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center text-xs text-muted">
        <p>&copy; {currentYear} MarketPulse Inc. All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          Made for the National Bank Bias Detector Challenge.
        </p>
      </div>
    </footer>
  );
}

// Sub-components
function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="hover:text-[#DC143C] transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[#DC143C] hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}
