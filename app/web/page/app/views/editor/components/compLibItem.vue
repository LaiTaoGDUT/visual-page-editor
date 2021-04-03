<template>
  <div class="comp-item" :data-component-id="component.compId">
    <div class="comp-item__avator">
      <el-image :src="getImg(component.cImageLink)" fit="contain" :preview-src-list="[getImg(component.cImageLink)]">
      </el-image>
    </div>
    <div class="comp-item__content">
      <h4 class="comp-item__title">
        {{ component.cName }}
      </h4>
      <div class="comp-item__desc">
        {{ component.cDesc }}
      </div>
    </div>

  </div>
</template>

<script>
import { getImg } from "@/utils";
export default {
  props: ["component"],
  methods: {
    getImg(path) {
      return getImg(path);
    },
  },
};
</script>

<style lang="less" scoped>
.comp-item {
  margin: 5px 10px 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  position: relative;
  box-shadow: 0 0 1px 0 rgba(22, 45, 61, 0.27);
  background: #fdfdff;
  border: 1px solid #ddd;
  cursor: pointer;
  &__avator {
    padding: 10px;
    background: transparent;
    .el-image {
      width: 120px;
      height: 100%;
      max-height: 100%;
      object-fit: contain;
      -o-object-position: center center;
      object-position: center center;
      border-radius: 5px;
      /deep/img {
        cursor: zoom-in !important;
      }
    }
  }
  &__content {
    padding: 10px;
    margin: 0;
    width: 0;
    font-size: 12px;
    flex-grow: 1;
    align-self: flex-start;
  }
  &__title {
    font-size: 14px;
  }
  &__desc {
    color: rgba(0, 0, 0, 0.5);
  }
  &:hover {
      background: rgba(65, 184, 131, .1);
  }
}
</style>