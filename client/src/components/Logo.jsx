import React from 'react';

export default function Logo({
  className = '',
  iconOnly = false,
  showText = true,
  size = 'md',
  ...props
}) {
  const sizeMap = {
    xs: {
      icon: 'h-6 w-6',
      full: 'h-8 max-w-[100px]',
    },
    sm: {
      icon: 'h-8 w-8',
      full: 'h-10 max-w-[130px]',
    },
    md: {
      icon: 'h-10 w-10',
      full: 'h-12 sm:h-13 max-w-[170px]',
    },
    lg: {
      icon: 'h-14 w-14',
      full: 'h-16 sm:h-20 max-w-[240px]',
    },
    xl: {
      icon: 'h-20 w-20',
      full: 'h-24 sm:h-28 max-w-[340px]',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none shrink-0 ${className}`} {...props}>
        <img
          src="/gubbi-bird.png"
          alt="Gubbi Icon"
          className={`${currentSize.icon} aspect-square object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-sm`}
          onError={(e) => {
            e.currentTarget.src = '/gubbi-logo.png';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`} {...props}>
      <img
        src="/gubbi-logo-transparent.png"
        alt="Gubbi - Learn. Play. Shine."
        className={`${currentSize.full} w-auto object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]`}
        onError={(e) => {
          e.currentTarget.src = '/gubbi-logo.png';
        }}
      />
    </div>
  );
}
