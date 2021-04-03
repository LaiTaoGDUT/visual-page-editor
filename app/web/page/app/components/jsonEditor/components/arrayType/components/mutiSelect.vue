<template>
  <div>
    <a-select
      mode="multiple"
      :default-value="nData"
      @change="handleChange"
    >
      <a-select-option v-for="item in enum2" :key="item">
        {{ item }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      enum2: this.enum, // 规避保留字
      nData: this.oData, // 数据拷贝
    };
  },
  props: {
    enum: {
      type: Array,
      default() {
        return [];
      },
    },
    oData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    }
  },
  methods: {
    handleChange(value) {
      this.$emit("change", value);
    }
  }
};
</script>

<style lang="less" scoped>

</style>