<template>
  <a-form-item :validate-status="validateStatus" :help="errorMsg" has-feedback>
    <a-input
      v-if="format != 'textarea'"
      resize="vertical"
      :autoSize="true"
      @change="handleStringChange"
      v-model="nData"
      :disabled="disabled2"
      :placeHolder="placeHolder"
    />
    <a-textarea
      v-else
      :auto-size="{ minRows: 3 }"
      resize="vertical"
      @change="handleStringChange"
      v-model="nData"
      :disabled="disabled2"
      :placeHolder="placeHolder"
    >
    </a-textarea>
  </a-form-item>
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
  created() {
    this.validateInput(this.nData);
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    },
  },
  methods: {
    validateInput(value) {
      // 正则校验
      if (this.pattern) {
        if (!new RegExp(this.pattern).test(value)) {
          return this.switchValidate(
            false,
            "error",
            `输入未通过正则校验：${this.pattern}`
          );
        } else {
          // 正则校验通过，无需校验其它参数
          return this.switchValidate(
            true,
            "success",
            `输入被限制为正则：${this.pattern}`
          );
        }
      }
      // 最大 最小长度校验
      if (value.length < this.minLength) {
        return this.switchValidate(
          false,
          "error",
          `字符长度小于：${this.minLength}`
        );
      }
      if (value.length > this.maxLength) {
        return this.switchValidate(
          false,
          "error",
          `字符长度大于：${this.maxLength}`
        );
      }
      // 校验成功
      return this.switchValidate(true, "success", null);
    },
    handleStringChange() {
      if (this.validateInput(this.nData)) {
        this.$emit("dataChange", this.nData);
      }
    },
  },
};
</script>

<style lang="less" scoped>
</style>