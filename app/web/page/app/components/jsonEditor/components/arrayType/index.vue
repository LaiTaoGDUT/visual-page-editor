<template>
  <div class="json-editor-array">
    <slot name="header"></slot>
    <div
      class="json-editor-array__content json-editor-array__mutiselect"
      v-if="compType == 'mutiSelect'"
    >
      <muti-select
        :oData="nData2"
        :enum="enum2"
        @change="handleMutiChange"
      ></muti-select>
    </div>
    <div class="json-editor-array__content" v-else-if="compType !== 'objectType'">
      <div style="margin-bottom: 10px">
        <a-button-group>
          <a-button type="primary" class="json-editor-array__button" @click="addNormalArrayItem">
            <a-icon type="plus" />增加一项
          </a-button>
          <a-button type="primary" class="json-editor-array__button" @click="deleteAllArrayItem">
            <a-icon type="delete" />删除所有项
          </a-button>
        </a-button-group>
      </div>
      <a-alert :message="errorMsg" banner v-if="errorMsg"/>
      <a-alert :message="errorMsg2" banner type="error" v-if="errorMsg2"/>
      <div class="json-editor-array__item" v-for="(item, key) in nData2" :key="key">
        <component
          class="json-editor__item"
          :is="compType"
          v-bind="{ ...items, disabled2: initDisabledBase(items, nData2[key])}"
          :oData="nData2[key]"
          @change="(val) => handleNormalChange(val, key)"
        >
        </component>
        <div style="margin-top: 10px; width: 56px; text-align: center">
          <a-tooltip>
            <template slot="title"> 上移 </template>
              <a-icon
                type="arrow-up"
                v-show="key !== 0"
                class="json-editor-array__config"
                @click="upNormalArrayItem(key)"
              />
          </a-tooltip>
          <a-tooltip>
            <template slot="title"> 下移 </template>
            <a-icon
              type="arrow-down"
              v-show="key !== nData2.length - 1"
              class="json-editor-array__config"
              @click="downNormalArrayItem(key)"
            />
          </a-tooltip>
          <a-tooltip>
            <template slot="title"> 删除 </template>
            <a-icon
              type="delete"
              class="json-editor-array__config"
              @click="deleteNormalArrayItem(key)"
            />
          </a-tooltip>
        </div>

      </div>
    </div>
    <div class="json-editor-array__content" v-else>
      <div style="margin-bottom: 10px">
        <a-button-group>
          <a-button type="primary" class="json-editor-array__button" @click="addArrayItem">
            <a-icon type="plus" />增加一项
          </a-button>
          <a-button type="primary" class="json-editor-array__button" @click="deleteAllArrayItem">
            <a-icon type="delete" />删除所有项
          </a-button>
        </a-button-group>
      </div>
      <a-alert :message="errorMsg" banner v-if="errorMsg"/>
      <el-table :data="nData" max-height="450">
        <form-input
          @change="handleFormChange"
          :item="item"
          :itemKey="key"
          v-for="(item, key) in items.properties"
          :key="key"
        ></form-input>
        <el-table-column fixed="right" label="操作" width="80">
          <template slot-scope="scope">
            <a-tooltip>
              <template slot="title"> 上移 </template>
                <a-icon
                  type="arrow-up"
                  v-show="scope.$index !== 0"
                  class="json-editor-array__config"
                  @click="upArrayItem(scope)"
                />
            </a-tooltip>
            <a-tooltip>
              <template slot="title"> 下移 </template>
              <a-icon
                type="arrow-down"
                v-show="scope.$index !== nData.length - 1"
                class="json-editor-array__config"
                @click="downArrayItem(scope)"
              />
            </a-tooltip>
            <a-tooltip>
              <template slot="title"> 删除 </template>
              <a-icon
                type="delete"
                class="json-editor-array__config"
                @click="deleteArrayItem(scope)"
              />
            </a-tooltip>

          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
const context = require.context("../../components", true, /index\.vue$/);
const preComponents = {};
context.keys().forEach((key) => {
  const compName = key.split("./")[1];
  preComponents[`${compName.split("/")[0]}`] = function (resolve) {
    require([`../../components/${compName}`], resolve);
  };
});

import MutiSelect from "./components/mutiSelect";
import FormInput from "./components/formInput";
import { flatten, unflatten } from "@/utils";

export default {
  name: "arrayType",
  components: {
    MutiSelect,
    FormInput,
    ...preComponents,
  },
  data() {
    MutiSelect;
    return {
      enum2: this.enum, // 规避保留字
      nData: this.oData.map((item) => {
        return flatten(item);
      }), // 数据拷贝，扁平化
      nData2: this.oData,
      errorMsg: '',
      errorMsg2: '',
      errorMsgFlag: null,
    };
  },
  model: {
    prop: "oData",
    event: "change",
  },
  props: {
    oData: {
      type: Array,
      default() {
        return [];
      },
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    disabled2: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Object,
      default() {
        return {};
      },
    },
    minItems: {
      type: Number,
      default: 0,
    },
    maxItems: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
    },
    uniqueItems: {
      type: Boolean,
      default: true,
    },
    enum: {
      type: Array,
      default() {
        return [];
      },
    },
    defaultItem: {},
  },
  watch: {
    oData: {
      handler (newVal) {
        this.nData = newVal.map((item) => {
          return flatten(item);
        });
        this.nData2 = newVal;
      },
      deep: true,
      immediate: false
    }
  },
  computed: {
    compType() {
      if (this.enum2.length > 0 && this.uniqueItems) {
        return "mutiSelect";
      }
      if (this.items.type === "object" && !this.items.properties) {
        return "jsonType";
      }
      if (this.items.type !== "array" && this.items.enum) {
        return "enumType";
      }
      return this.items.type + "Type";
    },
    renderMutiSelect() {
      return;
    },
  },
  methods: {
    // 执行disabled属性中的表达式
    initDisabledBase(schema, data) {
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
    handleMutiChange(val) {
      this.$emit("change", val);
    },
    handleFormChange(val, key, index) {
      this.nData[index][key] = val;
      this.emitChange();
    },
    upArrayItem(scope) {
      if (scope.$index <= 0) {return;}
      this.changeItemIndex(scope.$index, scope.$index - 1);
    },
    downArrayItem(scope) {
      if (scope.$index >= this.nData.length - 1) {return;}
      this.changeItemIndex(scope.$index, scope.$index + 1);
    },
    deleteArrayItem(scope) {
      if (this.minItems && this.oData.length - 1 < this.minItems) {
        showErrorMsg('数组项最小数量限制：' + this.minItems + '!');
        return;
      }
      this.nData.splice(scope.$index, 1);
      this.emitChange();
    },
    addArrayItem() {
      if (this.maxItems && this.oData.length + 1 > this.maxItems) {
        showErrorMsg('数组项最大数量限制：' + this.maxItems + '!');
        return;
      }

      let extraItem = this.defaultItem;
      this.$emit('change', [ ...this.oData, extraItem ]);
    },
    deleteAllArrayItem() {
      if (this.minItems && this.minItems > 0) {
        showErrorMsg('数组项最小数量限制：' + this.minItems + '!');
        return;
      }
      this.$emit('change', []);
    },
    showErrorMsg(err) {
      if (this.errorMsgFlag) {
        clearTimeout(this.errorMsgFlag);
      }
      this.errorMsg = err;
      this.errorMsgFlag = setTimeout(() => {
        this.errorMsg = '';
        this.errorMsgFlag = null;;
      }, 3000);
    },
    changeItemIndex(oldIndex, newIndex) {
      const item = this.nData.splice(oldIndex, 1)[0];
      this.nData.splice(newIndex, 0, item);
      this.emitChange();
    },
    emitChange() {
      this.$emit(
        "change",
        this.nData.map((item) => {
          return unflatten(item);
        })
      );
    },
    handleNormalChange(val, key) {
      this.nData2[key] = val;
      if (this.uniqueItems) {
        if (new Set(this.nData2).size !== this.nData2.length) {
          this.errorMsg2 = '数组项需唯一';
          return;
        }
      }
      this.errorMsg2 = '';
      this.$emit('change', this.nData2);
    },
    addNormalArrayItem() {
      if (this.maxItems && this.oData.length + 1 > this.maxItems) {
        showErrorMsg('数组项最大数量限制：' + this.maxItems + '!');
        return;
      }

      let extraItem = this.defaultItem;
      this.nData2 = [ ...this.nData2, extraItem ];
      if (this.uniqueItems) {
        if (new Set(this.nData2).size !== this.nData2.length) {
          this.errorMsg2 = '数组项需唯一';
          return;
        }
      }
      this.errorMsg2 = '';
      this.$emit('change', this.nData2);
    },
    upNormalArrayItem(key) {
      if (key <= 0) {return;}
      this.changeNormalItemIndex(key, key - 1);
    },
    downNormalArrayItem(key) {
      if (key >= this.nData2.length - 1) {return;}
      this.changeNormalItemIndex(key, key + 1);
    },
    deleteNormalArrayItem(key) {
      if (this.minItems && this.oData.length - 1 < this.minItems) {
        showErrorMsg('数组项最小数量限制：' + this.minItems + '!');
        return;
      }
      this.nData2.splice(key, 1);
      this.$emit('change', this.nData2);
    },
    changeNormalItemIndex(oldIndex, newIndex) {
      const item = this.nData2.splice(oldIndex, 1)[0];
      this.nData2.splice(newIndex, 0, item);
      this.$emit('change', this.nData2);
    },
  },
};
</script>

<style lang="less" scoped>
.json-editor-array {
  padding-bottom: 24px;
  /deep/.el-table__body-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  /deep/.el-table .cell {
    display: flex;
    justify-content: center;
  }

  &__button {
    background-color: #41b883;
    border-color: #41b883 !important;

    &:hover {
      background-color: rgba(65, 184, 131, .8);;
    }
  }
  &__config {
    font-size: 16px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
  }
}
</style>