<template>
  <div class="json-editor-example">
    <div id="monaco-editor" style="width: 800px; height: 600px">

    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  data() {
    return {
      options: {
        language: 'json',
        minimap: { // 关闭小地图
          enabled: false
        },
        mouseWheelZoom: true // 开启 Ctrl + 滚轮 缩放
      },
      monacoInstance: null,
      value: {
        "enabled": true,
        "description": "something"
      },
      changeValLock: null,
    };
  },
  mounted() {
    this.monacoInstance = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: JSON.stringify(this.value, null, 4),
      ...this.options
    });
    // const model = this.monacoInstance.getModel();
    // monaco.editor.setModelMarkers(model, 'json', );
    this.monacoInstance.onDidChangeModelContent((event) => {
      const model = this.monacoInstance.getModel();
      if (this.changeValLock) {
        clearTimeout(this.changeValLock);
      }
      this.changeValLock = setTimeout(() => {
        const errors = this.getErrors(model);
        if (errors.length <= 0) {
          let _new = this.monacoInstance.getValue().replaceAll(/\s+/g, "")
          if (_new[_new.length - 2] === ',') {
            _new = _new.substring(0,_new.length - 2) + _new.substring(_new.length - 1);
            this.value = JSON.parse(_new);
          }
        }
        this.changeValLock = null;
      }, 1000)

    })
  },
  methods: {
    getErrors(model) {
      return monaco.editor.getModelMarkers({ owner: 'json', resource: model.uri });
    }
  },
};
</script>

<style scoped lang="less">
.json-editor-example {
  width: 100vw;
  height: 100vh;
}
</style>