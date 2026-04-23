// Monochrome wordmark club logos. Designed as neutral text-based marks
// to avoid trademark issues — replace with official approved assets when available.

type LogoProps = { className?: string };

const baseText = "fill-current";

export const AjaxLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 120 36" className={className} aria-label="Ajax">
    <text x="60" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 28, letterSpacing: "0.05em" }}>AJAX</text>
  </svg>
);

export const PSVLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 120 36" className={className} aria-label="PSV">
    <text x="60" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 28, letterSpacing: "0.05em" }}>PSV</text>
  </svg>
);

export const FeyenoordLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 200 36" className={className} aria-label="Feyenoord">
    <text x="100" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 26, letterSpacing: "0.05em" }}>FEYENOORD</text>
  </svg>
);

export const AZLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 80 36" className={className} aria-label="AZ Alkmaar">
    <text x="40" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 28, letterSpacing: "0.05em" }}>AZ</text>
  </svg>
);

export const UtrechtLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 180 36" className={className} aria-label="FC Utrecht">
    <text x="90" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 24, letterSpacing: "0.05em" }}>FC UTRECHT</text>
  </svg>
);

export const VitesseLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 160 36" className={className} aria-label="Vitesse">
    <text x="80" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 26, letterSpacing: "0.05em" }}>VITESSE</text>
  </svg>
);

export const TwenteLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 180 36" className={className} aria-label="FC Twente">
    <text x="90" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 24, letterSpacing: "0.05em" }}>FC TWENTE</text>
  </svg>
);

export const HeerenveenLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 200 36" className={className} aria-label="Heerenveen">
    <text x="100" y="26" textAnchor="middle" className={baseText} style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 24, letterSpacing: "0.05em" }}>HEERENVEEN</text>
  </svg>
);

export const clubLogos = [
  { name: "Ajax", Logo: AjaxLogo },
  { name: "PSV", Logo: PSVLogo },
  { name: "Feyenoord", Logo: FeyenoordLogo },
  { name: "AZ", Logo: AZLogo },
  { name: "FC Utrecht", Logo: UtrechtLogo },
  { name: "Vitesse", Logo: VitesseLogo },
  { name: "FC Twente", Logo: TwenteLogo },
  { name: "Heerenveen", Logo: HeerenveenLogo },
];
