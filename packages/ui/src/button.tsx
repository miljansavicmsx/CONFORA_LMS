import type { ButtonHTMLAttributes } from 'react';

export function Button({
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={
        'cf-bg-[#0369A1] cf-text-white cf-px-4 cf-py-2 cf-rounded-md cf-font-medium ' +
        'hover:cf-bg-[#0284C7] focus-visible:cf-outline focus-visible:cf-outline-2 ' +
        'focus-visible:cf-outline-offset-2 focus-visible:cf-outline-[#0EA5E9] ' +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}
