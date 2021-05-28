<template>
  <div
    class="pure-text"
    :style="{
      backgroundColor: styles.backgroundColor,
      backgroundImage: `url(${styles.backgroundImage})`,
      backgroundRepeat: styles.backgroundRepeat ? 'repeat' : 'no-repeat',
      color: styles.color,
      fontSize: styles.fontSize + 'px',
      textIndent: config.leadingSpace && textAlign == 'left' ? '2em' : '0em',
      lineHeight: styles.lineHeight + 'px',
      textAlign: textAlign,
      backgroundSize: styles.backgroundSize == '自定义大小' ? `${styles.backgroundWidth} ${styles.backgroundHeight}` : styles.backgroundSize,
      padding: `${styles.topPadding}px ${styles.rightPadding}px ${styles.bottomPadding}px ${styles.leftPadding}px`,
    }"
  >
  {{ config.text }}
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      required: true,
    },
    styles: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    textAlign() {
      const textAlignMap = new Map([
        ['左对齐', 'left'],
        ['居中对齐', 'center'],
        ['右对齐', 'right']
      ])
      return textAlignMap.get(this.config.alignment);
    }
  },
  methods: {

  },
};
</script>

<style lang="less" scoped>
.pure-text {
  width: 100%;
  text-align: justify;
}
</style>
