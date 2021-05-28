<template>
  <div
    class="normal-form"
    :style="{
      backgroundColor: styles.backgroundColor,
      backgroundImage: `url(${styles.backgroundImage})`,
      backgroundRepeat: styles.backgroundRepeat ? 'repeat' : 'no-repeat',
      backgroundSize: styles.backgroundSize == '自定义大小'
          ? `${styles.backgroundWidth} ${styles.backgroundHeight}`
          : styles.backgroundSize,
      padding: `${styles.topPadding}px ${styles.rightPadding}px ${styles.bottomPadding}px ${styles.leftPadding}px`,
    }"
  >
    <el-form
      :model="form"
      v-if="form"
      :rules="formRules"
      ref="form"
      label-position="top"
      :size="size"
    >
      <el-form-item
        :label="formItem.label"
        :prop="formItem.name"
        v-for="(formItem, key) in config.itemList"
        :key="key"
      >
        <el-select
          v-if="formItem.type == '下拉选择框'"
          v-model="form[formItem.name]"
          :placeholder="formItem.placeholder"
        >
          <el-option
            :label="option"
            :value="option"
            v-for="option in getOptions(formItem.optionList)"
            :key="option"
          ></el-option>
        </el-select>
        <a-radio-group v-model="form[formItem.name]" v-else-if="formItem.type == '垂直单选框'">
          <a-radio
            :value="option"
            v-for="option in getOptions(formItem.optionList)"
            :key="option"
            :style="radioStyle"
          >
            {{ option }}
          </a-radio>
          <a-radio :value="formItem.canInputOther" v-if="formItem.canInputOther" :style="radioStyle">
            {{ formItem.canInputOther }}
            <el-input v-if="form[formItem.name] === formItem.canInputOther" :maxlength="formItem.limit ? formItem.limit : -1" :style="{ width: 100, marginLeft: 10 }" v-model="radioOtherInputForm[formItem.name]" />
          </a-radio>
        </a-radio-group>
        <el-input
          v-else
          v-model="form[formItem.name]"
          :placeholder="formItem.placeholder"
          :type="formItem.type == '多行输入框' ? 'textarea' : 'text'"
          :maxlength="formItem.limit ? formItem.limit : -1"
          :show-word-limit="!!formItem.limit"
          :rows="3"
          :autoSize="formItem.autoSize ? {minRows: 3} : false"
          resize="vertical"
        ></el-input>
      </el-form-item>
      <div style="display: flex; padding-top: 10px">
        <el-button
          v-if="config.clearText"
          @click="onClear"
          style="flex-grow: 1"
          :style="{
            fontSize: styles.fontSize + 'px',
            backgroundColor: styles.clearBgColor,
            color: styles.clearColor,
          }"
          >{{ config.clearText }}</el-button
        >
        <el-button
          @click="onSubmit"
          style="flex-grow: 1"
          :style="{
            fontSize: styles.fontSize + 'px',
            backgroundColor: styles.submitBgColor,
            color: styles.submitColor,
          }"
          >{{ config.submitText }}</el-button
        >
      </div>
    </el-form>
    <div v-show="showTips" :style="{ color: showTips == 'success' ? '#41b883' : '#f5222d', fontSize: styles.fontSize + 'px'}" style="text-align: center;">
      {{ tips }}
    </div>
  </div>
</template>

<script>
import { post } from "@/services";

export default {
  props: {
    config: {
      type: Object,
      required: true,
    },
    styles: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: null,
      radioOtherInputForm: null,
      formRules: null,
      showTips: '',
      tips: '',
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
    };
  },
  created() {
    this.initFormData();
    this.initFormRule();
  },
  mounted() {
    const root = document.querySelector(".normal-form");
    root.querySelectorAll(".el-form-item__label").forEach((el) => {
      el.style.color = this.styles.labelColor;
    });
    root.querySelectorAll(".el-form-item__label").forEach((el) => {
      el.style.fontSize = this.styles.fontSize + "px";
    });
    root.querySelectorAll(".el-input").forEach((el) => {
      el.style.fontSize = this.styles.fontSize + "px";
    });
    root.querySelectorAll(".el-textarea").forEach((el) => {
      el.style.fontSize = this.styles.fontSize + "px";
    });
    root.querySelectorAll(".el-select").forEach((el) => {
      el.style.fontSize = this.styles.fontSize + "px";
    });
  },
  watch: {
    "styles.labelColor": {
      handler(newVal) {
        document
          .querySelector(".normal-form")
          .querySelectorAll(".el-form-item__label")
          .forEach((el) => {
            el.style.color = newVal;
          });
      },
    },
    "styles.fontSize": {
      handler(newVal) {
        const root = document.querySelector(".normal-form");
        root.querySelectorAll(".el-form-item__label").forEach((el) => {
          el.style.fontSize = newVal + "px";
        });
        root.querySelectorAll(".el-input").forEach((el) => {
          el.style.fontSize = newVal + "px";
        });
        root.querySelectorAll(".el-textarea").forEach((el) => {
          el.style.fontSize = newVal + "px";
        });
        root.querySelectorAll(".el-select").forEach((el) => {
          el.style.fontSize = newVal + "px";
        });
      },
    },
    config: {
      handler() {
        this.initFormData();
        this.initFormRule();
        setTimeout(() => {
          this.$refs["form"].resetFields();
        })
      },
      deep: true,
      immediate: false
    }
  },
  computed: {
    size() {
      const sizeMap = new Map([
        ["大", "medium"],
        ["中", "small"],
        ["小", "mini"],
      ]);
      return sizeMap.get(this.styles.size);
    },
  },
  methods: {
    initFormData() {
      const itemList = this.config.itemList;
      const form = {};
      const radioOtherInputForm = {};
      for (let item of itemList) {
        form[item.name] = "";
        if (item.canInputOther) {
          radioOtherInputForm[item.name] = "";
        }
      }
      this.form = form;
      this.radioOtherInputForm = radioOtherInputForm;
    },
    initFormRule() {
      const itemList = this.config.itemList;
      const formRules = {};
      for (let item of itemList) {
        if (item.need) {
          formRules[item.name] = [
            { required: true, message: item.need, trigger: "change" },
          ];
        } else {
          formRules[item.name] = [];
        }
      }
      this.formRules = formRules;
    },
    getOptions(optionStr) {
      if (!optionStr) {
        return [];
      }
      const arr = optionStr.split(",").filter(item => {
        return !!item;
      });
      return arr;
    },
    onClear() {
      this.$refs["form"].resetFields();
    },
    onSubmit() {
      const self = this;
      this.$refs["form"].validate(async (valid) => {
        if (valid) {
          if (!self.config.submitLink) {
            self.$message.error('未配置接口地址！')
            return false;
          }
          const submitForm = {};
          for (let key of Object.keys(self.form)) {
            submitForm[key] = self.radioOtherInputForm[key] || self.form[key];
          }
          const res = await post(self.config.submitLink, submitForm);
          if (res.code == 200) {
            self.handleSubmitSuccess(res.msg);
          } else {
            self.handleSubmitFailed(res.msg);
          }
        } else {
          return false;
        }
      });
    },
    handleSubmitSuccess(msg) {
      this.handleSubmitResult(this.config.aftSuccess);
      this.showTips = 'success';
      this.tips = this.config.successText || msg || '提交成功！';
      this.delayHideTips();
    },
    handleSubmitFailed(msg) {
      this.handleSubmitResult(this.config.aftFailed);
      this.showTips = 'failed';
      this.tips = this.config.failText || msg || '提交失败！';
      this.delayHideTips();
    },
    handleSubmitResult(action) {
      switch (action) {
        case "清空输入":
          this.$refs["form"].resetFields();
          break;
        case "维持原状":
          break;
        default:
          break;
      }
    },
    delayHideTips() {
      setTimeout(() => {
        this.showTips = '';
      }, 3000)
    }
  },
};
</script>

<style lang="less" scoped>
/deep/.el-select {
  width: 100%
}
</style>
