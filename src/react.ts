/**
 * React component for profiler avatars.
 *
 * ```tsx
 * import { Avatar } from '@falseavarn/profiler/react';
 * <Avatar seed="alice" shape="square" blink follow className="avatar" />
 * ```
 *
 * @module
 */
import { createElement, useEffect, useRef, type HTMLAttributes, type ReactElement } from 'react';
import { avatar, follow, type Effects, type Shape } from './index.js';

/** Props for {@link Avatar}; other `div` props are passed through. */
export interface AvatarProps extends Effects, HTMLAttributes<HTMLDivElement> {
  /** Any string or number; the same seed always gives the same face. */
  seed: string | number;
  /** `'circle'` (default) or `'square'`. */
  shape?: Shape;
  /** Eyes follow the pointer. */
  follow?: boolean;
}

/** Renders the seeded SVG avatar inside a `div`. Size it with CSS. */
export function Avatar({ seed, shape, blink, spin, follow: track, ...rest }: AvatarProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (track && ref.current ? follow(ref.current) : undefined), [track]);
  return createElement('div', { ...rest, ref, dangerouslySetInnerHTML: { __html: avatar(seed, shape, { blink, spin }) } });
}
