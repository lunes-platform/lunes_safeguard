import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
};

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

export function Skeleton({ className = '', rounded = 'md', ...rest }: Props) {
  return (
    <div
      className={`bg-neutral-200/80 animate-pulse ${roundedMap[rounded]} ${className}`}
      {...rest}
    />
  );
}

export default Skeleton;
