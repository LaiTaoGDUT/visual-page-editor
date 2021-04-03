<template>
  <div class="compLib">
    <a-tabs default-active-key="1" :animated="false">
      <a-tab-pane key="1" tab="组件列表">
        <div class="compLib-search">
          <a-input-search
            placeholder="在当前类别下搜索组件..."
            enter-button
            allow-clear
            @search="filterList"
          />
        </div>

        <div
          class="compLib-types"
          :class="{ 'show-type-select': showTypeSelect }"
        >
          <div
            class="compLib-types__overview"
            @click="switchTypeSelectShow"
            :style="{
              background: showTypeSelect
                ? ' rgba(65, 184, 131, 1)'
                : ' rgba(65, 184, 131, 0.5)',
            }"
          >
            <div>
              <a-icon
                :type="showTypeSelect ? 'backward' : 'forward'"
                style="font-size: 20px"
              />
            </div>
            <div>
              {{ selectCompType }}
            </div>
          </div>
          <div class="compLib-types__select">
            <span :style="{ marginRight: 8 }">选择类别:</span>
            <a-checkable-tag
              :checked="selectCompType === '全部'"
              @change="(checked) => handleTypeSelect('全部', checked)"
            >
              全部
            </a-checkable-tag>
            <template v-for="type in compTypes">
              <a-checkable-tag
                :key="type"
                :checked="selectCompType === type"
                @change="(checked) => handleTypeSelect(type, checked)"
              >
                {{ type }}
              </a-checkable-tag>
            </template>
          </div>
        </div>
        <div class="compLib-list">
          <comp-lib-item
            v-for="component in showComponentsInfo"
            :key="component.compId"
            :component="component"
            :class="{ 'is-active' : activeComp == component.compId }"
            @dblclick.native="$emit('addComponent', component.compId)"
            @click.native="activeComp=component.compId"
          ></comp-lib-item>
          <a-empty
            v-show="showComponentsInfo.length <= 0"
            style="margin: 0 auto"
          >
            <span slot="description">
              当前类别下暂无目标组件
              <span></span>
            </span>
            <a-button
              type="primary"
              @click="showTypeSelect = true"
              style="background: #41b883; border-color: #41b883"
            >
              换个分类
            </a-button>
          </a-empty>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="自定位组件">
        <div class="compLib-search" :style=" { 'margin-left': '10px' }">
          <a-input-search
            placeholder="在当前类别下搜索组件..."
            enter-button
            allow-clear
            @search="pFilterList"
          />
        </div>
        <div class="compLib-pList">
          <comp-lib-item
            v-for="component in pShowComponentsInfo"
            :key="component.compId"
            :component="component"
            :class="{ 'is-active' : activePComp == component.compId }"
            @click.native="activePComp=component.compId"
            @dblclick.native="$emit('pAddComponent', component.compId)"
          ></comp-lib-item>
          <a-empty
            v-show="pShowComponentsInfo.length <= 0"
            style="margin: 0 auto"
          >
            <span slot="description">
              当前类别下暂无目标组件
              <span></span>
            </span>
          </a-empty>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="模板列表">
        <template-lib :pageId="pageId"></template-lib>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import compLibItem from "./compLibItem";
import templateLib from './templateLib';

export default {
  data() {
    return {
      selectCompType: "全部", // 选择的组件类型列表
      showTypeSelect: false, // 是否展开类型选择
      filterKey: "", // 过滤的组件关键字
      pFilterKey: "", // 过滤的自定位组件关键字
      activeComp: null,
      activePComp: null,
    };
  },
  components: {
    compLibItem,
    templateLib
  },
  props: {
    componentsInfo: {
      type: Object,
      default() {
        return {};
      },
    },
    compTypes: {
      type: Array,
      default() {
        return [];
      },
    },
    compList: {
      type: Array,
      default() {
        return [];
      },
    },
    pCompList: {
      type: Array,
      default() {
        return [];
      },
    },
    pageId: {
      type: String,
    }
  },
  computed: {
    showComponentsInfo() {
      const list = [];
      if (this.selectCompType === "全部") {
        list.push(...this.compList);
      } else {
        list.push(...this.componentsInfo[this.selectCompType]);
      }
      return list.filter((item) => {
        return (
          item.cName.includes(this.filterKey) ||
          item.cDesc.includes(this.filterKey)
        );
      });
    },
    pShowComponentsInfo() {
      return this.pCompList.filter((item) => {
        return (
          item.cName.includes(this.pFilterKey) ||
          item.cDesc.includes(this.pFilterKey)
        );
      });
    }
  },
  methods: {
    filterList(key) {
      this.filterKey = key;
    },
    pFilterList(key) {
      this.pFilterKey = key;
    },
    switchTypeSelectShow() {
      this.showTypeSelect = !this.showTypeSelect;
    },
    handleTypeSelect(type, checked) {
      if (!checked) {
        return;
      }
      this.selectCompType = type;
      this.showTypeSelect = false;
    },
  },
};
</script>

<style lang="less" scoped>
.compLib {
  width: 100%;
  background: #ffffff;
  &-search {
    margin: 0 10px 20px 50px;
    box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.27);
    /deep/.ant-input-search {
      &-button {
        background-color: #41b883 !important;
        border-color: #41b883 !important;
      }
      .ant-input:focus,
      .ant-input:hover {
        border-color: #41b883;
        border-right-width: 1px !important;
        outline: 0;
        box-shadow: 0 0 0 0;
      }
    }
  }
  &-types {
    position: fixed;
    top: 94px;
    left: 0px;
    z-index: 1000;
    transform: translateX(-290px);
    transition: all 0.3s ease;
    cursor: pointer;
    &__overview {
      position: absolute;
      right: -40px;
      width: 40px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      border-top-right-radius: 17px;
      border-bottom-right-radius: 17px;
      clip-path: polygon(0 0, 100% 15%, 100% 80%, 0 100%);
      box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.27);
      padding: 17px 0;
      &:hover {
        background: rgba(65, 184, 131, 1) !important;
        i {
          animation-name: hover-zoom;
          animation-duration: 1s;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
      }
    }
    &__select {
      width: 290px;
      min-height: 300px;
      background: #ffffff;
      padding: 30px 10px;
      font-size: 16px;
      border: 1px solid #a0a0a0;
      box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.27);
      /deep/.ant-tag-checkable {
        font-size: 16px;
        &-checked {
          background: #41b883;
        }
        &:not(.ant-tag-checkable-checked):hover {
          color: #41b883;
        }
        &:not(.ant-tag-checkable-checked):active {
          background: #ffffff;
          color: #41b883;
        }
      }
    }
  }
  .show-type-select {
    transform: translateX(0px);
  }
  .is-active {
    background: rgba(65, 184, 131, .1);
    border-color: #41b883;
  }
}

/* 修改antd tabs 原生样式 */
/* 修改antd tabs 原生样式 */
/deep/.ant-tabs {
  height: calc(100vh - 50px);
  overflow: auto;
}
/deep/.ant-tabs-bar {
  box-shadow: inset 0 -1px 1px 0 #a0a0a0;
  border-bottom: 1px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 2;
  .ant-tabs-tab {
    margin-right: 0px;
    &:hover {
      color: #41b883;
    }
    &-active {
      color: #ffffff;
      background: #41b883;
      &:hover {
        color: #ffffff;
      }
    }
  }

  .ant-tabs-ink-bar {
    display: none !important;
  }
}

@keyframes hover-zoom {
  25% {
    transform: translateX(3px);
  }
  50% {
    transform: translateX(0px);
  }
  75% {
    transform: translateX(-3px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>