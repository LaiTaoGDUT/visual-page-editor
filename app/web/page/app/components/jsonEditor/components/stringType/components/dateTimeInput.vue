<template>
  <a-form-item :validate-status="validateStatus" :help="errorMsg" has-feedback>
    <a-date-picker
      :disabled="disabled2"
      show-time
      valueFormat="YYYY-MM-DD HH:mm:ss"
      @change="handleDateTimeChange"
      v-model="nData"
      :allowClear="false"
    />
  </a-form-item>
</template>

<script>
import mixins from "../mixins";
export default {
  mixins: [mixins],
  data() {
    return {
      nData: this.$moment(this.oData, 'YYYY-MM-DD HH:mm:ss'),
    };
  },
  watch: {
    oData(newVal) {
      this.nData = this.$moment(newVal, 'YYYY-MM-DD HH:mm:ss');
    }
  },
  created() {
    this.validateInput(this.nData);
  },
  methods: {
    validateInput(value) {
      if (!value) {
        return this.switchValidate(false, 'error', '未选择日期时间');
      } else {
        return this.switchValidate(true, 'success', '');
      }
    },
    handleDateTimeChange(value) {
      if (this.validateInput(value)) {
        this.$emit("dataChange", value);
      }
    },
  },
};
</script>

<style lang="less" scoped>

</style>