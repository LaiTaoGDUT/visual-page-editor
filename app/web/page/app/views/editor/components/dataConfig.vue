<template>
  <div class="data-config">
    <a-tabs v-model="activeTab" :animated="false">
      <a-tab-pane key="1" tab="页面配置">
        <div class="component-config">
          <div style="margin: 16px 16px">
            <el-switch
              v-model="pageConfigSwitch"
              active-text="样式配置"
              inactive-text="属性配置"
              active-color="#41b883"
              inactive-color="#41b883"
            >
            </el-switch>
          </div>
          <base-info-config v-show="!pageConfigSwitch" :pageId="pageId"></base-info-config>
          <json-editor
            v-show="pageConfigSwitch"
            :schema="styleSchema"
            v-model="styleData"
          ></json-editor>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="组件配置">
        <div v-if="componentDetail" class="component-config">
          <div style="margin: 16px;display: flex;justify-content: center;" class="painter-mode">
            <a-radio-group :value="mode" @change="handleModeChange">
              <a-radio-button value="form"> 表单 </a-radio-button>
              <a-radio-button value="code"> 代码 </a-radio-button>
            </a-radio-group>
          </div>
          <div v-show="mode == 'form'">
            <div style="margin: 16px 16px;display: flex;justify-content: space-between;">
              <el-switch
                v-model="compConfigSwitch"
                active-text="样式配置"
                inactive-text="属性配置"
                active-color="#41b883"
                inactive-color="#41b883"
              >
              </el-switch>
              <a-icon type="fullscreen" style="font-size: 20px;cursor: pointer;" @click="dataConfigDialogVisible = true"/>
            </div>
            <comp-info-config
              v-if="!isPComponent"
              v-show="!compConfigSwitch"
            ></comp-info-config>
            <pcomp-info-config
              v-if="isPComponent"
              v-show="!compConfigSwitch"
            ></pcomp-info-config>
            <json-editor
              v-show="!compConfigSwitch"
              :schema="componentDetail.cSchema"
              v-model="cComponent.data"
            ></json-editor>
            <json-editor
              v-show="compConfigSwitch"
              :schema="componentDetail.cStyleSchema"
              v-model="cComponent.style"
            ></json-editor>
          </div>
          <div v-show="mode == 'code'">
            <div style="margin: 16px 16px;display: flex;justify-content: space-between;">
              <el-switch
                v-model="codeTypeSwitch"
                active-text="组件数据规范"
                inactive-text="组件数据"
                active-color="#41b883"
                inactive-color="#41b883"
              >
              </el-switch>
              <a-icon type="fullscreen" style="font-size: 20px;cursor: pointer;" @click="codeDialogVisible = true"/>
            </div>
            <div id="date-config-code" style="width: 100%; height: 600px"></div>
          </div>
        </div>
        <div v-else style="margin-top: 30px">
          <a-empty>
            <span slot="description"> 暂未选中任何组件 </span>
          </a-empty>
        </div>
      </a-tab-pane>
    </a-tabs>
    <el-dialog title="组件配置" :visible.sync="dataConfigDialogVisible" :fullscreen="true">
      <div v-if="componentDetail" class="component-config">
        <div style="margin: 16px 16px;">
          <el-switch
            v-model="compConfigSwitch"
            active-text="样式配置"
            inactive-text="属性配置"
            active-color="#41b883"
            inactive-color="#41b883"
          >
          </el-switch>
        </div>
        <comp-info-config
          v-if="!isPComponent"
          v-show="!compConfigSwitch"
        ></comp-info-config>
        <pcomp-info-config
          v-if="isPComponent"
          v-show="!compConfigSwitch"
        ></pcomp-info-config>
        <json-editor
          v-show="!compConfigSwitch"
          :schema="componentDetail.cSchema"
          v-model="cComponent.data"
        ></json-editor>
        <json-editor
          v-show="compConfigSwitch"
          :schema="componentDetail.cStyleSchema"
          v-model="cComponent.style"
        ></json-editor>
      </div>
      <div v-else style="margin-top: 30px">
        <a-empty>
          <span slot="description"> 暂未选中任何组件 </span>
        </a-empty>
      </div>
    </el-dialog>
    <el-dialog title="组件配置" :visible.sync="codeDialogVisible" :fullscreen="true">
      <div style="margin: 16px 16px;display: flex;justify-content: space-between;">
        <el-switch
          v-model="codeTypeSwitch"
          active-text="组件数据规范"
          inactive-text="组件数据"
          active-color="#41b883"
          inactive-color="#41b883"
        >
        </el-switch>
      </div>
      <div id="date-config-code-full" style="width: 100%; height: 800px"></div>
    </el-dialog>
  </div>
</template>

<script>
import JsonEditor from "@/components/jsonEditor";
import baseInfoConfig from './baseInfoConfig';
import { mapGetters, mapMutations, mapState } from "vuex";
import PcompInfoConfig from "./pcompInfoConfig.vue";
import compInfoConfig from "./compInfoConfig.vue";
import * as monaco from "monaco-editor";
export default {
  components: {
    JsonEditor,
    PcompInfoConfig,
    baseInfoConfig,
    compInfoConfig
  },
  data() {
    return {
      compConfigSwitch: false,
      pageConfigSwitch: false,
      codeTypeSwitch: false,
      isPComponent: false,
      activeTab: '1',
      dataConfigDialogVisible: false,
      codeDialogVisible: false,
      mode: 'form',
      jsonEditorOptions: {
        language: "json",
        minimap: {
          // 关闭小地图
          enabled: false,
        },
        mouseWheelZoom: true, // 开启 Ctrl + 滚轮 缩放
        lineNumbers: "off",
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        renderIndentGuides: true,
      },
      monacoInstance: null,
      monacoInstanceFull: null,
    };
  },
  props: ["pageId"],
  watch: {
    currentComponent() {
      this.activeTab = '2'
    },
    pCurrentComponent() {
      this.activeTab = '2'
    },
    componentDetail(newVal) {
      if (newVal) {
        if (!this.monacoInstance) {
          let _mode = this.mode;
          this.mode = 'code';
          this.$nextTick(() => {
            this.monacoInstance = monaco.editor.create(
              document.getElementById("date-config-code"),
              {
                value: JSON.stringify(this.showPageData, null, 4),
                ...this.jsonEditorOptions,
                readOnly: true,
              }
            );
            setTimeout(() => {
              this.mode = _mode;
            })
          })
        }
      } else {
        this.monacoInstance = null;
        this.monacoInstanceFull = null;
      }
    },
    codeDialogVisible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          if (!this.monacoInstanceFull) {
            this.monacoInstanceFull = monaco.editor.create(
              document.getElementById("date-config-code-full"),
              {
                value: JSON.stringify(this.showPageData, null, 4),
                ...this.jsonEditorOptions,
                readOnly: true,
              }
            );
          }
        })
      }
    },
    showPageData: {
      handler(newVal) {
        if (!this.monacoInstance) {
          return;
        }
        const model = this.monacoInstance.getModel();
        model.setValue(JSON.stringify(newVal, null, 4));
        if (this.monacoInstanceFull) {
          const modelFull = this.monacoInstanceFull.getModel();
          modelFull.setValue(JSON.stringify(newVal, null, 4));
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapState("compLib", ["pCompLib"]),
    ...mapState("page", [
      "styleData",
      "styleSchema",
    ]),
    ...mapGetters("component", ["currentComponent", "pCurrentComponent"]),
    ...mapGetters("compLib", ["compList"]),
    cComponent() {
      return this.isPComponent ? this.pCurrentComponent : this.currentComponent;
    },
    componentDetail() {
      // 组件正在使用的版本源信息
      if (this.currentComponent) {
        this.isPComponent = false;
        const details = this.compList.find((comp) => {
          return this.currentComponent.id === comp.compId;
        }).details;
        return details.find(
          (detail) => detail.cVersionId === this.currentComponent.versionId
        );
      } else if (this.pCurrentComponent) {
        this.isPComponent = true;
        const details = this.pCompLib.find((comp) => {
          return this.pCurrentComponent.id === comp.compId;
        }).details;
        return details.find(
          (detail) => detail.cVersionId === this.pCurrentComponent.versionId
        );
      }
    },
    showPageData() {
      if (this.componentDetail)  {
        return this.codeTypeSwitch ? {
          dataSchema: this.componentDetail.cSchema,
          styleSchema: this.componentDetail.cStyleSchema,
        } : this.cComponent;
      } else {
        return {};
      }
    },
  },
  methods: {
    handleModeChange(e) {
      this.mode = e.target.value;
    }
  },
};
</script>

<style lang="less" scoped>
.data-config {
  width: 100%;
  background: #ffffff;
}
/deep/.el-switch__label.is-active {
  color:#41b883;
}

/* 修改antd tabs 原生样式 */
/deep/.ant-tabs {
  height: calc(100vh - 50px);
  overflow: auto;
}
/deep/.ant-tabs-bar {
  box-shadow: inset 0 -1px 1px 0 #a0a0a0;
  border-bottom: 1px;
  margin: 0px;
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
/deep/.ant-input-affix-wrapper {
  .ant-input:focus,
  .ant-input:hover {
    border-color: #41b883;
    border-right-width: 1px !important;
    outline: 0;
    box-shadow: 0 0 0 0;
  }
}
</style>