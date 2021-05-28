<template>
  <el-dialog
    :title=" title || '页面预览'"
    :visible="visible"
    :before-close="handleClose"
    top="0"
    class="preview-dialog"
    :lock-scroll="true"
  >
    <div class="preview-dialog-link">
      预览链接：<a :href="holeSrc" target="_blank">{{ holeSrc }} </a>
      <a-button class="preview-dialog-link__copy" size="small" @click="copy(holeSrc)">复制</a-button>
      <span class="preview-dialog-link__copy-tips">{{ copyTips }}</span>
    </div>
    <div class="preview-dialog-qrcode">
      <QRCanvas :options="qrCodeOpts"/>
    </div>
    <!-- <img :src="dataUrl" class="preview-dialog-qrcode"> -->
    <iframe width="375" height="812" :src="src" class="preview-dialog-frame" style="border: 0px"> </iframe>
  </el-dialog>
</template>

<script>

import { QRCanvas } from 'qrcanvas-vue';

export default {
  model: {
    prop: "visible",
    event: "change",
  },
  props: ["visible", "src", "title"],
  data() {
    return {
      copyTips: "",
      dataUrl: '',
    };
  },
  components: {
    QRCanvas,
  },
  methods: {
    handleClose() {
      this.$emit("change", false);
    },
    copy(value) {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", value);
      input.select();
      if (document.execCommand("copy")) {
        document.execCommand("copy");
        this.copyTips = "复制成功！";
        setTimeout(() => {
          this.copyTips = "";
        }, 2000);
      }
      document.body.removeChild(input);
    },
  },
  computed: {
    holeSrc() {
      return window.__INITIAL_STATE__.origin + this.src;
    },
    qrCodeOpts() {
      return {
        data: this.holeSrc,
        size: 100
      }
    }
  },
  watch: {
    visible() {
      setTimeout(() => {
        document.querySelector('.preview-dialog-frame').contentWindow.location.reload();
      }, 100)
    }
  }
};
</script>

<style lang="less" scoped>
.preview-dialog {
  /deep/.el-dialog {
    &__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f5f5f5;
    }
    &__header {
      background-color: #f5f5f5;
    }
  }
  &-link {
    margin-bottom: 20px;
    position: relative;
    width: 100%;
    text-align: center;
    a {
      text-decoration: underline;
    }
    &__copy {
      margin-left: 10px;
      font-size: 14px;
      &:hover {
        border-color:  #41b883;
        color: #41b883;
      }
      &-tips {
        position: absolute;
        color: #41b883;
        padding-left: 10px;
      }
    }
  }
  &-qrcode {
    position: absolute;
    right: 150px;
  }
}
</style>