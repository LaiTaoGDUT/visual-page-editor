<template>
  <div
    class="pure-text"
    v-html="config.text"
    :style="{
      backgroundColor: styles.backgroundColor,
      backgroundImage: `url(${styles.backgroundImage})`,
      backgroundRepeat: styles.backgroundRepeat ? 'repeat' : 'no-repeat',
      lineHeight: styles.lineHeight + 'px',
      backgroundSize: styles.backgroundSize == '自定义大小' ? `${styles.backgroundWidth} ${styles.backgroundHeight}` : styles.backgroundSize,
      padding: `${styles.topPadding}px ${styles.rightPadding}px ${styles.bottomPadding}px ${styles.leftPadding}px`,
    }"
  >
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
  methods: {

  },
};
</script>

<style lang="less" scoped>
.pure-text {
  width: 100%;
}
</style>
