<template>
  <div class="loading" v-show="loading" :class="inside ? 'loading-inside' : 'loading-outside'">
    <a-spin
      :spinning="loading"
      size="large"
      tip="加载中......"
      style="color: #41b883"
    >
      <span slot="indicator" style="width: 100%; margin-bottom: 20px"
        >V<a-icon type="sync" spin style="width: 40px" />E</span
      >
    </a-spin>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    inside: {
      type: Boolean,
      default: false,
    }
  },
};
</script>

<style lang="less" scoped>
.loading {
  z-index: 10000;
  background-color: hsla(0, 0%, 100%, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 20%;
}
.loading-outside {
  width: 100vw;
  height: 100vh;
  position: fixed;
}
.loading-inside {
  position: absolute;
  width: 100%;
  height: 100%;

}
</style>