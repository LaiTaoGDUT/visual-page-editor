<template>
  <a-form-item>
    <vue-tinymce
      v-model="nData" 
      :setting="setting"
      :disabled="disabled2"
    >
    </vue-tinymce>
  </a-form-item>
</template>

<script>

import mixins from "../mixins";
export default {
  mixins: [mixins],
  data() {
    return {
      nData: this.oData,
      setting: {
        menubar: false,
        skin_url: '/public/tinymce/skins/ui/oxide',
        content_css: '/public/tinymce/skins/content/default/content.min.css',
        toolbar: "undo redo fullscreen | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link codesample | alignleft aligncenter alignright alignjustify outdent indent formatpainter | \
          formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
          table image media charmap hr pagebreak insertdatetime",
        toolbar_mode: "sliding",
        quickbars_selection_toolbar: "removeformat | bold italic underline strikethrough | fontsizeselect forecolor backcolor",
        plugins: "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr nonbreaking insertdatetime advlist lists wordcount imagetools textpattern autosave autoresize quickbars",
        language: 'zh_CN',
        max_width: 750,
        file_picker_callback: () => {},
        fontsize_formats: "12px 14px 16px 18px 24px 36px 48px 56px 72px",
        font_formats: "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        branding: false,
        images_upload_handler: (blobInfo, success, failure) => {
          const img = "data:image/jpeg;base64," + blobInfo.base64();
          success(img);
        }
      },
    };
  },
  watch: {
    oData(newVal) {
      this.nData = newVal;
    },
    nData(newValue) {
      this.$emit("dataChange", this.nData);
    }
  },
};
</script>

<style>
</style>