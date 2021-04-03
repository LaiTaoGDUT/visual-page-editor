<template>
  <div class="editor-header">
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240);box-shadow: rgba(100, 100, 100, 0.6) 0px 2px 3px 0px;"
      title=""
      :sub-title="title"
      @back="goBackHome"

    >
      <template slot="backIcon">
        <slot name="backIcon"></slot>
      </template>

      <template slot="extra">
        <slot name="extra"></slot>
      </template>
    </a-page-header>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    goBackHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style lang="less" scoped>
.editor {
  &-header {
    z-index: 3;
    /deep/.ant-page-header {
      padding: 8px 44px 8px 10px;
      &-title {
        font-size: 28px;
      }
    }
  }
}
</style>