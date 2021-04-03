<template>
  <el-carousel
    trigger="click"
    :height="
      indicatorPosition == 'outside'
        ? styles.height - 28 + 'px'
        : styles.height + 'px'
    "
    :style="{ backgroundColor: styles.backgroundColor }"
    :autoplay="config.interval > 0"
    :interval="config.interval * 1000"
    type="card"
    :arrow="arrow"
    :indicator-position="indicatorPosition"
  >
    <el-carousel-item v-for="(item, key) in config.carouselList" :key="key">
      <el-image
        :src="item.img"
        fit="fill"
        @click="jumpTo(item.link)"
        style="cursor: pointer; width: 100%; height: 100%"
      >
      </el-image>
      <span
        style="
          position: absolute;
          bottom: 20%;
          width: 100%;
          left: 0;
          text-align: center;
          z-index: 10;
        "
        :style="{ color: styles.color, fontSize: styles.fontSize + 'px' }"
        >{{ item.desc }}</span
      >
    </el-carousel-item>
  </el-carousel>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      required: true,
    },
    styles: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    arrow() {
      const arrowMap = new Map([
        ["始终显示", "always"],
        ["hover时显示", "hover"],
        ["隐藏", "never"],
      ]);
      return arrowMap.get(this.config.arrow);
    },
    indicatorPosition() {
      const indicatorPositionMap = new Map([
        ["显示", "outside"],
        ["隐藏", "none"],
      ]);
      return indicatorPositionMap.get(this.config.indicatorPosition);
    },
  },
  methods: {
    jumpTo(link) {
      if (link) {
        window.location.href = link;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.banner-item {
  height: 200px;
  width: 100%;
}
</style>
