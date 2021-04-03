<template>
  <div class="painter">
    <div class="painter-canvas">
      <div
        class="painter-canvas-inner"
        style="width: 100%; min-height: 100%; position: relative"
      >
        <div>
          <v-pcomp-wrapper
            v-for="(component, index) in pComponents"
            :key="component.name"
            :component="component"
            :index="index"
            :selected="pComponentIndex === index"
            @setCurrentComponent="pSetCurrentComponent"
          >
            <component
              :is="component.htmlName + component.versionId"
              :config="component.data"
              :styles="component.style"
              :edit="true"
            >
            </component>
          </v-pcomp-wrapper>
        </div>
        <v-comp-wrapper
          v-for="(component, index) in components"
          :key="component.name"
          :component="component"
          :index="index"
          :selected="currentComponentIndex === index"
          @setCurrentComponent="setCurrentComponent"
        >
          <component
            :is="component.htmlName + component.versionId"
            :config="component.data"
            :styles="component.style"
          >
          </component>
        </v-comp-wrapper>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import compWrapper from "./compWrapper.vue";
import pCompWrapper from "./pCompWrapper.vue";
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
  components: {
    vCompWrapper: compWrapper,
    vPcompWrapper: pCompWrapper,
    ...preComponents,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState("component", [
      "components",
      "currentComponentIndex",
      "pComponents",
      "pComponentIndex",
    ]),
  },
  mounted() {},
  watch: {},
  methods: {
    ...mapMutations("component", [
      "selectComponent",
      "changeComponentIndex",
      "pSelectComponent",
    ]),
    setCurrentComponent(index) {
      this.selectComponent(index);
    },
    pSetCurrentComponent(index) {
      this.pSelectComponent(index);
    },
    changeCompName(evt) {
      const newName = evt.target.innerHTML.toString().replaceAll("&nbsp;", "");
    },
    upComponent(index) {
      if (index <= 0) {
        return;
      }
      this.changeComponentIndex({ oldIndex: index, newIndex: index - 1 });
      this.selectComponent(index - 1);
    },
    downComponent(index) {
      if (index >= this.components.length - 1) {
        return;
      }
      this.changeComponentIndex({ oldIndex: index, newIndex: index + 1 });
      this.selectComponent(index + 1);
    },
  },
};
</script>

<style lang="less">
.painter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  &-canvas {
    background: #ffffff;
    width: 375px;
    height: 812px;
    margin: 0 auto;
    // padding-right: 8px;
    overflow-y: overlay;
    position: relative;
    overflow-x: hidden;
    box-sizing: content-box;
    box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.5);
.comp-item {
  margin: 5px 10px 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  position: relative;
  box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.27);
  background: #f6f7fb;
  border: 1px solid #ddd;
  cursor: pointer;
  &__avator {
    padding: 10px;
    background: transparent;
    .el-image {
      width: 120px;
      height: 100%;
      max-height: 100%;
      object-fit: contain;
      -o-object-position: center center;
      object-position: center center;
      border-radius: 5px;
    }
  }
  &__content {
    padding: 10px;
    margin: 0;
    width: 0;
    font-size: 12px;
    flex-grow: 1;
    align-self: flex-start;
  }
  &__title {
    font-size: 14px;
  }
  &__desc {
    color: #666;
  }
  &:hover {
      background: rgba(65, 184, 131, .1);
      border-color: #41b883;
  }
}
  }
}
</style>