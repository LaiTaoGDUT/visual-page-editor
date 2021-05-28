<template>
  <div class="preview" :style="styleData" style="position: relative">
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
import { getPageDetail, versionDetail } from '@/services/pages';
import { getPageHistoryDetail } from "@/services/pHistory";
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
    const query = this.$route.query;
    if (query.pageId && query.pVersionId) {
      this.$router.replace('/not-found');
    }
    if (query.pageId) {
      const res = await getPageDetail(query.pageId);
      if (res.code !== 200) {
        this.$router.replace('/not-found');
      } else {
        this.components = res.data.compData.components;
        this.pComponents = res.data.compData.pComponents;
        document.title = res.data.pDocName;
        this.styleData = res.data.styleData;
      }
    }
    if (query.pVersionId) {
      const res = await versionDetail(query.pVersionId);
      if (res.code !== 200) {
        this.$router.replace('/not-found');
      } else {
        this.components = res.data.compData.components;
        this.pComponents = res.data.compData.pComponents;
        document.title = res.data.pDocName;
        this.styleData = res.data.styleData;
      }
    }
    if (query.pHistoryId) {
      const res = await getPageHistoryDetail(query.pHistoryId);
      if (res.code !== 200) {
        this.$router.replace('/not-found');
      } else {
        this.components = res.data.pCompData.components;
        this.pComponents = res.data.pCompData.pComponents;
        document.title = res.data.pDocName;
        this.styleData = res.data.pStyleData;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.preview {
  min-width: 100vw;
  min-height: 100vh;
}
</style>