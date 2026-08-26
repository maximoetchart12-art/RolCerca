import React from 'react';

interface RolCercaLogoProps {
  className?: string;
  size?: number;
}

export const RolCercaLogo: React.FC<RolCercaLogoProps> = ({ 
  className = "w-7 h-7", 
  size = 28 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo RolCerca: Mapa y Dados"
    >
      <defs>
        <linearGradient id="pinGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#800020" />
        </linearGradient>
        <linearGradient id="facetHighlight" x1="12" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>

      {/* Folded Map Pin Minimalist Base */}
      <path 
        d="M16 2.5C10.2 2.5 5.5 7.2 5.5 13C5.5 20.8 14.8 28.6 15.4 29.1C15.7 29.4 16.3 29.4 16.6 29.1C17.2 28.6 26.5 20.8 26.5 13C26.5 7.2 21.8 2.5 16 2.5Z" 
        fill="url(#pinGrad)" 
        stroke="#FECDD3" 
        strokeWidth="1.2" 
        strokeLinejoin="round"
      />

      {/* Internal Shield / Contrast background for the dice */}
      <circle cx="16" cy="13" r="7.5" fill="#0F0F11" stroke="#800020" strokeWidth="1" />

      {/* Minimalist D20 / RPG Dice Geometry inside Map Pin */}
      <g transform="translate(10.5, 7.5)">
        {/* Outer hexagon */}
        <polygon 
          points="5.5,0.5 10.5,3.2 10.5,7.8 5.5,10.5 0.5,7.8 0.5,3.2" 
          fill="#1C1917" 
          stroke="#FECDD3" 
          strokeWidth="0.8" 
          strokeLinejoin="round" 
        />
        {/* Top center triangle */}
        <polygon 
          points="5.5,0.5 8.2,5.5 2.8,5.5" 
          fill="url(#facetHighlight)" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Upper right facet */}
        <polygon 
          points="5.5,0.5 10.5,3.2 8.2,5.5" 
          fill="#E11D48" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Upper left facet */}
        <polygon 
          points="5.5,0.5 0.5,3.2 2.8,5.5" 
          fill="#BE123C" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Bottom central inverted triangle */}
        <polygon 
          points="2.8,5.5 8.2,5.5 5.5,10.5" 
          fill="#9F1239" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Left lower facet */}
        <polygon 
          points="0.5,3.2 2.8,5.5 0.5,7.8" 
          fill="#881337" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Right lower facet */}
        <polygon 
          points="10.5,3.2 8.2,5.5 10.5,7.8" 
          fill="#881337" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Bottom left facet */}
        <polygon 
          points="2.8,5.5 0.5,7.8 5.5,10.5" 
          fill="#4C0519" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
        {/* Bottom right facet */}
        <polygon 
          points="8.2,5.5 10.5,7.8 5.5,10.5" 
          fill="#4C0519" 
          stroke="#FECDD3" 
          strokeWidth="0.6" 
          strokeLinejoin="round" 
        />
      </g>
    </svg>
  );
};
