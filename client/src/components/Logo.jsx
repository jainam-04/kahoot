import React from 'react';

export default function Logo({
  className = '',
  imgClassName = '',
  iconOnly = false,
  showText = true,
  size = 'md',
  ...props
}) {
  const sizeMap = {
    xs: {
      icon: 'h-8 w-8',
      full: 'h-9 sm:h-10 max-w-[130px]',
    },
    sm: {
      icon: 'h-10 w-10',
      full: 'h-11 sm:h-13 max-w-[160px]',
    },
    md: {
      icon: 'h-12 w-12',
      full: 'h-14 sm:h-16 max-w-[200px]',
    },
    lg: {
      icon: 'h-16 w-16',
      full: 'h-18 sm:h-22 max-w-[260px]',
    },
    xl: {
      icon: 'h-24 w-24',
      full: 'h-24 sm:h-30 max-w-[360px]',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none shrink-0 ${className}`} {...props}>
        <img
          src="/gubbi-bird.png"
          alt="Gubbi Icon"
          className={`${imgClassName || currentSize.icon} aspect-square object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-sm`}
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
        className={`${imgClassName || currentSize.full} w-auto object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]`}
        onError={(e) => {
          e.currentTarget.src = '/gubbi-logo.png';
        }}
      />
    </div>
  );
}
