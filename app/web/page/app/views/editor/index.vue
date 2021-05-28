<template>
  <div class="editor">
    <loading :loading="loading"></loading>
    <publish-drawer v-model="publishDrawerVisible" :pageId="pageId" @openPreview="previewPage"></publish-drawer>
    <previewDialog v-model="previewVisible" :src="previewSrc" :title="previewTitle"></previewDialog>
    <historyDialog v-model="historyVisible" title="历史保存记录" :pageId="pageId" @openPreview="previewPage"></historyDialog>
    <editor-header :title="pageName">
      <template  v-slot:backIcon >
        <a-icon type="left" class="editor-header__btn" />
      </template>
      <template v-slot:extra>
        <div class="editor-header-menu">
          <a-button icon="history" class="editor-header-menu__item" @click="historyVisible = true" type="link">
            历史记录
          </a-button>
          <a-button icon="eye" class="editor-header-menu__item" @click="previewPage(pageId, 'page')" type="link">
            预览
          </a-button>
          <a-button :disabled="(!baseInfoModifyFlag && !componentDataModifyFlag) || dataSaving" :icon="dataSaving ? 'loading' : 'save'" class="editor-header-menu__item" @click="saveData" type="link">
            保存
          </a-button>
          <a-button icon="cloud-upload" class="editor-header-menu__item" @click="publishDrawerVisible = true" type="link">
            发布
          </a-button>
        </div>
      </template>
    </editor-header>
    <div class="editor-main">
      <div class="editor-column" style="width: 23%">
        <comp-lib
          :componentsInfo="compLib"
          :pCompList="pCompLib"
          :compTypes="compTypes"
          :pageId="pageId"
          :compList="compList"
          @addComponent="addComponent"
          @pAddComponent="pAddComponent"
        ></comp-lib>
      </div>
      <div class="editor-resize"></div>
      <div class="editor-column" style="flex: 1 1 0%">
        <painter :pageId="pageId"></painter>
      </div>
      <div class="editor-resize"></div>
      <div class="editor-column" style="width: 27%">
        <data-config :pageId="pageId"></data-config>
      </div>
    </div>
  </div>
</template>

<script>
import compLib from "./components/compLib.vue";
import painter from "./components/painter.vue";
import dataConfig from "./components/dataConfig.vue";
import editorHeader  from "./components/editorHeader";
import publishDrawer from './components/publishDrawer';
import loading from "@/components/loading";
import previewDialog from './components/previewDialog';
import historyDialog from './components/historyDialog';
import { getCompDetail } from "@/services/components";
import { getPageDetail, saveCompData, saveBaseInfo, savePage } from "@/services/pages";
import { mapState, mapGetters, mapMutations } from "vuex";
import Sortable from "sortablejs";
import pageShoot from '@/mixins/pageShoot';

export default {
  components: {
    compLib,
    painter,
    dataConfig,
    loading,
    editorHeader,
    publishDrawer,
    previewDialog,
    historyDialog
  },
  mixins: [pageShoot],
  data() {
    return {
      loading: false,
      pageId: '',
      dataSaving: false,
      publishDrawerVisible: false,
      previewVisible: false,
      previewSrc: '',
      previewTitle: '',
      historyVisible: false,
    };
  },
  created() {
    this.initDragable();
  },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      vm.loading = true;
      //初始化
      vm.selectComponent(-1);
      vm.pSelectComponent(-1);
      console.log(JSON.stringify({
  type: 'object',
  title: '底部导航栏',
  properties: {
    position: {
      type: 'object',
      title: '定位',
      description: '',
      format: 'position',
      properties: {
        zIndex: {
          title: '堆叠层级',
          description: '自定位组件在当前堆叠上下文中的堆叠层级，当自定位组件之间重叠的时候， zIndex 较大的元素会覆盖较小的元素在上层进行显示，设置为负数时将被普通组件遮盖',
          type: 'number'
        },
        position: {
          title: '定位方式',
          description: '指定自定位组件在文档中的定位方式，fixed：相对于窗口定位，absolute：相对于文档定位',
          type: 'string',
          enum: ['fixed', 'absolute'],
          disabled: true
        }
      }
    },
    normalColor: {
      type: 'string',
      title: '菜单项颜色',
      description: '设置菜单项的颜色',
      format: 'color'
    },
    selectColor: {
      type: 'string',
      title: '菜单项选中颜色',
      description: '设置选中菜单项的颜色',
      format: 'color'
    },
    backgroundColor: {
      title: '背景颜色',
      description: '设置导航栏的背景颜色，会被轮播图覆盖',
      type: 'string',
      format: 'color',
    },
    fontSize: {
      title: '字体大小',
      description: '设置菜单项的字体大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    },
    iconSize: {
      title: '图标大小',
      description: '设置菜单项图标的大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    },
    paddingTop: {
      title: '上边距',
      description: '设置导航栏主体与组件上边界的距离，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 0,
      maximum: 300,
    },
    paddingBottom: {
      title: '下边距',
      description: '设置导航栏主体与组件下边界的距离，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 0,
      maximum: 300,
    },
  }
}))
      vm.pageId = to.query.id;
      const res = await getPageDetail(vm.pageId);
      if (res.code === 200) {
        vm.setPageName(res.data.pName);
        vm.setPageDocName(res.data.pDocName);
        vm.setPageStyleData(res.data.styleData);
        const compData = res.data.compData;
        await vm.betchDetails(compData);
        vm.setComponents(compData.components);
        vm.pSetComponents(compData.pComponents);
        vm.setBaseInfoModifyFlag(false);
        vm.setComponentDataModifyFlag(false);
        vm.inited = false;
        setTimeout(() => {
          vm.inited = true;
        })
      } else {
        this.$router.go(-1);
      }
      vm.loading = false;
    })
  },
  mounted() {},
  computed: {
    ...mapState("component", ["components", "pComponents"]),
    ...mapState("compLib", ["compLib", "pCompLib"]),
    ...mapState('page', ['pageName', 'pageDocName', 'styleData', 'baseInfoModifyFlag', 'componentDataModifyFlag']),
    ...mapGetters("compLib", ["compList"]),
    compTypes() {
      // 所有组件类型列表
      return Object.keys(this.compLib);
    },
  },
  watch: {
    pageName() {
      if (this.inited) {
        this.setBaseInfoModifyFlag(true);
      }
    },
    pageDocName() {
      if (this.inited) {
        this.setBaseInfoModifyFlag(true);
      }
    },
    components: {
      handler() {
        if (this.inited) {
          this.setComponentDataModifyFlag(true);
        }
      },
      deep: true
    },
    pComponents: {
      handler() {
        if (this.inited) {
          this.setComponentDataModifyFlag(true);
        }
      },
      deep: true
    },
    styleData: {
      handler() {
        if (this.inited) {
          this.setComponentDataModifyFlag(true);
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations("component", [
      "insert",
      "selectComponent",
      "changeComponentIndex",
      "pSelectComponent",
      "pInsert",
      "setComponents",
      "pSetComponents"
    ]),
    ...mapMutations('page', ['setPageName', 'setPageDocName', "setPageStyleData", "setBaseInfoModifyFlag", "setComponentDataModifyFlag"]),
    // 初始化拖拽api
    initDragable() {
      // 组件拖拽实现
      this.$nextTick(() => {
        Sortable.create(document.querySelector(".compLib-list"), {
          group: {
            name: "compLib-list",
            pull: "clone",
          },
          sort: false,
        });
        Sortable.create(document.querySelector(".painter-canvas-inner"), {
          group: {
            name: "painter-canvas",
            put: "compLib-list",
            pull: false,
          },
          sort: true,
          filter: ".not-selected",
          onAdd: (evt) => {
            // 还原 sortablejs 的 DOM 操作, 转而直接操作 viewModel 数据
            const insertComponentId = parseInt(
              evt.item.getAttribute("data-component-id")
            );
            const insertComponentIndex = evt.newIndex - 1;
            const clonedElement = evt.from.children[evt.oldIndex];

            evt.from.insertBefore(evt.item, clonedElement);
            evt.from.removeChild(clonedElement);
            this.addComponent(insertComponentId, insertComponentIndex);
          },
          onUpdate: (evt) => {
            this.changeComponentIndex({
              oldIndex: evt.oldIndex - 1,
              newIndex: evt.newIndex - 1,
            });
            this.selectComponent(evt.newIndex - 1);
          },
        });
      });
    },
    // 添加普通组件
    async addComponent(compId, insertIndex = this.components.length) {
      const componentInfo = this.compList.find((comp) => {
        return comp.compId === compId;
      });
      let compDetailList;
      if (!componentInfo.details) {
        compDetailList = await this.getCompDetail(compId);
        if (compDetailList.length <= 0) return;
        componentInfo.details = compDetailList;
      } else {
        compDetailList = componentInfo.details;
      }
      // 寻找正在使用的版本
      const curVersionDetail = compDetailList.find(
        (detail) => detail.defaultUse
      );
      let nickName = componentInfo.cName + "_"; // 组件昵称
      for (let i = this.components.length; ; i++) {
        if (
          this.components.every((component) => component.name !== nickName + i)
        ) {
          // 检测重名
          nickName = nickName + i;
          break;
        }
      }
      this.insert({
        index: insertIndex,
        component: {
          id: componentInfo.compId,
          htmlName: componentInfo.cHtmlName,
          name: nickName,
          data: JSON.parse(JSON.stringify(curVersionDetail.defaultData)),
          style: JSON.parse(JSON.stringify(curVersionDetail.defaultStyle)),
          versionId: curVersionDetail.cVersionId,
        },
      });
      this.selectComponent(insertIndex);
    },
    async pAddComponent(compId) {
      const componentInfo = this.pCompLib.find((comp) => {
        return comp.compId === compId;
      });
      let compDetailList;
      if (!componentInfo.details) {
        compDetailList = await this.getCompDetail(compId);
        if (compDetailList.length <= 0) return;
        componentInfo.details = compDetailList;
      } else {
        compDetailList = componentInfo.details;
      }
      const curVersionDetail = compDetailList.find(
        (detail) => detail.defaultUse
      );
      let nickName = componentInfo.cName + "_"; // 组件昵称
      for (let i = this.pComponents.length; ; i++) {
        if (
          this.pComponents.every((component) => component.name !== nickName + i)
        ) {
          // 检测重名
          nickName = nickName + i;
          break;
        }
      }
      this.pInsert({
        id: componentInfo.compId,
        htmlName: componentInfo.cHtmlName,
        name: nickName,
        data: JSON.parse(JSON.stringify(curVersionDetail.defaultData)),
        style: JSON.parse(JSON.stringify(curVersionDetail.defaultStyle)),
        versionId: curVersionDetail.cVersionId,
      });
      this.pSelectComponent(this.pComponents.length - 1);
    },

    // 获取组件详细信息
    async getCompDetail(id) {
      try {
        const res = await getCompDetail({ id });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        this.$message.error("添加组件失败了，请重试");
        return false;
      }
    },
    // 批量获取组件的详细信息
    async betchDetails(compData) {
      const compArr = compData.components;
      const pCompArr = compData.pComponents;
      for (let comp of compArr) {
        const componentInfo = this.compList.find((_comp) => {
          return _comp.compId === comp.id;
        });
        if (!componentInfo.details) {
          const compDetailList = await this.getCompDetail(comp.id);
          if (compDetailList.length <= 0) return;
          componentInfo.details = compDetailList;
        }
      }
      for (let pComp of pCompArr) {
        const componentInfo = this.pCompLib.find((_comp) => {
          return _comp.compId === pComp.id;
        });
        if (!componentInfo.details) {
          const compDetailList = await this.getCompDetail(pComp.id);
          if (compDetailList.length <= 0) return;
          componentInfo.details = compDetailList;
        }
      }
    },

    // 保存
    async saveData() {
      this.dataSaving = true;
      this.selectComponent(-1);
      this.pSelectComponent(-1);
      await setTimeout(() => {}, 10);
      let res = null;
      if (this.componentDataModifyFlag && this.baseInfoModifyFlag) {
        const shoot = await this.genShoot();
        res = await savePage({
          pageId: this.pageId,
          saveType: 1,
          compData: { components: this.components, pComponents: this.pComponents },
          styleData: this.styleData,
          shoot,
          pageName: this.pageName,
          pageDocName: this.pageDocName,
        })
      } else if (this.componentDataModifyFlag) {
        const shoot = await this.genShoot();
        res = await saveCompData(this.pageId, { components: this.components, pComponents: this.pComponents }, this.styleData, shoot);
      } else if (this.baseInfoModifyFlag) {
        res = await saveBaseInfo(this.pageId, this.pageName, this.pageDocName);
      } else {
        this.dataSaving = false;
        return true;
      }
      if (res.code === 200) {
        this.$message.success('保存成功！');
        this.setBaseInfoModifyFlag(false);
        this.setComponentDataModifyFlag(false);
        this.dataSaving = false;
        return true;
      }
      this.dataSaving = false;
      return false;
    },

    async previewPage(id, type) {
      this.previewVisible = true;
      if (type == 'page') {
        const flag = await this.saveData();
        if (!flag) return;
        this.previewVisible = true;
        this.previewSrc = `/preview?pageId=${id}`;
        this.previewTitle = '';
      } else if (type == 'pageVersion'){
        this.previewSrc = `/preview?pVersionId=${id}`;
        this.previewTitle = '页面版本预览'
      } else {
        this.previewSrc = `/preview?pHistoryId=${id}`;
        this.previewTitle = '页面历史更改预览'
      }
    }
  },
};
</script>

<style lang="less" scoped>
.editor {
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
  display: flex;
  flex-direction: column;
  /deep/&-header {
    &-menu {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      display: flex;
      &__item {
        height: 100%;
        font-size: 12px;
        padding: 0 14px;
        border-radius: 0px;
        color: rgb(91, 107, 115);
        flex-direction: column;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 76px;
        &[disabled] {
          color: rgba(0,0,0,.25) !important;
          background-color: #f5f5f5;
        }
        &:hover {
          color: #41b883;
          background: rgb(242, 242, 242);
        }
        i {
          font-size: 20px;
          margin-bottom: 2px;
        }
        span {
          margin: 0;
        }
      }
    }
    &__btn {
      &:hover {
        color: #41b883;
      }
    }
  }
  &-main {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    background-color: #f6f7fb;
  }

  &-column {
    display: flex;
  }

  &-resize {
    width: 4px;
    cursor: col-resize;
    background-color: #cccccc;
    box-shadow: inset -4px 0 6px -5px #000, inset 4px 0 6px -5px #a0a0a0;
    &-active {
      background-color: #41b883;
    }
  }
}

/deep/.el-dialog {
  margin: 0 auto;
}
</style>
