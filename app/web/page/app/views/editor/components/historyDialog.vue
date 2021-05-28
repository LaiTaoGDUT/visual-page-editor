<template>
  <el-dialog
    :title="title || '历史保存记录'"
    :visible="visible"
    :before-close="handleClose"
    class="history-dialog"
    :lock-scroll="true"
  >
    <loading :loading="loading" :inside="true"></loading>
    <el-timeline>
      <el-timeline-item :timestamp="historyTime" placement="top" v-for="(historyArr, historyTime) in historyData" :key="historyTime">
        <el-card v-for="history in historyArr" :key="history.pHistoryId" style="margin: 10px 0">
          <h4 v-html="saveText[history.saveType]"></h4>
          <p><span style="color: #41b883;cursor: pointer;">{{ history.user.uName }}</span> 保存于 {{ stringifyDateTime(history.createTime) }}</p>
          <span style="display: flex;
                      position: absolute;
                      right: 0;
                      height: 100%;
                      top: 0;
                      align-items: center;
                      margin-right: 30px;"
          >
            <a @click="handleHistoryReuse(history)">应用此次更改</a>
            <a-divider type="vertical" />
            <a @click="$emit('openPreview', history.pHistoryId, 'pageHistory')">预览</a>
          </span>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <div v-if="historyData.length <= 0" style="margin-top: 30px">
      <a-empty>
        <span slot="description"> 暂无任何历史保存记录 </span>
      </a-empty>
    </div>
  </el-dialog>

</template>

<script>
import { getPageHistory, getPageHistoryDetail } from "@/services/pHistory";
import loading from "@/components/loading";
import { mapState, mapGetters, mapMutations } from "vuex";
import { stringifyDateTime } from "@/utils";
import { getCompDetail } from "@/services/components";
export default {
  components: {
    loading,
  },
  model: {
    prop: "visible",
    event: "change",
  },
  props: ["visible", "pageId", "title"],
  data() {
    return {
      historyData: [],
      loading: false,
    };
  },
  methods: {
    ...mapMutations("page", ["setPageName", "setPageDocName",  "setPageStyleData"]),
    ...mapMutations("component", ["setComponents", "pSetComponents","selectComponent","pSelectComponent"]),
    handleClose() {
      this.$emit("change", false);
    },
    async getHistory() {
      this.loading = true;
      const res = await getPageHistory(this.pageId);
      if (res.code === 200) {
        let dataMap = new Map();
        const today = stringifyDateTime(new Date(), 'YYYY-MM-DD');
        const yestoday = stringifyDateTime(new Date().setDate(new Date().getDate() - 1), 'YYYY-MM-DD');
        for (let history of res.data) {
          const createTime = stringifyDateTime(history.createTime, 'YYYY-MM-DD');
          if (createTime == today) { // switch ... case ...
            createTime = '今天';
          } else if (createTime == yestoday) {
            createTime = '昨天'
          }
          if (!dataMap.has(createTime)) {
            dataMap.set(createTime, [history]);
          } else {
            dataMap.get(createTime).push(history);
          }
        }
        this.historyData = Object.fromEntries(dataMap);
      } else {
        this.historyData = {};
      }
      this.loading = false;
    },
    handleHistoryReuse(history) {
      const self = this;
      this.$emit("change", false);
      this.$confirm({
        title: "是否应用该更改至画布中？",
        content: "未保存的更改将被舍弃",
        onOk() {
          return new Promise(async (resolve, reject) => {
            await self.reuseHistory(history);
            resolve();
          });
        },
        onCancel() {
          return new Promise((resolve, reject) => {
            self.$emit("change", true);
            resolve();
          });
        },
      });
    },
    async reuseHistory(history) {
      const historyId = history.pHistoryId;
      const res = await getPageHistoryDetail(historyId);
      if (res.code === 200) {
        const detail = res.data;
        this.selectComponent(-1);
        this.pSelectComponent(-1);
        await this.betchDetails(detail.pCompData);
        this.setPageName(res.data.pName);
        this.setPageDocName(res.data.pDocName);
        this.setComponents(detail.pCompData.components);
        this.pSetComponents(detail.pCompData.pComponents);
        this.setPageStyleData(detail.pStyleData);
        this.$message.success("使用历史记录成功！");
      }
    },
    // 批量获取组件的详细信息
    async betchDetails(compData) {
      const compArr = compData.components;
      const pCompArr = compData.pComponents;
      for (let comp of compArr) {
        const componentInfo = this.compList.find((_comp) => {
          return _comp.compId === comp.id;
        });
        if (!componentInfo.details) {
          const compDetailList = await this.getCompDetail(comp.id);
          if (compDetailList.length <= 0) return;
          componentInfo.details = compDetailList;
        }
      }
      for (let pComp of pCompArr) {
        const componentInfo = this.pCompLib.find((_comp) => {
          return _comp.compId === pComp.id;
        });
        if (!componentInfo.details) {
          const compDetailList = await this.getCompDetail(pComp.id);
          if (compDetailList.length <= 0) return;
          componentInfo.details = compDetailList;
        }
      }
    },
    // 获取组件详细信息
    async getCompDetail(id) {
      try {
        const res = await getCompDetail({ id });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        this.$message.error("添加组件失败了，请重试");
        return false;
      }
    },
    stringifyDateTime(...args) {
      return stringifyDateTime(...args);
    }
  },
  computed: {
    ...mapState("compLib", ["compLib", "pCompLib"]),
    ...mapGetters("compLib", ["compList"]),
  },
  created() {
    this.saveText = {
      1: '修改了页面基础信息与页面数据',
      2: '修改了页面数据',
      3: '修改了页面基础信息'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.getHistory();
      }
    }
  },
};
</script>

<style lang="less" scoped>
.history-dialog {
  /deep/.el-dialog {
    &__body {
      padding: 0px;
      position: relative;
      max-height: 600px;
      overflow-y: scroll;
      .el-timeline {
        padding: 30px 40px;
        .el-card__body {
          position: relative;
        }
      }
    }
  }
  h4 {
    font-weight: 400;
    color: #1f2f3d;
    margin: 18px 0px;
    font-size: 16px;
  }
  p {
    font-size: 14px;
    color: #5e6d82;
    line-height: 1.5em;
  }
}
</style>