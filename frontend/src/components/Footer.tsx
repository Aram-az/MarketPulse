import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[rgba(255,255,255,0.1)] py-12 px-6 mt-auto">
      <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-white font-bold text-lg tracking-tight">
              MarketPulse
            </span>
          </Link>

          <p className="text-muted text-sm leading-relaxed">
            {t("footer.tagline")}
          </p>

          <div className="flex gap-4 mt-6">
            <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
            <SocialLink href="#" icon={<Github size={18} />} label="GitHub" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t("footer.product")}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/chatbot">{t("footer.biasDetector")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/watchlist">{t("footer.watchlist")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/pricing">{t("footer.pricing")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/features">{t("footer.allFeatures")}</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/about">{t("footer.about")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/careers">{t("footer.careers")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/blog">{t("footer.blog")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/contact">{t("footer.contact")}</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t("footer.support")}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <FooterLink to="/faq">{t("footer.faq")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/privacy">{t("footer.privacyPolicy")}</FooterLink>
            </li>
            <li>
              <FooterLink to="/terms">{t("footer.terms")}</FooterLink>
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

      <div className="container max-w-6xl mx-auto mt-48 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center text-xs text-muted">
        <p>&copy; {currentYear} {t("footer.rights")}</p>
        <p className="mt-2 md:mt-0">{t("footer.challengeLine")}</p>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="hover:text-[#DC143C] transition-colors duration-200">
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
