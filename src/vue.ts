import { defineComponent, h, ref, watchPostEffect, type DefineComponent, type PropType } from 'vue';
import { avatar, follow, type Effects, type Shape } from './index.js';

export interface AvatarProps extends Effects {
  seed: string | number;
  shape?: Shape;
  /** Eyes follow the pointer. */
  follow?: boolean;
}

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
