import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export function ResQMeshIcon({ size = 32, className = '' }: { size?: number | string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dark Navy Rounded Background */}
      <rect width="512" height="512" rx="116" fill="#091A44" />

      {/* Segmented Ring - Top Left */}
      <path
        d="M 242 86 A 170 170 0 0 0 86 242 L 152 242 A 104 104 0 0 1 242 152 Z"
        fill="white"
      />

      {/* Segmented Ring - Top Right */}
      <path
        d="M 270 86 L 270 152 A 104 104 0 0 1 360 242 L 426 242 A 170 170 0 0 0 270 86 Z"
        fill="white"
      />

      {/* Segmented Ring - Bottom Left */}
      <path
        d="M 86 270 A 170 170 0 0 0 242 426 L 242 360 A 104 104 0 0 1 152 270 Z"
        fill="white"
      />

      {/* Segmented Ring - Bottom Right Q-Tail Structure */}
      <path
        d="M 270 360 L 270 426 A 170 170 0 0 0 380 376 L 332 328 A 104 104 0 0 1 270 360 Z"
        fill="white"
      />

      {/* Q Diagonal Cross Stem / Arrow Tail */}
      <path
        d="M 284 284 L 372 372 L 426 372 L 350 296 L 316 296 Z"
        fill="white"
      />

      {/* Teal / Cyan Directional Arrow Accent */}
      <polygon
        points="340,360 416,396 376,320 364,344"
        fill="#00A389"
      />
    </svg>
  );
}

export default function Logo({ size = 36, showText = true, className = '', textColor = '#091A44' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ResQMeshIcon size={size} />
      {showText && (
        <span
          className="font-bold tracking-tight text-lg"
          style={{ color: textColor, fontFamily: 'Outfit, Inter, sans-serif' }}
        >
          resqmesh
        </span>
      )}
    </div>
  );
}
