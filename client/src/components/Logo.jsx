import React from 'react';

export default function Logo({
  className = '',
  imgClassName = '',
  iconOnly = false,
  showText = true,
  size = 'md',
  dropShadow = false,
  ...props
}) {
  const sizeMap = {
    xs: {
      icon: 'h-6 w-6',
      full: 'h-7 max-h-[30px] max-w-[90px]',
    },
    sm: {
      icon: 'h-8 w-8',
      full: 'h-9 sm:h-10 max-h-[42px] max-w-[125px]',
    },
    md: {
      icon: 'h-10 w-10',
      full: 'h-[46px] sm:h-[50px] md:h-[52px] max-h-[54px] max-w-[165px]',
    },
    lg: {
      icon: 'h-12 w-12',
      full: 'h-12 sm:h-14 max-h-[58px] max-w-[185px]',
    },
    xl: {
      icon: 'h-16 w-16',
      full: 'h-16 sm:h-20 max-h-[80px] max-w-[220px]',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none shrink-0 ${className}`} {...props}>
        <img
          src="/gubbi-bird.png"
          alt="Gubbi Icon"
          className={`${imgClassName || currentSize.icon} aspect-square object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-xs`}
          style={{
            imageRendering: '-webkit-optimize-contrast',
          }}
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
        className={`${imgClassName || currentSize.full} w-auto object-contain transition-transform duration-200 hover:scale-105 ${
          dropShadow ? 'filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
        }`}
        style={{
          imageRendering: '-webkit-optimize-contrast',
        }}
        onError={(e) => {
          e.currentTarget.src = '/gubbi-logo.png';
        }}
      />
    </div>
  );
}
