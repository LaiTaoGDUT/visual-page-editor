<template>
  <div class="temp-lib">
    <loading :loading="loading" :inside="true"></loading>
    <div class="temp-lib-search">
      <a-input-search
        placeholder="搜索模板..."
        enter-button
        allow-clear
        @search="filterList"
      />
    </div>
    <div class="temp-lib-add">
      <a-button @click="showCreateForm" v-show="!createFromVisible">
        新增模板
      </a-button>
      <span
        v-show="!createFromVisible"
        style="padding-left: 5px; color: rgba(0, 0, 0, 0.3); font-size: 10px"
        >将当前页面保存为模板</span
      >
      <a-form
        layout="inline"
        :form="createForm"
        @submit="createTemplate"
        v-show="createFromVisible"
      >
        <a-form-item
          :validate-status="templateNameError() ? 'error' : ''"
          :help="templateNameError() || ''"
        >
          <a-input
            ref="templateInput"
            v-decorator="[
              'templateName',
              {
                rules: [
                  { required: true, message: '请输入模板名称!' },
                  { max: 16, message: '模板名称超出长度限制！' },
                  { validator: checkTemplateNameRepeat },
                ],
              },
            ]"
            placeholder="模板名称"
          >
            <a-icon
              slot="prefix"
              type="user"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button
            html-type="submit"
            :disabled="hasErrors(createForm.getFieldsError())"
          >
            新建
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    <div style="display: flex">
      <div
        class="temp-item"
        v-show="!loading"
        :key="template.templateId"
        @dblclick="useTemplate(template.templateId)"
        v-for="template in showTemplateList"
      >
        <div class="temp-item__avator">
          <el-image :src="getImg(template.tImageLink)" fit="contain">
          </el-image>
        </div>
        <div class="temp-item__content">
          {{ template.tName }}
        </div>
        <div class="temp-item__desc">
          <a-tooltip placement="right">
            <template slot="title">
              创建于： {{ template.createTime }}
            </template>
            <a-icon
              type="info-circle"
              theme="filled"
              style="color: rgba(0, 0, 0, 0.3); font-size: 20px"
            />
          </a-tooltip>
        </div>
      </div>
    </div>

    <a-empty v-show="showTemplateList.length <= 0" style="margin: 0 auto">
      <span slot="description">
        暂无任何模板
        <span></span>
      </span>
      <a-button type="link" @click="showCreateForm" style="color: #41b883">
        将当前页面保存为模板
      </a-button>
    </a-empty>
  </div>
</template>

<script>
import {
  getTemplates,
  getTempDetail,
  createTemplate
} from "@/services/templates";
import { saveCompData, saveBaseInfo, saveShoot } from "@/services/pages";
import { mapState, mapMutations } from "vuex";
import loading from "@/components/loading";
import { getImg, stringifyDateTime } from "@/utils";
import pageShoot from "@/mixins/pageShoot";

export default {
  data() {
    return {
      templateList: [],
      loading: false,
      createForm: this.$form.createForm(this, { name: "create_template" }),
      createFromVisible: false,
      filterKey: "",
    };
  },
  props: ["pageId"],
  mixins: [pageShoot],
  components: {
    loading,
  },
  mounted() {
    this.getTemplates();
  },
  activated() {
    this.getTemplates();
  },
  computed: {
    ...mapState("page", ["styleData", "pageName", "pageDocName"]),
    ...mapState("component", ["components", "pComponents"]),
    showTemplateList() {
      return this.templateList.filter((template) => {
        return template.tName.includes(this.filterKey);
      });
    },
  },
  methods: {
    ...mapMutations("component", ["setComponents", "pSetComponents"]),
    ...mapMutations("page", ["setPageStyleData"]),
    async getTemplates() {
      this.loading = true;
      const list = await getTemplates();
      if (list.code === 200) {
        this.templateList = list.data;
        this.templateList.forEach((template) => {
          template.createTime = stringifyDateTime(template.createTime);
        });
      }
      this.loading = false;
    },
    filterList(key) {
      this.filterKey = key;
    },
    getImg(path) {
      return getImg(path);
    },
    checkTemplateNameRepeat(rule, value, callback) {
      this.templateList.forEach((item) => {
        if (item.tName === value) {
          return callback("模板名称已存在!");
        }
      });
      return callback();
    },
    showCreateForm() {
      if (!this.createFromVisible) {
        this.createFromVisible = true;
        this.createForm.validateFields();
      }
      this.$refs["templateInput"].focus();
    },
    templateNameError() {
      const { getFieldError, isFieldTouched } = this.createForm;
      return isFieldTouched("templateName") && getFieldError("templateName");
    },
    hasErrors(fieldsError) {
      return Object.keys(fieldsError).some((field) => fieldsError[field]);
    },
    createTemplate(e) {
      e.preventDefault();
      this.createForm.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          const flag = await this.saveData();
          if (!flag) return;
          const res = await createTemplate(values.templateName, this.pageId);
          if (res.code === 200) {
            this.createForm.resetFields();
            this.createFromVisible = false;
            this.getTemplates();
          }
          this.loading = false;
        }
      });
    },
    async saveData() {
      const shoot = await this.genShoot();
      const resArr = await Promise.all([
        saveCompData(this.pageId, {
          components: this.components,
          pComponents: this.pComponents,
        }),
        saveBaseInfo(this.pageId, this.pageName, this.pageDocName),
        saveShoot(this.pageId, shoot),
      ]);
      const status = true;
      resArr.forEach((res) => {
        if (res.code !== 200) {
          status = false;
        }
      });
      return status;
    },
    useTemplate(id) {
      const self = this;
      this.$confirm({
        title: "是否使用此模板？",
        content: "未保存的页面更改将被覆盖",
        onOk() {
          return new Promise(async (resolve, reject) => {
            const res = await getTempDetail(id);
            if (res.code === 200) {
              const detail = res.data;
              self.setComponents(detail.compData.components);
              self.pSetComponents(detail.compData.pComponents);
              self.setPageStyleData(detail.styleData);
              self.$message.success("模板使用成功！");
            }
            resolve();
          });
        },
        onCancel() {
          return new Promise((resolve, reject) => {
            resolve();
          });
        },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.temp-lib {
  min-height: 300px;
  &-search {
    margin: 0 10px 20px 10px;
    box-shadow: 0 0 3px 0 rgba(22, 45, 61, 0.27);
    /deep/.ant-input-search {
      &-button {
        background-color: #41b883 !important;
        border-color: #41b883 !important;
      }
      .ant-input:focus,
      .ant-input:hover {
        border-color: #41b883;
        border-right-width: 1px !important;
        outline: 0;
        box-shadow: 0 0 0 0;
      }
    }
  }
  &-add {
    margin: 15px 0px;
    padding-left: 5px;
    height: 70px;
    button:hover {
      color: #41b883;
      border-color: #41b883;
    }
    button[disabled]:hover {
      color: rgba(0, 0, 0, 0.25);
      border-color: #d9d9d9;
    }
    /deep/.ant-form-inline .ant-form-item {
      margin-right: 1px;
    }
    /deep/.ant-input {
      &:hover,
      &:focus {
        border-color: #41b883;
      }
    }
  }
}
.temp-item {
  margin: 5px 10px 10px;
  width: 118px;
  height: 168px;
  position: relative;
  border: 1px solid #505152;
  box-shadow: 0 0 6px 0 rgba(22, 45, 61, 0.27);
  cursor: pointer;
  &__avator {
    width: 100%;
    height: 100%;
    background: transparent;
    .el-image {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      -o-object-position: center center;
      object-position: center center;
      border-radius: 5px;
    }
  }
  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    padding: 2px 2px;
    background-color: rgba(0, 0, 0, 0.3);
    margin: 0;
    color: #fff;
    font-size: 14px;
  }
  &__desc {
    position: absolute;
    top: 3px;
    right: 3px;
  }
  &:hover {
    .temp-item__content {
      background: #41b883;
      color: #ffffff;
    }
    .temp-item__desc i {
      color: #41b883 !important;
    }
  }
}
</style>