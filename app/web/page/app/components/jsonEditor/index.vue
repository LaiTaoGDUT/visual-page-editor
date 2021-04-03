<template>
  <div class="json-editor">
    <!-- <div class="json-editor__title">
      {{ schema.title }}
    </div> -->
    <a-form layout="horizontal">
      <template v-for="(schemaItem, key) in schema.properties">
        <json-editor
          :key="key"
          v-if="schemaItem.type === 'object' && schemaItem.properties"
          :schema="schemaItem"
          v-model="form[key]"
        ></json-editor>
        <component
          class="json-editor__item"
          v-else
          :key="key"
          :is="getCompType(schemaItem)"
          v-bind="{ ...schemaItem }"
          v-model="form[key]"
        >
          <template v-slot:header>
            <common-title
              :title="schemaItem.title"
              :desc="schemaItem.description"
            ></common-title>
          </template>
        </component>
      </template>

    </a-form>
  </div>
</template>

<script>
import commonTitle from "./commonTitle";

const context = require.context("./components", true, /index\.vue$/);
const preComponents = {};
context.keys().forEach((key) => {
  const compName = key.split("./")[1];
  preComponents[`${compName.split("/")[0]}`] = function (resolve) {
    require([`./components/${compName}`], resolve);
  };
});
export default {
  name: 'jsonEditor',
  model: {
    prop: "form",
    event: "change",
  },
  data() {
    return {

    };
  },
  created() {
    this.initDisabledExp(this.schema, this.form, this.form);
  },
  components: {
    commonTitle,
    ...preComponents,
  },
  props: {
    schema: {
      type: Object,
      default() {
        return {};
      },
    },
    form: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  watch: {
    form: {
      handler () {
        this.initDisabledExp(this.schema, this.form, this.form);
      },
      deep: true,
      immediate: false
    }
  },
  methods: {
    getCompType(schemaItem) {
      if (schemaItem.type !== 'array' && schemaItem.enum) {
        return 'enumType';
      }
      if (schemaItem.type === 'object' && !schemaItem.properties) {
        return 'jsonType';
      }
      if (schemaItem.type === 'boolean') {
        return 'boolType';
      }
      if (schemaItem.type === 'number' && schemaItem.renderTo === 'range') {
        return 'slideType';
      }
      return schemaItem.type + 'Type';
    },
    // 执行disabled属性中的表达式
    initDisabledExp(schema, data, subData) {
      if (schema.properties) {
        for(let pro of Object.keys(schema.properties)) {
          this.initDisabledExp(schema.properties[pro], subData, subData[pro]);
        }
      } else {
        if (schema.disabled) {
          if (typeof schema.disabled !== 'boolean') {
            const disabledFun = new Function(`return ${schema.disabled}`);
            schema.disabled2 = disabledFun.call(data) || false;
          } else {
            schema.disabled2 = schema.disabled;
          }
        }
      }
    }
  },
};
</script>

<style lang="less" scoped>
.json-editor {
  &__item {
    padding: 16px 16px 1px;
    cursor: pointer;
    margin-top: 1px;
    &:hover {
      background-color: rgba(65, 184, 131, .1);
    }
  }
}
</style>