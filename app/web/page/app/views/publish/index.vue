<template>
  <div class="preview">
    <component
      v-for="component in [...components, ...pComponents]"
      :key="component.name"
      :is="component.htmlName + component.versionId"
      :config="component.data"
      :styles="component.style"
      :edit="false"
    >
    </component>
  </div>
</template>

<script>
import { versionDetail } from '@/services/pages';
// 预注册所有需要用到的组件
const context = require.context("COMP", true, /index\.vue$/);
const preComponents = {};
context.keys().forEach((key) => {
  const pathList = key.split("/");
  if (pathList.length > 4) {
    return;
  }
  const versionId = pathList[pathList.length - 2];
  const componentName = pathList[pathList.length - 3];
  preComponents[`${componentName}${versionId}`] = function (resolve) {
    require([`COMP/${componentName}/${versionId}/index.vue`], resolve);
  };
});

export default {
  data() {
    return {
      components: [],
      pComponents: [],
      styleData: {},
    }
  },
  components: {
    ...preComponents,
  },
  async created() {
    const pVersionId = this.$route.params.id;
    if (!pVersionId) {
      this.$router.replace('/not-found');
    }
    const res = await versionDetail(pVersionId);
    if (res.code !== 200) {
      this.$router.replace('/not-found');
    } else if (!res.data.publish) {
      this.$router.replace('/not-found');
    } else {
      this.components = res.data.compData.components;
      this.pComponents = res.data.compData.pComponents;
      document.title = res.data.pDocName;
      this.styleData = res.data.styleData;
    }
  }
};
</script>

<style lang="less" scoped>
</style>