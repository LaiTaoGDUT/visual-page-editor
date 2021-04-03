export default {
  props: {
    oData: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    minLength: {
      type: Number,
      default: 0,
    },
    placeHolder: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: 1000,
    },
    format: {
      type: String,
      default: "string",
    },
    errorTips: {
      type: String,
      default: "",
    },
    pattern: {
      type: String,
      default() {
        return '';
      },
    },
    disabled2: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      validateStatus: "success",
      errorMsg: null,
    };
  },
  methods: {
    switchValidate(flag, status, msg) {
      this.validateStatus = status;
      this.errorMsg = this.errorTips || msg;
      return flag;
    },
  }
}