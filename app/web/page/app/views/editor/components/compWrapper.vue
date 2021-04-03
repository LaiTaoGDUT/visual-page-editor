<template>
  <div
    :class="{
      selected: selected,
      'not-selected': !selected,
    }"
    class="comp-wrapper"
    @click.capture="setCurrentComponent(index)"
  >
    <div @click.capture.stop>
      <!-- 在这里插入组件 -->
      <slot></slot>
    </div>
    <div class="comp-wrapper-menu" v-show="selected">
      <a-tooltip v-show="!nameEditShow">
        <template slot="title"> 重命名 </template>
        <div
          class="comp-wrapper__name"
          @click.capture.stop="showNameEdit(true)"
        >
          {{ component.name }}
        </div>
      </a-tooltip>
      <div class="comp-wrapper__rename" v-show="nameEditShow">
        <a-input
          v-model="newNameCache"
          @pressEnter="saveNameChange"
          @click.capture.stop="showNameEdit(true)"
        />
        <a-tooltip>
          <template slot="title"> 保存 </template>
          <a-icon
            type="save"
            theme="filled"
            class="comp-wrapper-btd"
            @click="saveNameChange"
            :class="{ 'config-disable': newNameCache === component.name }"
          />
        </a-tooltip>
        <a-tooltip>
          <template slot="title"> 取消 </template>
          <a-icon
            type="close-square"
            theme="filled"
            class="comp-wrapper-btd"
            @click="showNameEdit(false)"
          />
        </a-tooltip>
      </div>
      <div class="comp-wrapper__config">
        <a-tooltip>
          <template slot="title">
            组件上移{{ index === 0 ? "：不可用" : "" }}</template
          >
          <a-icon
            type="up-square"
            theme="filled"
            class="comp-wrapper-btd"
            :class="{ 'config-disable': index === 0 }"
            @click="upComponent(index)"
          />
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            组件下移{{
              index === components.length - 1 ? "：不可用" : ""
            }}</template
          >
          <a-icon
            type="down-square"
            theme="filled"
            class="comp-wrapper-btd"
            :class="{ 'config-disable': index === components.length - 1 }"
            @click="downComponent(index)"
          />
        </a-tooltip>
        <a-tooltip>
          <template slot="title"> 锁定组件 </template>
          <a-icon type="lock" theme="filled" class="comp-wrapper-btd" />
        </a-tooltip>
        <a-tooltip>
          <template slot="title"> 删除组件 </template>
          <a-icon
            type="delete"
            theme="filled"
            class="comp-wrapper-btd"
            @click="handleComponentDelete"
          />
        </a-tooltip>
      </div>
      <div class="comp-wrapper__vselect" v-if="componentInfo.details">
        版本：
        <a-tooltip>
          <template slot="title"> 切换版本 </template>
          <a-select
            size="small"
            v-model="curVersionId"
            @change="handleVersionChange"
          >
            <a-select-option
              v-for="detail in componentInfo.details"
              :key="detail.cVersionId"
              :disabled="detail.cVersionId === component.versionId"
            >
              {{ detail.cVersionName }}
            </a-select-option>
          </a-select>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

export default {
  data() {
    return {
      nameEditShow: false, // 显示组件昵称编辑框?
      newNameCache: this.component.name, // 缓存新昵称
      curVersionId: this.component.versionId,
    };
  },
  props: {
    component: {
      type: Object,
      default() {
        return {};
      },
    },
    index: {
      type: Number,
      default: 0,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState("component", ["components"]),
    ...mapGetters("compLib", ["compList"]),
    componentInfo() {
      // 组件源信息
      return this.compList.find((comp) => {
        return this.component.id === comp.compId;
      });
    },
  },
  mounted() {
    document.addEventListener(
      "click",
      () => {
        this.showNameEdit(false);
      },
      true
    );
  },
  methods: {
    ...mapMutations("component", [
      "selectComponent",
      "changeComponentIndex",
      "changeComponentName",
      "changeComponentVersion",
      "deleteComponent",
    ]),
    setCurrentComponent(index) {
      this.$emit("setCurrentComponent", index);
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
    showNameEdit(flag) {
      this.newNameCache = this.component.name;
      this.nameEditShow = flag;
    },
    saveNameChange() {
      this.showNameEdit(true);
      if (this.newNameCache !== this.component.name) {
        const flag = this.components.every(
          (component) => component.name !== this.newNameCache
        ); // 检测重名
        if (flag) {
          this.changeComponentName({
            index: this.index,
            newName: this.newNameCache,
          });
          this.showNameEdit(false);
        } else {
          this.$message.info("此名字与其它组件重复，请修改后重试");
        }
      }
    },
    handleVersionChange() {
      if (this.curVersionId !== this.component.versionId) {
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
              self.curVersionId = self.component.versionId;
              resolve();
            });
          },
        });
      }
    },
    handleComponentDelete() {
      const self = this;
      this.$confirm({
        title: "是否删除该组件？",
        content: "可通过撤销操作恢复",
        onOk() {
          return new Promise((resolve, reject) => {
            self.deleteComponent({
              index: self.index,
            });
            self.$message.success("删除组件成功");
            resolve();
          });
        },
        onCancel() {
          return new Promise((resolve, reject) => {
            resolve();
          });
        },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.selected {
  .comp-wrapper-menu {
    border: 2px solid #41b883;
  }
}

.comp-wrapper {
  // border: 2px solid transparent;
  position: relative;
  min-height: 58px;

  &-menu {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    border: 2px solid transparent;
    z-index: 11;
  }
  &__name {
    position: absolute;
    top: 0;
    background: #60bb92;
    color: #ffffff;
    padding: 2px 20px 2px 5px;
    clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
    cursor: pointer;
  }
  &__rename {
    position: absolute;
    top: 0;
    background: #41b883;
    color: #ffffff;
    width: 100%;
    z-index: 1;
    display: flex;
    padding: 3px;
    align-items: center;
    /deep/.ant-input {
      padding: 2px 11px;
      height: 100%;
    }
  }
  &__config {
    position: absolute;
    top: 0;
    right: 0;
    background: #41b883;
    color: #ffffff;
    font-size: 16px;
    padding: 5px 5px 5px 20px;
    clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
    display: flex;
  }
  &__vselect {
    position: absolute;
    bottom: 0;
    padding: 2px 20px 2px 5px;
    clip-path: polygon(0 0, 90% 0, 100% 100%, 0 100%);
    background: #41b883;
    color: #ffffff;
    /deep/.ant-select {
      background: #41b883;
      color: #ffffff;
      .ant-select-selection {
        background: #41b883;
        border-color: #d9d9d9 !important;
        .ant-select-arrow {
          color: #ffffff;
        }
      }
    }
  }
  &-btd {
    color: #ffffff;
    font-size: 16px;
    display: block;
    padding: 0px 4px;
    cursor: pointer;
  }
  .config-disable {
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }
}
</style>