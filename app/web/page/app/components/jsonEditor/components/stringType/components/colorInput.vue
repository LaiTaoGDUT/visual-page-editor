<template>
  <el-color-picker
    style="margin-bottom: 24px"
    v-model="nData"
    @change="handleColorChange"
    :disabled="disabled2"
    :show-alpha="true"
  ></el-color-picker>
</template>

<script>
import mixins from "../mixins";
export default {
  mixins: [mixins],
  data() {
    return {
      nData: this.oData,
    };
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    }
  },
  methods: {
    handleColorChange() {
      this.$emit("dataChange", this.nData);
    },
  },
};
</script>

<style lang="less" scoped>
</style>