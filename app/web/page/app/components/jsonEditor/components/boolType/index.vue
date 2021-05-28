<template>
  <div class="json-editor-bool">
    <slot name="header"></slot>
    <a-form-item>
        <span style="padding-right: 10px;" :style="{color: nData ? 'rgba(0, 0, 0, 0.65)' : '#000'}">{{ switchText[0] }}</span>
        <a-switch v-model="nData" @change="handleChange" :disabled="disabled2">
        <a-icon slot="checkedChildren" type="check" />
        <a-icon slot="unCheckedChildren" type="close" />
        </a-switch>
        <span style="padding-left: 10px;" :style="{color: nData ? '#41b883' : 'rgba(0, 0, 0, 0.65)'}">{{ switchText[1] }}</span>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'enumType',
  data() {
    return {
      enum2: this.enum, // 规避保留字
      nData: this.oData, // 数据拷贝
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
      default: ''
    },
    oData: {
      type: Boolean,
      default: true,
    },
    switchText: {
      type: Array,
      default() {
        return ['关闭', '开启']
      }
    },
    disabled2: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    }
  },
  methods: {
    handleChange() {
      this.$emit("change", this.nData);
    },
  },
};
</script>

<style lang="less" scoped>
.json-editor-bool {
  /deep/.ant-switch-checked {
    background-color: #41b883;
  }
}
</style>