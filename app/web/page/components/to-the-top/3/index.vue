<template>
  <div class="to-the-top">
    <a-back-top v-if="edit" :style="{ background: styles.backgroundColor, ...editStyle }" :visibilityHeight="-1">
    </a-back-top>
    <a-back-top v-else :style="{ background: styles.backgroundColor, ...styles.position }" :visibilityHeight="styles.visibilityHeight">
    </a-back-top>
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
    edit: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      editStyle: {
        position: 'static',
      }
    }
  },
};
</script>

<style lang="less" scoped>
.to-the-top .ant-back-top {
  border-radius: 20px;
  /deep/.ant-back-top-content {
    background-color: transparent;
  }
}
</style>