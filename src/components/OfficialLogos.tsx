import React from 'react';

/**
 * SGEx Crest Component - Secretaria-Geral do Exército
 * Using exact official image from /public/Secretaria-Geral redimen.png
 */
export const SGExLogo: React.FC<{ className?: string; id?: string; alt?: string }> = ({
  className = "w-20 h-24",
  id,
  alt = "Brasão da Secretaria-Geral do Exército"
}) => {
  return (
    <img
      id={id}
      src="/Secretaria-Geral redimen.png"
      alt={alt}
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
};

/**
 * B ADM QGEX Crest Component - Base Administrativa do Quartel-General do Exército
 * Using exact official image from /public/badmqgex.min.png
 */
export const BAdmQgexLogo: React.FC<{ className?: string; id?: string; alt?: string }> = ({
  className = "w-20 h-24",
  id,
  alt = "Brasão da Base Administrativa do QGEx"
}) => {
  return (
    <img
      id={id}
      src="/badmqgex.min.png"
      alt={alt}
      className={`object-contain ${className}`}
      loading="eager"
    />
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
