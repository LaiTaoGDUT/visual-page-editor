<template>
  <div class="editor-item__title">
    {{ title }}
  <a-tooltip v-if="desc">
    <template slot="title">
      <div v-html="desc"></div>
    </template>
    <a-icon type="question-circle" theme="filled" style="font-size: 14px;color:rgba(0, 0, 0, 0.5);transform: translateY(1px);"/>
  </a-tooltip>
    
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    }
  },
};
</script>

<style lang="less" scoped>
.editor-item__title {
  font-size: 14px;
  padding-left: 3px;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
  span {
    font-size: 12px;
  }
}
</style>