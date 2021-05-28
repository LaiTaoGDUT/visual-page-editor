<template>
  <div class="p-bottom-navigation" :style="{backgroundColor: styles.backgroundColor, fontSize: styles.fontSize + 'px', ...editStyle}">
    <a-button  :style="computeStyle(key)" v-for="(item, key) in config.itemList" :key="item.name" class="p-bottom-navigation__item" @click="linkTo(item.link)" type="link">
      <icon :type="item.icon" :style="{ fontSize: styles.iconSize + 'px' }" />
      {{ item.name }}
    </a-button>
  </div>
</template>

<script>
import { Icon } from 'ant-design-vue';

const itemArr = [
  '第一项',
  '第二项',
  '第三项',
  '第四项',
  '第五项'
]

export default {
  components: {
    Icon,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    styles: {
      type: Object,
      required: true,
    },
    edit: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {

    }
  },
  methods: {
    linkTo(link) {
      location.replace(link);
    },
    computeStyle(key) {
      const keyName = itemArr[key];
      if (this.config.defaultSelect === keyName) {
        return { color: this.styles.selectColor }
      } else {
        return { color: this.styles.normalColor }
      }
    },
  },
  computed: {
      editStyle() {
        return {
        ...this.styles.position,
        position: this.edit ? 'static' : this.styles.position.position,
        width: this.edit ? '363px' : '100vw',
        paddingTop: this.styles.paddingTop + 'px',
        paddingBottom: this.styles.paddingBottom + 'px'
      }
      }
  }
};
</script>

<style lang="less" scoped>
.p-bottom-navigation {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /deep/&__item {
    height: 100%;
    font-size: 12px;
    padding: 0 14px;
    border-radius: 0px;
    color: rgb(91, 107, 115);
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 76px;
    &[disabled] {
      color: rgba(0,0,0,.25) !important;
      background-color: #f5f5f5;
    }
    &:hover {
      color: #41b883;
      background: rgb(242, 242, 242);
    }
    i {
      margin-bottom: 2px;
    }
    span {
      margin: 0;
    }
  }
}

</style>