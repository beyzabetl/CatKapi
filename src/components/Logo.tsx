import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  showPhone?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  showPhone = true,
  className = '',
  size = 'md'
}) => {
  const isDark = variant === 'dark' || variant === 'auto';

  // Responsive dimensions
  const scaleMap = {
    sm: 'h-10 text-xs',
    md: 'h-14 text-sm',
    lg: 'h-20 text-base',
    xl: 'h-28 text-lg'
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* SVG House Outline & Brandmark */}
      <div className="relative flex flex-col items-center">
        {/* Roof Graphic with Chimney */}
        <svg
          viewBox="0 0 400 120"
          className={size === 'sm' ? 'w-36 h-10' : size === 'md' ? 'w-48 h-12' : size === 'lg' ? 'w-64 h-16' : 'w-80 h-20'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chimney */}
          <path
            d="M 285,42 L 285,20 L 308,20 L 308,55"
            stroke="#f57c00"
            strokeWidth="7"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          {/* Roof Ridge Peak */}
          <path
            d="M 25,75 L 200,18 L 375,75"
            stroke="#f57c00"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle lower roof curve */}
          <path
            d="M 50,78 Q 200,42 350,78"
            stroke="#f57c00"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        {/* Main "ÇAT KAPI" Text */}
        <div className="-mt-3 sm:-mt-4 flex items-center justify-center tracking-wider font-extrabold font-heading">
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white px-1 tracking-tight"
            style={{
              color: '#f57c00',
              textShadow: '0 0 2px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              WebkitTextStroke: '1px #ffffff',
              letterSpacing: '0.08em'
            }}
          >
            ÇAT KAPI
          </span>
        </div>

        {/* Subtitle "MOBİLYA" with side lines */}
        <div className="w-full flex items-center justify-center gap-2 mt-0.5">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#f57c00] to-[#f57c00]" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#f57c00] font-heading px-1">
            MOBİLYA
          </span>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#f57c00] to-[#f57c00]" />
        </div>

        {/* Phone number & phone icon if requested */}
        {showPhone && (
          <div className="w-full flex items-center justify-center gap-2 mt-1">
            <span className="text-[#f57c00] text-xs font-bold tracking-tighter">==</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f57c00]/10 border border-[#f57c00]/30 rounded-none">
              <svg
                className="w-3.5 h-3.5 text-[#f57c00]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
              </svg>
              <span className="text-[11px] sm:text-xs font-bold text-white font-mono tracking-wider">
                0535 219 47 89
              </span>
            </div>
            <span className="text-[#f57c00] text-xs font-bold tracking-tighter">==</span>
          </div>
        )}
      </div>
    </div>
  );
};
