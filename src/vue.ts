import { defineComponent, h, ref, watchPostEffect, type PropType } from 'vue';
import { avatar, follow, type Shape } from './index.js';

export const Avatar = defineComponent({
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
