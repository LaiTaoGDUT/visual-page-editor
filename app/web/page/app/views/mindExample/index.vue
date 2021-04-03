<template>
<div style="height: 100vh;width: 100vw" class="mind-example">
  <mind-mapping @inited="handleInited"/>
  <div class="mind-example-menu" :style="{ 'transform': sideToggle ? 'translateX(0)' : 'translateX(350px)' }">
    <div class="mind-example-menu__toggle" @click="sideToggle = !sideToggle">
      {{ sideToggle ? '收起' : '展开' }}
    </div>
    <div style="height: 100vh;overflow: auto">
      <div class="mind-example-menu__title">
        快捷键
      </div>
      <div class="mind-example-menu__item">
        选择节点： <span class="mind-example-menu__key">鼠标点击</span> 
      </div>
      <div class="mind-example-menu__item">
        编辑节点： <span class="mind-example-menu__key">左键双击</span> 
      </div>
      <div class="mind-example-menu__item">
        缩  放： <span class="mind-example-menu__key">Ctrl/Cmd</span>+<span class="mind-example-menu__key">滚轮</span> 
      </div>
      <div class="mind-example-menu__item">
        插入子节点： <span class="mind-example-menu__key">Insert</span>、<span class="mind-example-menu__key">Tab</span>
      </div>
      <div class="mind-example-menu__item">
        插入兄弟节点： <span class="mind-example-menu__key">Enter</span>
      </div>
      <div class="mind-example-menu__item">
        编辑节点内容：<span class="mind-example-menu__key">F2</span>
      </div>
      <div class="mind-example-menu__item">
        编辑内容换行：<span class="mind-example-menu__key">Alt</span>+<span class="mind-example-menu__key">Enter</span>
      </div>
      <div class="mind-example-menu__item">
        删除节点：<span class="mind-example-menu__key">Delete</span>
      </div>
      <div class="mind-example-menu__item">
        展开或收起：<span class="mind-example-menu__key">Space</span>
      </div>
      <div class="mind-example-menu__item">
        功能菜单：<span class="mind-example-menu__key">右键单击</span>
      </div>
      <div class="mind-example-menu__item">
        操作撤销：<span class="mind-example-menu__key">Ctrl/Cmd</span>+<span class="mind-example-menu__key">Z</span>
      </div>
      <div class="mind-example-menu__item">
        操作恢复：<span class="mind-example-menu__key">Ctrl/Cmd</span>+<span class="mind-example-menu__key">Y</span>
      </div>
      <div class="mind-example-menu__item">
        节点导航：<span class="mind-example-menu__key">←</span>、<span class="mind-example-menu__key">↑</span>、<span class="mind-example-menu__key">↓</span>、<span class="mind-example-menu__key">→</span>
      </div>
      <div class="mind-example-menu__title">
        节点
      </div>
      <div class="mind-example-menu__item" :style="{ color : selectedNode ? 'black' : 'red'}">
        {{ selectedNode ?  '选中节点：' + selectedNode.topic : '请先选中一个节点！'}}
      </div>
      <div class="mind-example-menu__item">
        节点颜色：<input type="color" name="node_color" id="node_color">
      </div>
      <div class="mind-example-menu__item">
        节点背景色：<input type="color" name="node_bg_color" id="node_bg_color">
      </div>
      <div class="mind-example-menu__item">
        字体大小：<input type="number" name="node_font_size" id="node_font_size" min="12" max="40" step="1" value="16"> px
      </div>
      <div class="mind-example-menu__item">
        字体粗细：<input type="number" name="node_font_weight" id="node_font_weight" min="300" max="800" step="100" value="400">
      </div>
      <div class="mind-example-menu__item">
        字体样式：<input name="node_font_style" id="node_font_style">
      </div>
      <div class="mind-example-menu__item">
        节点宽度：<input type="number" name="node_width" id="node_width" min="20" step="1">px
      </div>
      <div class="mind-example-menu__item">
        节点高度：<input type="number" name="node_height" id="node_height" min="20" step="1">px
      </div>
      <div class="mind-example-menu__item">
        背景图片：<input type="file" name="node_image" id="node_image" accept="image/png, image/jpeg, image/gif, image/jpg">
      </div>
      <div class="mind-example-menu__title">
        连接线
      </div>
      <div class="mind-example-menu__item">
        线条粗细：<input type="number" name="line_width" id="line_width" min="1" max="10" step="1" value="2"> px
      </div>
      <div class="mind-example-menu__item">
        线条颜色：<input type="color" name="line_color" id="line_color">
      </div>
      <div class="mind-example-menu__item">
        线条样式：
        <select id="line_style" name="line_style">
          <option selected>default</option>
          <option>curve</option>
          <option>line</option>
          <option>bracket</option>
          <option>curveAndBracket</option>
        </select>
      </div>
      <div class="mind-example-menu__title">
        其它控制项
      </div>
      <div class="mind-example-menu__item">
        启用编辑：<label for="edit" class="mind-example-menu__form_item">启用</label><input type="radio" checked id="enable" name="edit" value="true"><label for="edit" class="mind-example-menu__form_item">禁用</label><input type="radio" id="disable" name="edit" value="false">
      </div>
      <div class="mind-example-menu__item">
        主题选择：
        <select id="theme" name="theme">
          <option selected>primary</option>
          <option>warning</option>
          <option>danger</option>
          <option>info</option>
          <option>greensea</option>
          <option>nephrite</option>
          <option>belizehole</option>
          <option>wisteria</option>
          <option>asphalt</option>
          <option>orange</option>
          <option>pumpkin</option>
          <option>pomegranate</option>
          <option>clouds</option>
          <option>asbestos</option>
        </select>
      </div>
      <div class="mind-example-menu__item">
        下载快照：<label for="saveshot" class="mind-example-menu__form_item">文件名</label><input type="text" id="saveshot" name="saveshot" value="exampleMind"><button type="button" name="shotdown">下载</button>
      </div>
    </div>

  </div>
</div>
</template>
<script>
import mindMapping from "@/components/mindMapping";
import html2canvas from 'html2canvas';

export default {
  components: {
    mindMapping,
  },
  data() {
    return {
      dataTree: {
        /* 元数据，定义思维导图的名称、作者、版本等信息 */
        meta: {
          name: "拉拉",
          author: "",
          version: "",
        },
        /* 数据格式声明 */
        format: "node_tree",
        /* 数据内容 */
        data: {
          id: "root",
          topic: "root",
          children: [
            {
              id: "easy",
              topic: "Easy",
              direction: "left",
              expanded: true,
              children: [
                { id: "easy1", topic: "Easy to show" },
                { id: "easy2", topic: "Easy to edit" },
                { id: "easy3", topic: "Easy to store" },
                { id: "easy4", topic: "Easy to embed" },
              ],
            },
            {
              id: "support",
              topic: "Support",
              direction: "right",
              expanded: true,
              children: [
                { id: "open1", topic: "support\nmulti-line" },
              ],
            },
            {
              id: "powerful",
              topic: "Powerful",
              direction: "right",
              children: [
                { id: "powerful1", topic: "Base on Javascript" },
                { id: "powerful2", topic: "Base on HTML5" },
                { id: "powerful3", topic: "Depends on you" },
              ],
            },
            {
              id: "other",
              topic: "test node",
              direction: "left",
              children: [
                { id: "other1", topic: "I'm from local variable" },
                { id: "other2", topic: "I can do everything" },
              ],
            },
          ],
        },
      },
      mindInstance: {},
      sideToggle: false,
      selectedNode: null,
    };
  },
  mounted() {
    const self = this;
    // 启用编辑
    document.querySelectorAll('input[type=radio][name=edit]').forEach(input => input.addEventListener('change', function () {
      if (this.value === 'true') {
        self.mindInstance.enable_edit();
      } else {
        self.mindInstance.disable_edit();
      }
    }));
    // 主题选择
    document.querySelector('select[name=theme]').addEventListener('change', function() {
      self.mindInstance.set_theme(this.value);
    });
    // 节点更改
    document.querySelector('input[id=node_color]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_color(self.selectedNode.id, false, this.value);
    });
    document.querySelector('input[id=node_bg_color]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_color(self.selectedNode.id, this.value, false);
    });
    document.querySelector('input[id=node_font_size]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_font_style(self.selectedNode.id, this.value, false, false);
    });
    document.querySelector('input[id=node_font_weight]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_font_style(self.selectedNode.id, false, this.value, false);
    });
    document.querySelector('input[id=node_font_style]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_font_style(self.selectedNode.id, false, false, this.value);
    });
    document.querySelector('input[id=node_width]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_size(self.selectedNode.id, this.value, false);
    });
    document.querySelector('input[id=node_height]').addEventListener('change', function() {
      if (!self.selectedNode) {return;}
      self.mindInstance.set_node_size(self.selectedNode.id, false, this.value);
    });
    document.querySelector('input[id=node_image]').addEventListener('change', function(e) {
      if (!self.selectedNode) {return;}
      const reads= new FileReader();
        reads.readAsDataURL(this.files[0]);
        reads.onload=function () {
            self.mindInstance.set_node_background_image(self.selectedNode.id, this.result, false, false);
        };
        this.value = null;
    });
    // 线条更改
    document.querySelector('input[id=line_width]').addEventListener('change', function() {
      self.mindInstance.set_line_width(this.value);
    });
    document.querySelector('input[id=line_color]').addEventListener('change', function() {
      self.mindInstance.set_line_color(this.value);
    });
    document.querySelector('select[id=line_style]').addEventListener('change', function() {
      self.mindInstance.set_line_style(this.value);
    });
    // 下载快照
    document.querySelector('button[name=shotdown]').addEventListener('click', function() {
      const fileName = document.querySelector('input[name=saveshot]').value || 'exampleMind';
      self.mindInstance.shootDownload(fileName);
    });
  },
  methods: {
    handleInited(mindInstance) {
      this.mindInstance = mindInstance;
      this.mindInstance.show(this.dataTree).then(() => {
        this.mindInstance.add_event_listener('setTheme', (res) => {
          document.querySelector('select[name=theme]').value = res.data.theme;
        })
        this.mindInstance.add_event_listener('select', (res) => {
          this.selectedNode = res.node;
          if (this.selectedNode) {
            const style = window.getComputedStyle(this.selectedNode._data.view.element);
            document.querySelector('input[name=node_color]').value = this.colorHex(style.color);
            document.querySelector('input[name=node_bg_color]').value = this.colorHex(style.backgroundColor);
            document.querySelector('input[name=node_font_size]').value = parseInt(style.fontSize);
            document.querySelector('input[name=node_font_weight]').value = parseInt(style.fontWeight);
            document.querySelector('input[name=node_font_style]').value = style.fontFamily;
            document.querySelector('input[name=node_width]').value = parseInt(style.width);
            document.querySelector('input[name=node_height]').value = parseInt(style.height);
          }
        })
      });
    },
    colorHex(color) {
      //十六进制颜色值的正则表达式
      var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
      // 如果是rgb颜色表示
      if (/^(rgb|RGB)/.test(color)) {
          var aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
          var strHex = "#";
          for (var i=0; i<aColor.length; i++) {
              var hex = Number(aColor[i]).toString(16);
              if (hex.length < 2) {
                  hex = '0' + hex;    
              }
              strHex += hex;
          }
          if (strHex.length !== 7) {
              strHex = color;    
          }
          return strHex;
      } else if (reg.test(color)) {
          var aNum = color.replace(/#/,"").split("");
          if (aNum.length === 6) {
              return color;    
          } else if(aNum.length === 3) {
              var numHex = "#";
              for (var i=0; i<aNum.length; i+=1) {
                  numHex += (aNum[i] + aNum[i]);
              }
              return numHex;
          }
      }
      return color;
    }
  }
};
</script>

<style lang="less" scoped>
.mind-example {
  &-menu {
    position: fixed;
    z-index: 10000;
    background: #ffffff;
    width: 350px;
    height: 100vh;
    right: 0;
    top: 0;
    border: solid 1px #ccc;
    transition: ease 0.3s all;
    &__toggle {
      width: 50px;
      height: 100px;
      position: absolute;
      left: -50px;
      top: calc(50vh - 50px);
      border: solid 1px #ccc;
      line-height: 100px;
      text-align: center;
      cursor: pointer;
    }

    &__title {
      font-size: 18px;
      margin: 20px 10px;
    }
    &__item {
      font-size: 12px;
      padding: 10px 15px;
      width: 100%;
      display: flex;
      align-items: center;
    }
    &__key {
      border: 1px solid #ccc;
      border-radius: 3px;
      display: inline-block;
      padding: 2px 4px;
      margin: 0px 3px;
      color: #555;
      width: auto;
      cursor: pointer;
    }
    &__form_item {
      padding: 0px 10px;
    }
  }
}
</style>