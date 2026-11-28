import React from 'react';

export default function Logo({
  className = '',
  imgClassName = '',
  iconOnly = false,
  showText = true,
  size = 'md',
  variant = 'badge',
  dropShadow = false,
  ...props
}) {
  const sizeMap = {
    xs: {
      icon: 'h-6 w-6',
      badge: 'w-7 h-7 rounded-lg',
      badgeImg: 'w-4.5 h-4.5',
      title: 'text-sm',
      sub: 'text-[7.5px]',
      full: 'h-7 max-h-[30px] max-w-[90px]',
    },
    sm: {
      icon: 'h-8 w-8',
      badge: 'w-8 h-8 rounded-lg',
      badgeImg: 'w-5.5 h-5.5',
      title: 'text-[15px] sm:text-base',
      sub: 'text-[8px] sm:text-[8.5px]',
      full: 'h-9 sm:h-10 max-h-[42px] max-w-[125px]',
    },
    md: {
      icon: 'h-10 w-10',
      badge: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
      badgeImg: 'w-6 h-6 sm:w-7 sm:h-7',
      title: 'text-[17px] sm:text-[19px]',
      sub: 'text-[9px] sm:text-[10px]',
      full: 'h-[46px] sm:h-[50px] md:h-[52px] max-h-[54px] max-w-[165px]',
    },
    lg: {
      icon: 'h-12 w-12',
      badge: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl',
      badgeImg: 'w-8 h-8 sm:w-9 sm:h-9',
      title: 'text-xl sm:text-2xl',
      sub: 'text-xs',
      full: 'h-12 sm:h-14 max-h-[58px] max-w-[185px]',
    },
    xl: {
      icon: 'h-16 w-16',
      badge: 'w-14 h-14 rounded-2xl',
      badgeImg: 'w-10 h-10',
      title: 'text-2xl sm:text-3xl',
      sub: 'text-sm',
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

  // Official Modern Badge Lockup (matches media_1795859490909_52c4e416)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`} {...props}>
        <div
          className={`${currentSize.badge} bg-white shadow-xs border border-purple-100/90 dark:border-purple-900/40 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105`}
        >
          <img
            src="/gubbi-bird.png"
            alt="Gubbi Mascot"
            className={`${currentSize.badgeImg} object-contain`}
            style={{
              imageRendering: '-webkit-optimize-contrast',
            }}
            onError={(e) => {
              e.currentTarget.src = '/gubbi-logo.png';
            }}
          />
        </div>
        {showText && (
          <div className="flex flex-col justify-center text-left">
            <span
              className={`font-['Inter'] font-extrabold ${currentSize.title} tracking-tight text-[#0F172A] dark:text-white leading-none`}
            >
              Gubbi
            </span>
            <span
              className={`font-['Inter'] font-bold ${currentSize.sub} text-[#551BF5] dark:text-purple-400 uppercase tracking-wider mt-0.5 sm:mt-1 whitespace-nowrap leading-none hidden min-[360px]:inline-block`}
            >
              Game. Quiz. Engage.
            </span>
          </div>
        )}
      </div>
    );
  }

  // Classic Transparent Full Image Variant
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
