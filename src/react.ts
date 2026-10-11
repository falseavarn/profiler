import { createElement, useEffect, useRef, type HTMLAttributes, type ReactElement } from 'react';
import { avatar, follow, type Effects, type Shape } from './index.js';

export interface AvatarProps extends Effects, HTMLAttributes<HTMLDivElement> {
  seed: string | number;
  shape?: Shape;
  /** Eyes follow the pointer. */
  follow?: boolean;
}

export function Avatar({ seed, shape, blink, spin, follow: track, ...rest }: AvatarProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (track && ref.current ? follow(ref.current) : undefined), [track]);
  return createElement('div', { ...rest, ref, dangerouslySetInnerHTML: { __html: avatar(seed, shape, { blink, spin }) } });
}
