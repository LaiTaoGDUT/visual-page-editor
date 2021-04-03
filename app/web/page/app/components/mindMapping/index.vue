<template>
  <div id="mind-mapping-container" :style="{ width, height }"></div>
</template>

<script>
import "./plugins/jsMind/jsmind.css";
import "./plugins/jsMind/jsmind.js";
import "./plugins/jsMind/jsmind.draggable.js";
import "./plugins/jsMind/jsmind.screenshot.js";
import "./plugins/jsMind/jsmind.menu.js";
export default {
  props: {
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
    theme: {
      validator: function (value) {
        return (
          [
            "primary",
            "warning",
            "danger",
            "success",
            "info",
            "greensea",
            "nephrite",
            "belizehole",
            "wisteria",
            "asphalt",
            "orange",
            "pumpkin",
            "pomegranate",
            "clouds",
            "asbestos",
          ].indexOf(value) !== -1
        );
      },
      default: "primary",
    },
    editable: {
      type: Boolean,
      default: true,
    },
    baseOption: {
      type: Object,
      default() {
        return {
          view: {
            engine: "svg", // 思维导图各节点之间线条的绘制引擎
            hmargin: 100, // 思维导图距容器外框的最小水平距离
            vmargin: 50, // 思维导图距容器外框的最小垂直距离
            line_width: 2, // 思维导图线条的粗细
            line_color: "#555", // 思维导图线条的颜色
            min_zoom: 0.5, // 思维导图的最小放大倍数
            max_zoom: 2, // 思维导图的最大放大倍数
            zoom_step: 0.1, // 思维导图每放大或缩小一次的步进
          },
          menuOpts:{
            showMenu: true, // 打开右键功能
          },
          layout: {
            hspace: 30, // 节点之间的水平间距
            vspace: 30, // 节点之间的垂直间距
            pspace: 13, // 节点与连接线之间的水平间距（用于容纳节点收缩/展开控制器）
          },
          shortcut: {
            enable: true, // 是否启用快捷键
            handles: {}, // 命名的快捷键事件处理器
            mapping: {
              // 快捷键映射
              addchild: [45, 9], // <Insert> and <Tab>
              addbrother: 13, // <Enter>
              editnode: 113, // <F2>
              delnode: 46, // <Delete>
              toggle: 32, // <Space>
              left: 37, // <Left>
              up: 38, // <Up>
              right: 39, // <Right>
              down: 40, // <Down>
            },
          },
          screenshot: {
            waterMark: {
              waterMark1: {
                topic: "",
                color: "red",
                fontSize: 14,
              },
              waterMark2: {
                topic: "",
                color: "yellow",
                fontSize: 16,
              },
            },
          },
        };
      },
    },
  },
  data() {
    return {
      options: {
        container: "mind-mapping-container", // [必选] 容器的ID，或者为容器的对象
        editable: this.editable, // [可选] 是否启用编辑
        theme: this.theme, // [可选] 主题
        ...this.baseOption,
      },
    };
  },
  mounted() {
    setTimeout(() => {
      this.initMind();
    }, 0);
  },
  methods: {
    initMind() {
      const mindInstance = new jsMind(this.options);
      mindInstance.add_event_listener("inited", (data, type) => {
        this.$emit("inited", mindInstance);
      });
    },
  },
};
</script>

<style lang="less" scoped>
</style>