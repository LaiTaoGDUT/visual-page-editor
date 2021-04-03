<template>
  <div>
    <slot name="header"></slot>
    <a-form-item
      :validate-status="validateStatus"
      :help="errorMsg"
      has-feedback
    >
      <a-input-number
        v-model="nData"
        :min="minimum"
        :max="maximum"
        :step="multipleOf"
        :precision="precision"
        :formatter="formatter"
        :parser="parser"
        :disabled="disabled2"
        @change="handleNumberChange"
      />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: "enumType",
  data() {
    return {
      enum2: this.enum, // 规避保留字
      nData: this.oData, // 数据拷贝
      precision: 0, // 精度
      validateStatus: "success",
      errorMsg: null,
      minimum2: null,
      maximum2: null,
    };
  },
  model: {
    prop: "oData",
    event: "change",
  },
  props: {
    oData: {
      type: Number,
      default: NaN,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: ''
    },
    minimum: {
      type: Number,
      default: NaN,
    },
    maximum: {
      type: Number,
      default: NaN,
    },
    exclusiveMinimum: {
      type: Boolean,
    },
    exclusiveMaximum: {
      type: Boolean,
    },
    multipleOf: {
      type: Number,
      default: 1,
    },
    format: {
      type: String,
      default: ''
    },
    disabled2: {
      type: Boolean,
      default: false,
    },
    errorTips: {
      type: String,
      default: "",
    },
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    }
  },
  created() {
    if (!isNaN(this.minimum)) {
      this.minimum2 = this.exclusiveMinimum
        ? this.minimum - this.multipleOf
        : this.minimum;
    }
    if (!isNaN(this.maximum)) {
      this.maximum2 = this.exclusiveMaximum
        ? this.maximum - this.multipleOf
        : this.maximum;
    }

    // 计算精度
    const decimal = this.multipleOf.toString().split('.')[1];
    this.precision = decimal ? decimal.length : 0;

    // 初始化提示语
    if (this.multipleOf !== 1) {
      this.errorMsg = `请输入${this.multipleOf}的倍数`;
    }
  },
  methods: {
    formatter(value) {
      if (!this.format) { return value };
      const formatArr = this.format.split('${value}');
      let formatStr = '';
      for(let i = 0; i < formatArr.length - 1; i++) {
        formatStr = formatStr + formatArr[i] + value;
      }
      formatStr = formatStr + formatArr[formatArr.length - 1];
      return formatStr;
    },
    parser(value) {
      const formatArr = this.format.split('${value}');
      let index1 = formatArr[0] ? value.indexOf(formatArr[0]) + formatArr[0].length : 0;
      let index2 = formatArr[1] ? value.indexOf(formatArr[1]) : value.length;
      return Number(value.substring(index1, index2));
    },
    validateInput(value) {
      if (typeof value === 'string') return false; // 正在输入小数点的时候不进行校验
      // 最大 最小长度校验
      if (this.minimum2 && value < this.minimum2) {
        return this.switchValidate(
          false,
          "error",
          `长度小于：${this.minimum2}`
        );
      }
      if (this.maximum2 && value > this.maximum2) {
        return this.switchValidate(
          false,
          "error",
          `长度大于：${this.maximum2}`
        );
      }
      // 倍数匹配校验
      if ((value * Math.pow(10, this.precision)) % (this.multipleOf * Math.pow(10, this.precision)) !== 0) {
        return this.switchValidate(
          false,
          "error",
          `不是${this.multipleOf}的倍数`
        );
      }
      // 校验成功
      return this.switchValidate(true, "success", null);
    },
    handleNumberChange() {
      if (this.validateInput(this.nData)) {
        this.$emit("change", this.nData);
      }
    },
    switchValidate(flag, status, msg) {
      this.validateStatus = status;
      this.errorMsg = this.errorTips || msg;
      return flag;
    },
  },
};
</script>

<style lang="less" scoped>
</style>