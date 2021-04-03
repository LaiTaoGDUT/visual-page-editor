<template>
  <div>
    <slot name="header"></slot>
    <div class="json-editor__json">
      <div id="monaco-editor" style="width: 100%; height: 300px">

      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor';

export default {
  name: "jsonTyle",
  data() {
    return {
      nData: this.oData, // 数据拷贝
      options: {
        language: "json",
        minimap: {
          // 关闭小地图
          enabled: false,
        },
        mouseWheelZoom: true, // 开启 Ctrl + 滚轮 缩放
        lineNumbers: 'off',
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        renderIndentGuides: true
      },
      monacoInstance: null,
      changeValLock: null,
      changeActive: false,
    };
  },
  model: {
    prop: "oData",
    event: "change",
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    oData: {
      type: Object,
      default() {
        return {}
      },
    },
    disabled2: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.monacoInstance = monaco.editor.create(
      document.getElementById("monaco-editor"),
      {
        value: JSON.stringify(this.nData, null, 4),
        ...this.options,
        readOnly: this.disabled,
      }
    );
    this.monacoInstance.onDidChangeModelContent((event) => {
      const model = this.monacoInstance.getModel();
      if (this.changeValLock) {
        clearTimeout(this.changeValLock);
      }
      this.changeValLock = setTimeout(() => {
        const errors = this.getErrors(model);
        if (errors.length <= 0) {
          let _new = this.monacoInstance.getValue().replaceAll(/\s+/g, "");
          if (_new[_new.length - 2] === ",") {
            _new =
              _new.substring(0, _new.length - 2) +
              _new.substring(_new.length - 1);
          }
          this.nData = JSON.parse(_new);
          this.changeActive = true;
          this.$emit("change", this.nData);
        }
        this.changeValLock = null;
      }, 1000);
    });
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
      if (!this.monacoInstance || this.changeActive) {
        this.changeActive = false;
        return;
      }
      const model = this.monacoInstance.getModel();
      model.setValue(JSON.stringify(this.nData, null, 4));
    },
  },
  methods: {
    getErrors(model) {
      return monaco.editor.getModelMarkers({
        owner: "json",
        resource: model.uri,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.json-editor__json {
  border: 1px solid #d1d5db;
  margin-bottom: 24px;
}
</style>