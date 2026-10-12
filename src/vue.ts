/**
 * Vue 3 component for profiler avatars.
 *
 * ```vue
 * <script setup>
 * import { Avatar } from '@falseavarn/profiler/vue';
 * </script>
 * <template><Avatar seed="alice" shape="square" blink follow /></template>
 * ```
 *
 * @module
 */
import { defineComponent, h, ref, watchPostEffect, type DefineComponent, type PropType } from 'vue';
import { avatar, follow, type Effects, type Shape } from './index.js';

/** Props for {@link Avatar}. */
export interface AvatarProps extends Effects {
  /** Any string or number; the same seed always gives the same face. */
  seed: string | number;
  /** `'circle'` (default) or `'square'`. */
  shape?: Shape;
  /** Eyes follow the pointer. */
  follow?: boolean;
}

/** Renders the seeded SVG avatar inside a `div`. Size it with CSS. */
// explicit type: JSR rejects inferred types in the public API
export const Avatar: DefineComponent<AvatarProps> = defineComponent({
  name: 'Avatar',
  props: {
    seed: { type: [String, Number], required: true },
    shape: String as PropType<Shape>,
    blink: Boolean,
    spin: Boolean,
    /** Eyes follow the pointer. */
    follow: Boolean,
  },
  setup(props) {
    const el = ref<HTMLElement>();
    watchPostEffect(onCleanup => {
      if (props.follow && el.value) onCleanup(follow(el.value));
    });
    return () => h('div', { ref: el, innerHTML: avatar(props.seed, props.shape, { blink: props.blink, spin: props.spin }) });
  },
});
