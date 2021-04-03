<template>
  <div>
    <a-upload
      list-type="picture-card"
      :file-list="fileList"
      accept="image/png, image/jpeg, image/gif, image/jpg"
      @preview="handlePreview"
      @change="handleChange"
      :beforeUpload="beforeUpload"
    >
      <div v-if="fileList.length < 1">
        <a-icon type="plus" />
        <div class="ant-upload-text">上传图片</div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import { getBase64 } from "@/utils";
import mixins from "../mixins";
export default {
  mixins: [mixins],
  data() {
    return {
      previewVisible: false,
      previewImage: "",
      fileList: [],
    };
  },
  created() {
    if (this.oData) {
      this.fileList = [];
      this.fileList.push({
        uid: "-1",
        name: "image.png",
        status: "done",
        url: this.oData,
      });
    }
  },
  watch: {
    oData(newVal) {
    if (newVal) {
      this.fileList = [];
      this.fileList.push({
        uid: "-1",
        name: "image.png",
        status: "done",
        url: this.oData,
      });
    }
    }
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    beforeUpload() {
      return false;
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      this.previewImage = file.url || file.preview;
      this.previewVisible = true;
    },
    async handleChange({ fileList }) {
      this.fileList = fileList;
      if (this.fileList.length <= 0) {
        this.$emit("dataChange", '');
      } else {
        this.fileList[0].preview = await getBase64(this.fileList[0].originFileObj);
        this.$emit('dataChange', this.fileList[0].preview);
      }
      
    },
  },
};
</script>

<style lang="less" scoped>
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>