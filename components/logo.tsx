interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

const SIZES = {
  sm: { svg: 32, text: "text-sm", gap: "gap-2" },
  md: { svg: 40, text: "text-base", gap: "gap-2.5" },
  lg: { svg: 52, text: "text-lg", gap: "gap-3" },
};

export function Logo({ size = "md", variant = "dark" }: LogoProps) {
  const s = SIZES[size];
  const textColor = variant === "dark" ? "#F0EBE0" : "#1A3A2A";

  return (
    <span className={`inline-flex items-center ${s.gap}`}>
      {/* SVG Mark */}
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background */}
        <rect width="120" height="120" rx="12" fill="#1F4A30" />

        {/* Left column — T implied by text alignment */}
        {/* Long top line (crossbar of T) */}
        <line x1="8" y1="20" x2="52" y2="20" stroke="#6ABB7A" strokeWidth="3" strokeLinecap="round" />
        {/* Centered short lines (stem of T) */}
        <line x1="23" y1="30" x2="37" y2="30" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="23" y1="38" x2="37" y2="38" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="46" x2="40" y2="46" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="54" x2="42" y2="54" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="23" y1="62" x2="37" y2="62" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="23" y1="70" x2="37" y2="70" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />

        {/* Central arrow — amber */}
        <line x1="56" y1="35" x2="56" y2="85" stroke="#C9882A" strokeWidth="2" strokeLinecap="round" />
        <polyline points="50,75 56,85 62,75" stroke="#C9882A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Horizontal arrow */}
        <line x1="46" y1="55" x2="66" y2="55" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Right column — J implied by right-aligned text */}
        {/* Long top line */}
        <line x1="78" y1="20" x2="112" y2="20" stroke="#C8EDD4" strokeWidth="3" strokeLinecap="round" />
        {/* Right-aligned short lines */}
        <line x1="100" y1="30" x2="112" y2="30" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="98" y1="38" x2="112" y2="38" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="95" y1="46" x2="112" y2="46" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="54" x2="112" y2="54" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
        {/* J curve — last lines shift left */}
        <line x1="88" y1="62" x2="105" y2="62" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="82" y1="70" x2="98" y2="70" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />

        {/* Gold seal — bottom right */}
        <circle cx="100" cy="100" r="8" stroke="#C9882A" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="100" r="2.5" fill="#C9882A" />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-sans font-light ${s.text} leading-none`}
        style={{ color: textColor }}
      >
        mitraductor<strong className="font-medium">jurado</strong>
        <span style={{ color: "#C9882A" }}>.es</span>
      </span>
    </span>
  );
}
