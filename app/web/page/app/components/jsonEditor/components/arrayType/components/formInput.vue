<template>
  <el-table-column :label="item.title" min-width="180">
    <form-input
      :item="item2"
      :itemKey="itemKey + '.' + key"
      v-for="(item2, key) in item.properties"
      @change="handleFormChange"
      :key="key"
    ></form-input>
    <template slot="header">
      <common-title
        :title="item.title"
        :desc="item.description"
      ></common-title>
    </template>
    <template slot-scope="scope" v-if="compType !== 'objectType'">
      <component
        class="json-editor__item"
        :is="compType"
        v-bind="{ ...item, disabled2: initDisabled(item, scope.row) }"
        :oData="scope.row[itemKey]"
        @change="(val) => handleChange(val, scope.$index)"
      >
      </component>
    </template>
  </el-table-column>
</template>

<script>
const context = require.context("../../../components", true, /index\.vue$/);
const preComponents = {};
context.keys().forEach((key) => {
  const compName = key.split("./")[1];
  preComponents[`${compName.split("/")[0]}`] = function (resolve) {
    require([`../../../components/${compName}`], resolve);
  };
});
import commonTitle from "../../../commonTitle";

export default {
  name: "formInput",
  data() {
    return {};
  },
  components: {
    commonTitle,
    ...preComponents,
  },
  props: {
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    itemKey: {
      type: String,
      default: '',
    },
    oData:{},
  },
  computed: {
    compType() {
      if (this.item.type !== "array" && this.item.enum) {
        return "enumType";
      }
      if (this.item.type === "object" && !this.item.properties) {
        return "jsonType";
      }
      if (this.item.type === 'boolean') {
        return 'boolType';
      }
      if (this.item.type === 'number' && this.item.renderTo === 'range') {
        return 'slideType';
      }
      return this.item.type + "Type";
    },
  },
  methods: {
    // 执行disabled属性中的表达式
    initDisabled(schema, data) {
      if (schema.disabled) {
        if (typeof schema.disabled !== 'boolean') {
          const disabledFun = new Function(`return ${schema.disabled}`);
          return disabledFun.call(data) || false;
        } else {
          return schema.disabled;
        }
      } else {
        return false;
      }
    },
    handleChange(val, index) {
      this.$emit('change', val, this.itemKey, index);
    },
    handleFormChange(...val) {
      this.$emit('change', ...val);
    }
  },
};
</script>

<style lang="less" scoped>
</style>