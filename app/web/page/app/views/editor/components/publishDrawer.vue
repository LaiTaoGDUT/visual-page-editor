<template>
  <div class="publish-drawer">
    <a-drawer
      title="版本发布"
      :width="720"
      :visible="visible"
      :body-style="{ padding: '0px' }"
      @close="onClose"
    >
      <loading :loading="loading" :inside="true"></loading>
      <div class="publish-drawer-link" v-show="publishSrc">
        页面已发布，访问链接：<a :href="publishSrc" target="_blank">{{ publishSrc }} </a>
        <a-button class="publish-drawer-link__copy" size="small" @click="copy(publishSrc)">复制</a-button>
        <span class="publish-drawer-link__copy-tips">{{ copyTips }}</span>
      </div>
      <div class="publish-drawer-qrcode" v-show="publishSrc">
        <QRCanvas :options="qrCodeOpts"  />
      </div>
      <div class="publish-drawer-add">
        <a-button @click="showCreateForm" v-show="!createFromVisible">
          新增版本
        </a-button>
        <a-form layout="inline" :form="createForm" @submit="createVersion" v-show="createFromVisible">
          <a-form-item :validate-status="versionNameError() ? 'error' : ''" :help="versionNameError() || ''">
            <a-input
              ref="versionInput"
              v-decorator="[
                'versionName',
                { rules: [{ required: true, message: '请输入版本名称!' }, {max: 16, message: '版本名称超出长度限制！'}, { validator: checkVersionNameRepeat }] },
              ]"
              placeholder="版本名称"
            >
              <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button html-type="submit" :disabled="hasErrors(createForm.getFieldsError())">
              新建
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-table :pagination="false" :columns="columns" :data-source="versionList" rowKey="pVersionId" v-show="versionList.length > 0">
        <span slot="publish" slot-scope="publish">
          <a-tag
            :color="publish ? 'green' :'volcano'"
          >
            {{ publish ? '已发布' : '未发布' }}
          </a-tag>
        </span>
        <span slot="action" slot-scope="record">
          <a @click="publishVersion(record)" v-if="!record.publish">发布</a>
          <a @click="offVersion(record)" v-else>下线</a>
          <a-divider type="vertical" />
          <a @click="$emit('openPreview', record.pVersionId, 'pageVersion')">预览</a>
        </span>
      </a-table>
      <a-empty
        v-show="versionList.length <= 0"
        style="margin: 0 auto"
      >
        <span slot="description">
          暂无任何版本
          <span></span>
        </span>
        <a-button
          type="primary"
          @click="showCreateForm"
          style="background: #41b883; border-color: #41b883"
        >
          创建一个
        </a-button>
      </a-empty>
    </a-drawer>
  </div>
</template>

<script>
import loading from "@/components/loading";
import { savePage, saveCompData, saveBaseInfo, getPageVersionList, createPageVersion, publishVersion, offVersion } from '@/services/pages';
import { mapState, mapMutations } from 'vuex';
import { stringifyDateTime } from '@/utils';
import { QRCanvas } from 'qrcanvas-vue';
import pageShoot from '@/mixins/pageShoot';

const columns = [
  {
    dataIndex: 'pVersionName',
    title: '版本名称',
    key: 'pVersionName',
    slots: { title: 'customTitle' },
    scopedSlots: { customRender: 'name' },
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
  },
  {
    title: '发布情况',
    key: 'publish',
    dataIndex: 'publish',
    scopedSlots: { customRender: 'publish' },
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'center',
  },
];

export default {
  components: {
    loading,
    QRCanvas,
  },
  mixins: [pageShoot],
  model: {
    prop: "visible",
    event: "change",
  },
  data() {
    return {
      loading: false,
      versionList: [],
      createForm: this.$form.createForm(this, { name: 'create_version' }),
      createFromVisible: false,
      columns,
      copyTips: "",
      dataUrl: '',
    }
  },
  computed: {
    ...mapState("component", ["components", "pComponents"]),
    ...mapState('page', ['styleData', 'pageName', 'pageDocName', 'baseInfoModifyFlag', 'componentDataModifyFlag']),
    publishSrc() {
      const publishVersion = this.versionList.find((item) => item.publish);
      if (publishVersion) {
        return window.__INITIAL_STATE__.origin + `/act/${publishVersion.pVersionId}`;
      } else {
        return ''
      }
    },
    qrCodeOpts() {
      return {
        data: this.publishSrc,
        size: 100
      }
    }
  },
  props: ["visible", "pageId"],
  watch: {
    async visible(flag) {
      if (flag) {
        await this.getVersionList();
      } else {
        this.createFromVisible = false;
        this.createForm.resetFields();
      }
    }
  },
  methods: {
    ...mapMutations('page', ["setBaseInfoModifyFlag", "setComponentDataModifyFlag"]),
    async getVersionList() {
      this.loading = true;
      const res = await getPageVersionList(this.pageId);
      if (res.code === 200) {
        this.versionList = res.data;
        this.versionList.forEach((item) => {
          item.createTime = stringifyDateTime(item.createTime);
        })
      }
      this.loading = false;
    },
    onClose() {
      this.$emit("change", false);
    },
    showCreateForm() {
      if (!this.createFromVisible) {
        this.createFromVisible = true;
        this.createForm.validateFields();
      }
      this.$refs['versionInput'].focus()
    },
    versionNameError() {
      const { getFieldError, isFieldTouched } = this.createForm;
      return isFieldTouched('versionName') && getFieldError('versionName');
    },
    hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field]);
    },
    checkVersionNameRepeat(rule, value, callback) {
      this.versionList.forEach((item) => {
        if (item.pVersionName === value) {
          return callback('版本名称已存在!');
        }
      })
      return callback();
    },
    createVersion(e) {
      e.preventDefault();
      this.createForm.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          const flag = await this.saveData();
          if (!flag) return;
          const res = await createPageVersion(this.pageId, values.versionName, this.pageDocName, this.styleData, { components: this.components, pComponents: this.pComponents });
          if (res.code === 200) {
            this.createForm.resetFields();
            this.createFromVisible = false;
            this.getVersionList();
          }
          this.loading = false;
        }
      });
    },
    async publishVersion(record) {
      const self = this;
      this.$confirm({
        title: "是否发布此版本？",
        content: "",
        onOk() {
          return new Promise(async (resolve, reject) => {
            const res =  await publishVersion(self.pageId, record.pVersionId);
            if (res.code === 200) {
              self.$message.success('发布版本成功！');
              self.getVersionList();
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
    async offVersion(record) {
      const self = this;
      this.$confirm({
        title: "是否下线此版本？",
        content: "下线后该页面的访问链接将失效",
        onOk() {
          return new Promise(async (resolve, reject) => {
            const res =  await offVersion(self.pageId, record.pVersionId);
            if (res.code === 200) {
              self.$message.success('版本下线成功！');
              self.getVersionList();
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
    async saveData() {
      let res = null;
      if (this.componentDataModifyFlag && this.baseInfoModifyFlag) {
        const shoot = await this.genShoot();
        res = await savePage({
          pageId: this.pageId,
          saveType: 1,
          compData: { components: this.components, pComponents: this.pComponents },
          styleData: this.styleData,
          shoot,
          pageName: this.pageName,
          pageDocName: this.pageDocName,
        })
      } else if (this.componentDataModifyFlag) {
        const shoot = await this.genShoot();
        res = await saveCompData(this.pageId, { components: this.components, pComponents: this.pComponents }, this.styleData, shoot);
      } else if (this.baseInfoModifyFlag) {
        res = await saveBaseInfo(this.pageId, this.pageName, this.pageDocName);
      } else {
        return true;
      }
      if (res.code === 200) {
        this.$message.success('保存成功！');
        this.setBaseInfoModifyFlag(false);
        this.setComponentDataModifyFlag(false);
        return true;
      }
      return false;
    },
    copy(value) {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", value);
      input.select();
      if (document.execCommand("copy")) {
        document.execCommand("copy");
        this.copyTips = "复制成功！";
        setTimeout(() => {
          this.copyTips = "";
        }, 2000);
      }
      document.body.removeChild(input);
    },
  },
};
</script>

<style lang="less" scoped>
.publish-drawer {
  &-link {
    margin: 20px 0;
    position: relative;
    width: 100%;
    text-align: center;
    a {
      text-decoration: underline;
    }
    &__copy {
      margin-left: 10px;
      font-size: 14px;
      &:hover {
        border-color:  #41b883;
        color: #41b883;
      }
      &-tips {
        position: absolute;
        color: #41b883;
        padding-left: 10px;
      }
    }
  }
  &-add {
    margin: 15px 0px;
    padding: 0px 24px;
    height: 70px;
    button:hover {
      color:  #41b883;
      border-color:  #41b883;
    }
    button[disabled]:hover {
      color: rgba(0, 0, 0, 0.25);
      border-color: #d9d9d9;
    }
    /deep/.ant-input {
      &:hover, &:focus {
        border-color:  #41b883;
      }
    }
  }
  &-qrcode {
    position: absolute;
    right: 40px;
    top: 60px;
  }
}
</style>