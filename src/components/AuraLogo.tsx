import React from 'react';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({ size = 'md', className = '' }) => {
  const dim = size === 'sm' ? 18 : size === 'lg' ? 36 : 22;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Outer Aura Ring */}
        <circle
          cx="16"
          cy="16"
          r="14.5"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-neutral-400 dark:text-neutral-700"
          strokeDasharray="2 3"
        />

        {/* Inner Geometric Aura Frame */}
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-neutral-600 dark:text-neutral-400 opacity-60"
        />

        {/* Architectural Stylized "A" Prism with Audio-Video Beam */}
        <path
          d="M16 6L23 23H19.5L16 13.5L12.5 23H9L16 6Z"
          fill="currentColor"
          className="text-neutral-900 dark:text-white"
        />

        {/* Precision Crossbar Wave */}
        <line
          x1="12"
          y1="18.5"
          x2="20"
          y2="18.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="text-white dark:text-neutral-950"
        />

        {/* Center Aura Focal Point */}
        <circle
          cx="16"
          cy="16"
          r="1.2"
          fill="currentColor"
          className="text-white dark:text-neutral-950"
        />
      </svg>
    </div>
  );
};
