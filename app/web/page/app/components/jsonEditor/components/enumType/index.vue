<template>
  <div>
    <slot name="header"></slot>
    <a-form-item>
      <a-select v-model="nData" @change="handleStringChange" :disabled="disabled2">
        <a-select-option
          v-for="item in enum2"
          :key="item"
        >
          {{ item }}
        </a-select-option>
      </a-select>
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
    enum: {
      type: Array,
      default() {
        return []
      }
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: ''
    },
    oData: {
      type: String,
      default: "",
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
    handleStringChange() {
      this.$emit("change", this.nData);
    },
  },
};
</script>

<style lang="less" scoped>
</style>