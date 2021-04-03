<template>
  <div
    :class="{
      selected: selected,
    }"
    class="pcomp-wrapper not-seleccted"
    :style="_styleProxy"
    @click.capture="setCurrentComponent(index)"
    :ref="component.name"
    :data-component-name="component.name"
    ondragstart="return false;"
  >
    <div @click.capture.stop>
      <!-- 在这里插入组件 -->
      <slot></slot>
    </div>
    <div class="pcomp-wrapper-mask"></div>
    <div class="pcomp-wrapper-menu" v-show="selected">
      <div class="pcomp-wrapper__config" :style="menuStyle">
        <a-tooltip>
          <template slot="title"> 锁定组件 </template>
          <a-icon type="lock" theme="filled" class="pcomp-wrapper-btd" @click="component.style.position.targeting = 'fixed'"/>
        </a-tooltip>
        <a-tooltip>
          <template slot="title"> 删除组件 </template>
          <a-icon
            type="delete"
            theme="filled"
            class="pcomp-wrapper-btd"
            @click="handleComponentDelete"
          />
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
const toPx = (num, ra) => {
  if (num >= 0) {
    return Number((num * ra).toFixed(0));
  } else {
    return 0;
  }
};
const toVw = (num) => {
  if (num >= 0) {
    return Number((num / 3.75).toFixed(2));
  } else {
    return 0;
  }
};

const toVh = (num) => {
  if (num >= 0) {
    return Number((num / 8.12).toFixed(2));
  } else {
    return 0;
  }
};

export default {
  data() {
    const position = this.component.style.position;
    const styleProxy = {}; // 将自定位组件的定位代理到该组件
    const menuStyle = {};  // 菜单展开的位置
    styleProxy.right = toPx(Number(position.right.split('vw')[0]), 3.75);
    styleProxy.bottom = toPx(Number(position.bottom.split('vh')[0]), 8.12);
    if (styleProxy.right < 58) {
      menuStyle.left = '-58px'
    } else {
      menuStyle.right = '-58px'
    }
    const styleProxy2 = {
      position: "absolute",
      zIndex: position.zIndex,
    };
    return {
      styleProxy: styleProxy,
      styleProxy2: styleProxy2,
      menuStyle: menuStyle,
      enableDrag: false,
      downPosition: {
        x: null,
        y: null,
      }, // 鼠标按下的位置
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
    ...mapState("component", ["components", "pComponents"]),
    ...mapGetters("compLib", ["pCompLib"]),
    componentInfo() {
      // 组件源信息
      return this.pCompLib.find((comp) => {
        return this.component.id === comp.compId;
      });
    },
    _styleProxy() {
      const _styleProxy = {};
      Object.keys(this.styleProxy).forEach((key) => {
        _styleProxy[key] = this.styleProxy[key] + 'px';
      })
      return { ..._styleProxy, ...this.styleProxy2 }
    }
  },
  mounted() {
    this.selfRef = this.$refs[this.component.name];
    this.selfRect = this.selfRef.getBoundingClientRect();
    this.painter = document.querySelector(".painter-canvas");
    this.painterInner = document.querySelector(".painter-canvas-inner");
    this.initDragable(true);
    if (this.component.style.position.targeting === 'fixed') {
      // 通过 计算滚动长度模拟fixed定位
      this.painter.addEventListener("scroll", this.computeFixed);
      this.computeFixed();
    }
  },
  watch: {
    "component.style.position.targeting": function(newTarget) {
      if (newTarget !== 'fixed') {
        this.painter.removeEventListener("scroll", this.computeFixed);
      } else {
        this.painter.addEventListener("scroll", this.computeFixed);
      }
      this.styleProxy2.targeting = newTarget;
    },
    "component.style.position.zIndex": function(newIndex) {
      this.styleProxy2.zIndex = newIndex;
    },
    components() {
      if (this.component.style.position.targeting === 'fixed') {
        setTimeout(() => {
          this.computeFixed();
        }, 200);
      }
    },
    selected(flag) {
      this.initDragable(flag);
    }
  },
  methods: {
    ...mapMutations("component", ["pDeleteComponent"]),
    setCurrentComponent(index) {
      this.$emit("setCurrentComponent", index);
    },
    handleComponentDelete() {
      const self = this;
      this.$confirm({
        title: "是否删除该组件？",
        content: "可通过撤销操作恢复",
        onOk() {
          return new Promise((resolve, reject) => {
            self.pDeleteComponent({
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
    initDragable(flag) {
      if (flag) {
        this.selfRef.addEventListener("mousedown", this.down);
        this.selfRef.addEventListener("mousemove", this.move);
        document.addEventListener("mouseup", this.up);
      } else {
        this.selfRef.removeEventListener("mousedown", this.down);
        this.selfRef.removeEventListener("mousemove", this.move);
        document.removeEventListener("mouseup", this.up);
      }
    },
    down(e) {
      this.enableDrag = true;
      this.downPosition.x = e.clientX;
      this.downPosition.y = e.clientY;
    },
    move(e) {
      if (this.enableDrag) {
        if (this.component.style.position.targeting === 'fixed') {
          const reHeight = this.painterInner.offsetHeight - this.painter.scrollTop - 812;
          this.styleProxy.bottom = Math.max(reHeight, this.styleProxy.bottom - (e.clientY - this.downPosition.y));
          this.styleProxy.bottom = Math.min(this.painterInner.offsetHeight - this.painter.scrollTop - this.selfRect.height - 12, this.styleProxy.bottom);
        } else {
          this.styleProxy.bottom = Math.max(0, this.styleProxy.bottom - (e.clientY - this.downPosition.y));
          this.styleProxy.bottom = Math.min(this.painterInner.offsetHeight - this.selfRect.height - 12, this.styleProxy.bottom);  
        }
        this.styleProxy.right = Math.max(0, this.styleProxy.right - (e.clientX - this.downPosition.x));
        this.styleProxy.right = Math.min(375 - this.selfRect.width - 12, this.styleProxy.right);
        if (this.styleProxy.right < 58){
          this.menuStyle.left = '-58px';
          this.menuStyle.right = null;
        } else {
          this.menuStyle.left = null;
          this.menuStyle.right = '-58px';
        }
        this.downPosition.x = e.clientX;
        this.downPosition.y = e.clientY;
      }
    },
    up() {
      if (this.enableDrag) {
        this.enableDrag = false;
        const position = this.component.style.position;
        if (position.targeting === 'fixed') {
          const reHeight = this.painterInner.offsetHeight - this.painter.scrollTop - 812;
          position.bottom = toVh(this.styleProxy.bottom - reHeight);
        } else {
          position.bottom = toVh(this.styleProxy.bottom) + 'vh';
        }
        position.right = toVw(this.styleProxy.right) + 'vw';
      }
    },
    computeFixed() {
      const reHeight = this.painterInner.offsetHeight - this.painter.scrollTop - 812;
      this.styleProxy.bottom = toPx(this.component.style.position.bottom, 8.12) + reHeight;
    },
  },
};
</script>

<style lang="less" scoped>
.selected {
  border-color: #409eff !important;
  .pcomp-wrapper-mask {
    cursor: move;
  }
}

.pcomp-wrapper {
  border: 2px solid transparent;
  padding: 4px;
  min-width: 40px;
  min-height: 40px;
  &-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__config {
    position: absolute;
    top: -2px;
    background: #409eff;
    color: #ffffff;
    font-size: 16px;
    padding: 5px;
    display: flex;
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