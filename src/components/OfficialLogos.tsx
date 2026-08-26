import React from 'react';

/**
 * SGEx Crest Component - Secretaria-Geral do Exército
 * Faithful vector rendering of segexsf.png
 */
export const SGExLogo: React.FC<{ className?: string; id?: string }> = ({ className = "w-20 h-24", id }) => {
  return (
    <svg
      id={id}
      viewBox="0 0 200 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="sgex-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Gold Shield Exterior Trim */}
      <path
        d="M 16 12 H 184 V 162 C 184 224, 100 250, 100 250 C 100 250, 16 224, 16 162 Z"
        fill="#FFCA08"
        stroke="#D49000"
        strokeWidth="1.5"
      />

      {/* Red Header Box */}
      <path
        d="M 20 16 H 180 V 68 H 20 Z"
        fill="#D91023"
      />

      {/* Blue Ribbon Bar */}
      <rect x="20" y="32" width="160" height="32" fill="#0671CE" stroke="#FFCA08" strokeWidth="2" />

      {/* Text "S G EX" */}
      <text
        x="100"
        y="56"
        textAnchor="middle"
        fill="#FFFFFF"
        stroke="#FFD700"
        strokeWidth="1"
        fontFamily="'Times New Roman', Georgia, serif"
        fontWeight="900"
        fontSize="25"
        letterSpacing="4"
      >
        S G EX
      </text>

      {/* Main Red Field */}
      <path
        d="M 20 68 H 180 V 160 C 180 218, 100 244, 100 244 C 100 244, 20 218, 20 160 Z"
        fill="#D91023"
      />

      {/* Central White Diamond / Rhombus */}
      <polygon
        points="100,74 174,152 100,230 26,152"
        fill="#FFFFFF"
      />

      {/* Heraldic Crossed Swords & Central Quill */}
      {/* Crossed Sabre 1: Bottom-Left to Top-Right */}
      <g>
        {/* Blade */}
        <line x1="48" y1="184" x2="148" y2="114" stroke="#B84A04" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="48" y1="184" x2="148" y2="114" stroke="#E68A00" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sabre Guard / Bowl */}
        <path d="M 44 186 C 40 190, 48 200, 56 194 C 62 188, 54 180, 48 184" fill="#E68A00" stroke="#7A2E00" strokeWidth="1.5" />
        {/* Pommel */}
        <circle cx="43" cy="188" r="3.5" fill="#B84A04" />
      </g>

      {/* Crossed Sabre 2: Bottom-Right to Top-Left */}
      <g>
        {/* Blade */}
        <line x1="152" y1="184" x2="52" y2="114" stroke="#B84A04" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="152" y1="184" x2="52" y2="114" stroke="#E68A00" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sabre Guard / Bowl */}
        <path d="M 156 186 C 160 190, 152 200, 144 194 C 138 188, 146 180, 152 184" fill="#E68A00" stroke="#7A2E00" strokeWidth="1.5" />
        {/* Pommel */}
        <circle cx="157" cy="188" r="3.5" fill="#B84A04" />
      </g>

      {/* Central Official Writing Quill (Pena de Escrever da SGEx) */}
      <g>
        {/* Quill Shaft */}
        <line x1="100" y1="94" x2="100" y2="216" stroke="#8C1D04" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="94" x2="100" y2="212" stroke="#E68A00" strokeWidth="2" strokeLinecap="round" />

        {/* Quill Vanes / Barbs (Symmetrical Leaf/Feather Segments) */}
        {/* Top Tip */}
        <path d="M 100 94 C 95 102, 95 110, 100 114 C 105 110, 105 102, 100 94 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 96 C 97 103, 97 108, 100 112 C 103 108, 103 103, 100 96 Z" fill="#E68A00" />

        {/* Section 1 */}
        <path d="M 100 110 C 90 116, 88 128, 100 134 C 100 134, 100 110, 100 110 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 110 C 110 116, 112 128, 100 134 C 100 134, 100 110, 100 110 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 113 C 93 118, 92 125, 100 130 Z" fill="#E68A00" />
        <path d="M 100 113 C 107 118, 108 125, 100 130 Z" fill="#E68A00" />

        {/* Section 2 */}
        <path d="M 100 130 C 88 138, 86 152, 100 158 C 100 158, 100 130, 100 130 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 130 C 112 138, 114 152, 100 158 C 100 158, 100 130, 100 130 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 133 C 91 140, 90 148, 100 154 Z" fill="#E68A00" />
        <path d="M 100 133 C 109 140, 110 148, 100 154 Z" fill="#E68A00" />

        {/* Section 3 */}
        <path d="M 100 154 C 90 162, 88 174, 100 180 C 100 180, 100 154, 100 154 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 154 C 110 162, 112 174, 100 180 C 100 180, 100 154, 100 154 Z" fill="#C81820" stroke="#7A0000" strokeWidth="1" />
        <path d="M 100 157 C 92 164, 91 170, 100 176 Z" fill="#E68A00" />
        <path d="M 100 157 C 108 164, 109 170, 100 176 Z" fill="#E68A00" />

        {/* Nib / Calamus */}
        <polygon points="98,180 102,180 101,216 99,216" fill="#8C1D04" />
        <polygon points="99,206 101,206 100.5,216 99.5,216" fill="#FFCA08" />
      </g>
    </svg>
  );
};

/**
 * B ADM QGEX Crest Component - Base Administrativa do Quartel-General do Exército
 * Faithful vector rendering of badmqgex2.png
 */
export const BAdmQgexLogo: React.FC<{ className?: string; id?: string }> = ({ className = "w-20 h-24", id }) => {
  return (
    <svg
      id={id}
      viewBox="0 0 200 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gold Shield Exterior Trim */}
      <path
        d="M 16 12 H 184 V 162 C 184 224, 100 250, 100 250 C 100 250, 16 224, 16 162 Z"
        fill="#FFCA08"
        stroke="#D49000"
        strokeWidth="1.5"
      />

      {/* Red Header Box */}
      <path
        d="M 20 16 H 180 V 66 H 20 Z"
        fill="#D91023"
      />

      {/* Blue Ribbon Bar */}
      <rect x="20" y="30" width="160" height="30" fill="#0C4AA6" stroke="#FFCA08" strokeWidth="2" />

      {/* Text "B ADM QGEX" */}
      <text
        x="100"
        y="53"
        textAnchor="middle"
        fill="#FFFFFF"
        stroke="#FFD700"
        strokeWidth="0.9"
        fontFamily="'Times New Roman', Georgia, serif"
        fontWeight="900"
        fontSize="17"
        letterSpacing="1"
      >
        B ADM QGEX
      </text>

      {/* Broad Red Border Shield */}
      <path
        d="M 20 66 H 180 V 160 C 180 218, 100 244, 100 244 C 100 244, 20 218, 20 160 Z"
        fill="#D91023"
      />

      {/* Inner White Shield */}
      <path
        d="M 36 80 H 164 V 156 C 164 204, 100 228, 100 228 C 100 228, 36 204, 36 156 Z"
        fill="#FFFFFF"
        stroke="#D91023"
        strokeWidth="2"
      />

      {/* Top Graphic: Forte Caxias Monument (Obelisco + Concha Acústica de Brasília) in Gold/Bronze */}
      <g stroke="#A65B12" fill="none">
        {/* Horizontal Baseline */}
        <line x1="50" y1="134" x2="150" y2="134" stroke="#A65B12" strokeWidth="3" strokeLinecap="round" />

        {/* Vertical Obelisco */}
        <polygon points="73,90 77,90 80,134 70,134" fill="#A65B12" stroke="#7A3E05" strokeWidth="1" />

        {/* Curved Shell of Concha Acústica */}
        <path
          d="M 55 132 C 54 116, 110 114, 146 134"
          stroke="#A65B12"
          strokeWidth="3.5"
        />
        {/* Inner Curved Arc */}
        <path
          d="M 66 134 C 70 123, 106 122, 136 134"
          stroke="#A65B12"
          strokeWidth="2"
        />
        {/* Support Strut */}
        <line x1="126" y1="128" x2="128" y2="134" stroke="#A65B12" strokeWidth="2" />
      </g>

      {/* Bottom Graphic: Upright Espada de Caxias with Laurel Branches & Bow */}
      <g>
        {/* Sword Blade (Vertical) */}
        <polygon points="100,144 96,150 96,192 104,192 104,150" fill="#E68A00" stroke="#7A3E05" strokeWidth="1.2" />
        <line x1="100" y1="145" x2="100" y2="192" stroke="#FFF" strokeWidth="1" />

        {/* Crossguard */}
        <rect x="88" y="192" width="24" height="4" rx="2" fill="#A65B12" stroke="#7A3E05" strokeWidth="1" />

        {/* Grip and Pommel */}
        <rect x="97.5" y="196" width="5" height="12" fill="#7A3E05" />
        <line x1="97.5" y1="199" x2="102.5" y2="199" stroke="#E68A00" strokeWidth="1" />
        <line x1="97.5" y1="203" x2="102.5" y2="203" stroke="#E68A00" strokeWidth="1" />
        <circle cx="100" cy="211" r="3.5" fill="#A65B12" stroke="#7A3E05" strokeWidth="1" />

        {/* Laurel Leaves left */}
        <ellipse cx="86" cy="180" rx="3.5" ry="8" transform="rotate(-40 86 180)" fill="#C87A1E" stroke="#7A3E05" strokeWidth="0.8" />
        <ellipse cx="78" cy="172" rx="3.5" ry="7.5" transform="rotate(-55 78 172)" fill="#E68A00" stroke="#7A3E05" strokeWidth="0.8" />

        {/* Laurel Leaves right */}
        <ellipse cx="114" cy="180" rx="3.5" ry="8" transform="rotate(40 114 180)" fill="#C87A1E" stroke="#7A3E05" strokeWidth="0.8" />
        <ellipse cx="122" cy="172" rx="3.5" ry="7.5" transform="rotate(55 122 172)" fill="#E68A00" stroke="#7A3E05" strokeWidth="0.8" />

        {/* Ribbon Bow at Base */}
        <path d="M 94 195 C 90 198, 92 203, 97 200 C 95 197, 95 195, 94 195 Z" fill="#A65B12" stroke="#7A3E05" strokeWidth="0.7" />
        <path d="M 106 195 C 110 198, 108 203, 103 200 C 105 197, 105 195, 106 195 Z" fill="#A65B12" stroke="#7A3E05" strokeWidth="0.7" />
      </g>
    </svg>
  );
};

/**
 * Director signature placeholder for manual signing (kept empty for physical signatures)
 */
export const DirectorSignature: React.FC<{ className?: string; id?: string }> = ({ className = "w-44 h-16", id }) => {
  return null;
};

/**
 * Baroque Corner Flourish (Top-Left, can be mirrored)
 */
export const BaroqueCorner: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-24 h-24", style }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M 5 5 L 85 5 C 80 8, 75 12, 72 18 C 65 14, 52 14, 48 22 C 45 28, 48 36, 40 38 C 32 40, 26 32, 22 45 C 18 55, 25 65, 18 72 C 12 78, 8 80, 5 85 Z" fill="#1e293b" opacity="0.9" />
      <path d="M 12 12 L 65 12 C 55 18, 45 20, 40 28 C 35 36, 36 45, 28 50 C 20 55, 18 45, 12 65 Z" fill="#0f172a" />
      <circle cx="28" cy="28" r="6" fill="#0f172a" />
      <circle cx="50" cy="18" r="4" fill="#0f172a" />
      <circle cx="18" cy="50" r="4" fill="#0f172a" />
      <path d="M 5 5 L 5 95 L 8 95 L 8 8 L 95 8 L 95 5 Z" fill="#0f172a" />
      <path d="M 14 14 L 14 85 L 16 85 L 16 16 L 85 16 L 85 14 Z" fill="#334155" />
    </svg>
  );
};

/**
 * Center Header Ribbon / Flourish below CERTIFICADO
 */
export const CertificateFlourish: React.FC<{ className?: string }> = ({ className = "w-56 h-6 text-slate-800" }) => {
  return (
    <svg
      viewBox="0 0 240 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <line x1="10" y1="12" x2="85" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 85 12 C 95 5, 105 5, 112 12 C 105 19, 95 19, 85 12 Z" fill="currentColor" />
      <circle cx="120" cy="12" r="4.5" fill="currentColor" />
      <path d="M 155 12 C 145 5, 135 5, 128 12 C 135 19, 145 19, 155 12 Z" fill="currentColor" />
      <line x1="155" y1="12" x2="230" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
