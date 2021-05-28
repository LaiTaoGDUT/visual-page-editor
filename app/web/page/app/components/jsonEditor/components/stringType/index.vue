<template>
  <div>
    <slot name="header"></slot>
    <component :is="compMap[format] ? compMap[format] : 'normalInput'" v-bind="$props" @dataChange="handleDataChange"></component>
  </div>
</template>

<script>
import normalInput from './components/normalInput';
import dateTimeInput from './components/dateTimeInput';
import colorInput from './components/colorInput';
import imageInput from './components/imageInput';
import richTextInput from './components/richTextInput';
export default {
  components: {
    normalInput,
    dateTimeInput,
    colorInput,
    imageInput,
    richTextInput
  },
  model: {
    prop: "oData",
    event: "change",
  },
  props: {
    oData: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: ''
    },
    placeHolder: {
      type: String,
      default: ''
    },
    minLength: {
      type: Number,
      default: 0,
    },
    maxLength: {
      type: Number,
      default: 1000,
    },
    format: {
      type: String,
      default: "string",
    },
    pattern: {
      type: String,
      default() {
        return '';
      },
    },
    errorTips: {
      type: String,
      default: "",
    },
    disabled2: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      compMap: {
        'date-time': 'dateTimeInput',
        'color': 'colorInput',
        'image': 'imageInput',
        'richText': 'richTextInput',
      },
    };
  },
  methods: {
    handleDataChange(newVal) {
      this.$emit("change", newVal);
    },
  },
};
</script>

<style lang="less" scoped>

</style>