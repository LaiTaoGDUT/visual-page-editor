<template>
  <div class="pages">
    <loading :loading="loading"></loading>
    <previewDialog v-model="previewVisible" :src="previewSrc"></previewDialog>
    <div class="pages-header">
      <a-page-header
        style="
          border: 1px solid rgb(235, 237, 240);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
        "
        title="V E"
        sub-title="可视化网页搭建平台"
        :backIcon="false"
      >
        <template slot="extra">
          <div class="pages-header-info">
            欢迎您， <span>{{ userInfo.uName }}</span>
            <a @click="logout">退出</a>
          </div>
        </template>
      </a-page-header>
    </div>
    <div class="pages-content">
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" tab="我的页面">
          <a-card
            hoverable
            style="width: 300px; margin-right: 30px; margin-bottom: 30px"
            v-for="page in pages"
            :key="page.pageId"
          >
            <el-image style="width:300px;height:180px;background:#fafafa" slot="cover" :src="page.pImageLink || '/public/img/noShoot.png'" :fit="page.pImageLink ? 'contain' : 'fit'" :preview-src-list="[page.pImageLink || '/public/img/noShoot.png']">
            </el-image>
            <template slot="actions" class="ant-card-actions">
              <a-tooltip>
                <template slot="title"> 编辑 </template>
                <a-icon
                  key="setting"
                  type="edit"
                  @click="editPage(page.pageId)"
                />
              </a-tooltip>
              <a-tooltip>
                <template slot="title"> 预览 </template>
                <a-icon
                  key="ellipsis"
                  type="eye"
                  @click="previewPage(page.pageId)"
                />
              </a-tooltip>
              <a-tooltip>
                <template slot="title"> 删除 </template>
                <a-icon
                  key="edit"
                  type="delete"
                  style="color: red"
                  @click="deletePage(page.pageId)"
                />
              </a-tooltip>
            </template>
            <a-card-meta
              :title="page.pName"
              :description="`更新于 ${page.updateTime}`"
            >
            </a-card-meta>
          </a-card>
          <a-empty v-if="pages.length <= 0"  style="width: 100%">
            <span slot="description"> 暂无任何页面 </span>
          </a-empty>
        </a-tab-pane>
        <template slot="tabBarExtraContent">
          <a-button @click="showCreateForm" v-show="!createFromVisible">
            新建页面
          </a-button>
          <a-form
            layout="inline"
            :form="createForm"
            @submit="createPage"
            v-show="createFromVisible"
          >
            <a-form-item
              :validate-status="pageNameError() ? 'error' : ''"
              :help="pageNameError() || ''"
            >
              <a-input
                ref="versionInput"
                v-decorator="[
                  'pageName',
                  {
                    rules: [
                      { required: true, message: '请输入页面名称!' },
                      { max: 20, message: '页面名称超出长度限制！' },
                      { validator: checkPageNameRepeat },
                    ],
                  },
                ]"
                placeholder="页面名称"
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
        </template>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { getPages, deletePage, createPage } from "@/services/pages";
import { logout } from "@/services/users";
import { mapState } from "vuex";
import { stringifyDateTime } from "@/utils";
import loading from "@/components/loading";
import previewDialog from "../editor/components/previewDialog";
export default {
  components: {
    loading,
    previewDialog,
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      vm.loading = true;
      await vm.getPages();
      vm.loading = false;
    });
  },
  data() {
    return {
      pages: [],
      activeTab: 1,
      loading: false,
      previewVisible: false,
      previewSrc: "",
      createFromVisible: false,
      createForm: this.$form.createForm(this, { name: "create_page" }),
    };
  },
  computed: {
    ...mapState("user", ["userInfo"]),
  },
  methods: {
    async getPages() {
      const res = await getPages();
      if (res.code === 200) {
        this.pages = res.data;
        this.pages.forEach((page) => {
          page.createTime = stringifyDateTime(page.createTime);
          page.updateTime = stringifyDateTime(page.updateTime);
        });
      } else if (res.code === 302) {
        this.$router.push("/login");
      }
    },
    async logout() {
      const res = await logout();
      if (res.code === 200) {
        this.$message.success("退出成功");
        this.$router.push("/login");
      }
    },
    editPage(pageId) {
      this.$router.push(`/edit?id=${pageId}`);
    },
    previewPage(pageId) {
      this.previewVisible = true;
      this.previewSrc = `/preview?pageId=${pageId}`;
    },
    async deletePage(pageId) {
      const self = this;
      this.$confirm({
        title: `是否删除页面？`,
        content: "页面及其版本数据不可恢复",
        onOk() {
          return new Promise(async (resolve, reject) => {
            const res = await deletePage(pageId);
            if (res.code === 200) {
              self.$message.success("删除页面成功");
              await self.getPages();
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
    showCreateForm() {
      this.createFromVisible = true;
      this.createForm.validateFields();
      this.$refs["versionInput"].focus();
    },
    createPage(e) {
      e.preventDefault();
      this.createForm.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          const res = await createPage(values.pageName);
          if (res.code === 200) {
            this.createForm.resetFields();
            this.createFromVisible = false;
            this.$message.success('新建页面成功！');
            this.getPages();
          }
          this.loading = false;
        }
      });
    },
    pageNameError() {
      const { getFieldError, isFieldTouched } = this.createForm;
      return isFieldTouched("pageName") && getFieldError("pageName");
    },
    checkPageNameRepeat(rule, value, callback) {
      this.pages.forEach((item) => {
        if (item.pName === value) {
          return callback("页面名称已存在!");
        }
      });
      return callback();
    },
    hasErrors(fieldsError) {
      return Object.keys(fieldsError).some((field) => fieldsError[field]);
    },
  },
};
</script>

<style lang="less" scoped>
.pages {
  &-header {
    /deep/.ant-page-header {
      padding: 16px 44px;
      &-title {
        font-size: 28px;
      }
    }
    &-info {
      padding-right: 20px;
      a {
        text-decoration: underline;
      }
    }
  }
  &-content {
    margin: 30px 15%;
    /deep/.ant-tabs {
      &-tabpane {
        display: flex;
        flex-wrap: wrap;
      }
      &-bar {
        border-bottom: 0px;
        .ant-tabs-tab-active {
          color: #41b883;
        }
        .ant-tabs-ink-bar {
          background-color: #41b883;
        }
        .ant-btn:hover,
        .ant-btn:focus {
          color: #41b883;
          border-color: #41b883;
        }
        .ant-tabs-extra-content {
          height: 85px;
        }
      }
    }
    /deep/.ant-card-body {
      border-top: 1px solid #e8e8e8;
    }
  }
}
</style>