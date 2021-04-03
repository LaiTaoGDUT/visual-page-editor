<template>
  <div class="pcomp-base-info">
    <a-form layout="horizontal">
      <div class="json-editor__item">
        <common-title title="组件昵称"></common-title>
        <div class="pcomp-base-info__rename">
          <a-input v-model="newNameCache" />
          <a-tooltip>
            <template slot="title"> 保存 </template>
            <a-icon
              type="save"
              theme="filled"
              class="comp-wrapper-btd"
              @click="saveNameChange"
              :class="{ 'config-disable': newNameCache === currentComponent.name }"
            />
          </a-tooltip>
        </div>
      </div>
      <div class="json-editor__item">
        <common-title title="组件版本"></common-title>
        <a-select v-model="curVersionId" @change="handleVersionChange">
          <a-select-option
            v-for="detail in componentInfo.details"
            :key="detail.cVersionId"
            :disabled="detail.cVersionId === currentComponent.versionId"
          >
            {{ detail.cVersionName }}
          </a-select-option>
        </a-select>
      </div>
    </a-form>
  </div>
</template>

<script>
import commonTitle from "@/components/jsonEditor/commonTitle";
import { mapState, mapGetters, mapMutations } from "vuex";
export default {
  components: {
    commonTitle,
  },
  data() {
    return {
      curVersionId: null,
      newNameCache: null,
    };
  },
  computed: {
    ...mapState("component", ["components", "componentIndex"]),
    ...mapGetters("component", ["currentComponent"]),
    ...mapGetters("compLib", ["compList"]),
    componentInfo() {
      // 组件源信息
      return this.compList.find((comp) => {
        return this.currentComponent.id === comp.compId;
      });
    }
  },
  created() {
    this.newNameCache = this.currentComponent.name;
  },
  watch: {
    currentComponent: {
      handler: function () {
        this.curVersionId = this.currentComponent.versionId;
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations("component", [
      "changeComponentName",
      "changeComponentVersion",
    ]),
    handleVersionChange() {
      if (this.curVersionId !== this.currentComponent.versionId) {
        const self = this;
        this.$confirm({
          title: `是否切换为版本${this.curVersionId}`,
          content: "不同版本数据可能不共通，是否继续",
          onOk() {
            return new Promise((resolve, reject) => {
              self.changeComponentVersion({
                index: this.index,
                versionId: this.curVersionId,
              });
              self.$message.success("切换版本成功");
              resolve();
            });
          },
          onCancel() {
            return new Promise((resolve, reject) => {
              self.curVersionId = self.currentComponent.versionId;
              resolve();
            });
          },
        });
      }
    },
    saveNameChange() {
      if (this.newNameCache !== this.currentComponent.name) {
        const flag = this.components.every(
          (component) => component.name !== this.newNameCache
        ); // 检测重名
        if (flag) {
          this.changeComponentName({
            index: this.componentIndex,
            newName: this.newNameCache,
          });
        } else {
          this.$message.info("此名字与其它组件重复，请修改后重试");
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.pcomp-base-info {
  .json-editor__item {
    margin-top: 1px;
    padding: 16px 16px;
    cursor: pointer;
    &:hover {
      background-color: rgb(245, 245, 245);
    }
  }
  &__rename {
    display: flex;
    align-items: center;

    .comp-wrapper-btd {
      font-size: 24px;
      color: #000000;
      padding-left: 8px;
      cursor: pointer;
    }
  }

  .config-disable {
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }
}

</style>