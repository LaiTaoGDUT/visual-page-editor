<template>
  <a
    class="p-link-text"
    :href="config.address"
    :target="config.newWinOpen ? '_blank' : ''"
    :style="formatStyles"
  >
    {{ config.text || config.address }}
  </a>
</template>

<script>
const screenWidth = 375;
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
    underline() {
      const underlineMap = new Map([
        ["始终显示", "underline"],
        ["hover时显示", "none"],
        ["始终隐藏", "none !important"],
      ]);
      return underlineMap.get(this.config.underline);
    },
    formatStyles() {
      let styles = {};
      if (this.styles.maxWidth) {
        if (!this.edit) {
          styles.maxWidth = this.styles.maxWidth + 'vw';
        } else {
          styles.maxWidth = (375 / 100 * this.styles.maxWidth).toFixed(2) + 'px';
        }
      }
      styles.lineHeight = this.styles.lineHeight + 'px';
      styles.color = `${this.styles.color} !important`;
      styles.fontSize = this.styles.fontSize + 'px';
      styles.textDecoration = this.underline;
      if (!this.edit) {
        styles = { ...styles, ...this.styles.position };
      }
      return styles;
    }
  }
};
</script>

<style lang="less" scoped>
.p-link-text{
  overflow-wrap: break-word;
  display: inline-block;
  &:hover {
    text-decoration: underline;
  }
}
</style>