<template>
  <div
    class="blank-block"
    :style="{
      height: styles.height + 'px',
      backgroundColor: styles.backgroundColor,
      backgroundImage: `url(${styles.backgroundImage})`,
      backgroundRepeat: styles.backgroundRepeat ? 'repeat' : 'no-repeat',
      backgroundSize: styles.backgroundSize == '自定义大小' ? `${styles.backgroundWidth} ${styles.backgroundHeight}` : styles.backgroundSize,
    }"
  ></div>
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
.blank-block {
  width: 100%;
}
</style>
