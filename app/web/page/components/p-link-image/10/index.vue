<template>
  <a
    class="p-link-image"
    :href="config.address"
    :target="config.newWinOpen ? '_blank' : ''"
    :style="formatStyles"
  >
    <el-image :src="config.backgroundImage || config.backgroundLink" fit="cover"></el-image>
  </a>
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
    edit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editStyle: {
        position: "static",
      },
    };
  },
  computed: {
    formatStyles() {
      let styles = {};
      if (this.styles.width) {
        styles.width = this.styles.width + 'px';
      }
      if (this.styles.height) {
        styles.height = this.styles.height + 'px';
      }
      if (!this.edit) {
        styles = { ...styles, ...this.styles.position };
      }
      return styles;
    }
  }
};
</script>

<style lang="less" scoped>
.p-link-image{
  display: inline-block;
}
</style>