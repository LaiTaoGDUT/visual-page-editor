<template>
  <a-form layout="horizontal">
    <div class="json-editor__item">
      <common-title title="页面名称"></common-title>
      <a-form-item
        :validate-status="validateStatus"
        :help="errorMsg"
        has-feedback
      >
        <a-input v-model="pageName1" :maxLength="20" @change="changePageName" />
      </a-form-item>
    </div>
    <div class="json-editor__item">
      <common-title title="文档名称" desc="设置文档的标题"></common-title>
      <a-form-item
        has-feedback
        :validate-status="validateStatus2"
        :help="errorMsg2"
      >
        <a-input
          :maxLength="100"
          @change="changePageDocName"
          v-model="pageDocName1"
        />
      </a-form-item>
    </div>
  </a-form>
</template>

<script>
import commonTitle from "@/components/jsonEditor/commonTitle";
import { mapMutations, mapState } from "vuex";
import { checkPageNameRepeat } from "@/services/pages";

export default {
  components: {
    commonTitle
  },
  data() {
    return {
      validateStatus: "success",
      errorMsg: null,
      validateStatus2: "success",
      errorMsg2: null,
      pageName1: '',
      pageDocName1: '',
    }
  },
  created() {
    this.pageName1 = this.pageName;
    this.pageDocName1 = this.pageDocName;
  },
  watch: {
    pageName(val) {
      this.pageName1 = val;
    },
    pageDocName(val) {
      this.pageDocName1 = val;
    }
  },
  props: ["pageId"],
  computed: {
    ...mapState("page", [
      "pageName",
      "pageDocName",
    ]),
  },
  methods: {
    ...mapMutations("page", ["setPageName", "setPageDocName"]),
    async changePageName() {
      if (this.pageName1.length <= 0) {
        this.validateStatus = "error";
        this.errorMsg = "页面名不能为空";
      } else {
        this.validateStatus = "validating";
        this.errorMsg = "";
        const res = await checkPageNameRepeat(this.pageId, this.pageName1);
        if (res.code === 200) {
          this.validateStatus = "success";
          this.setPageName(this.pageName1);
        } else {
          this.validateStatus = "error";
          this.errorMsg = "页面名与其它页面的名字重复";
        }
      }
    },
    changePageDocName() {
      if (this.pageDocName1.length <= 0) {
        this.validateStatus2 = "error";
        this.errorMsg2 = "文档名不能为空";
      } else {
        this.validateStatus = "success";
        this.setPageDocName(this.pageDocName1);
      }
    }
  },
};
</script>

<style lang="less" scoped>
  .json-editor__item {
    margin-top: 1px;
    padding: 16px 16px;
    cursor: pointer;
    &:hover {
      background-color: rgba(65, 184, 131, .1);
    }
  }
</style>