/*
 * Released under BSD License
 * Copyright (c) 2019-2020 Allen_sun_js@hotmail.com
 *
 * Project Home:
 *  https://github.com/allensunjian
 */

(function ($w, temp) {

  let Jm = $w[temp],

    name = 'menu',

    $d = $w['document'],

    Jdom = Jm.util.dom,

    $c = function (tag) { return $d.createElement(tag); },

    _noop = function () { },

    logger = (typeof console === 'undefined') ? {

      log: _noop, debug: _noop, error: _noop, warn: _noop, info: _noop

    } : console;

  var $t = function (n, t) { if (n.hasChildNodes()) { n.firstChild.nodeValue = t; } else { n.appendChild($d.createTextNode(t)); } };

  var $h = function (n, t) {
    if (t instanceof HTMLElement) {
      t.innerHTML = "";
      n.appendChild(t)
    } else {
      n.innerHTML = t;
    }
  };

  if (!Jm || Jm[name]) return;

  Jm.menu = function (_jm) {

    this._get_menu_options(_jm, function () {
      this.jm = _jm;
      this.menuInNode = null;
      this.menuWithoutNode = null;
      this.styleOptions = null;
      this.funcListInNode = [];
      this.funcListOut = [];
      this.init(_jm);

      this._mount_events()
    })
  }
  Jm.menu.prototype = {

    defaultDataMap: {
      funcMap: {
        edit: {
          isDepNode: true,
          // defaultFn不受到中台变量的控制，始终会先于fn去执行
          defaultFn: function (node) {
            var f = this._menu_default_mind_methods._menu_begin_edit.call(this.jm);
            f && this._menu_default_mind_methods._menu_edit_node_begin(this.jm.view, node);
          },
          fn: _noop,
          checkEnable: function () {
            return this.options.editable;
          },
          text: '编辑节点'
        },
        addChild: {
          isDepNode: true,
          fn: function (selected_node, nodeid, text) {
            if (!!selected_node) {
              let _nodeid = nodeid || Jm.util.uuid.newid();
              let _text = text || this.jmMenu.menuOpts.newNodeText || 'New Node';
              var node = this.add_node(selected_node, _nodeid, _text);
              if (!!node) {
                this.select_node(_nodeid);
                this.begin_edit(_nodeid);
              }
            }
          },
          checkEnable: function () {
            return this.options.editable;
          },
          text: '插入子节点'
        },
        addBrother: {
          isDepNode: true,
          fn: function (selected_node, nodeid, text) {
            if (!!selected_node && !selected_node.isroot) {
              let _nodeid = nodeid || Jm.util.uuid.newid();
              let _text = text || this.jmMenu.menuOpts.newNodeText || 'New Node';
              var node = this.insert_node_after(selected_node, _nodeid, _text);
              if (!!node) {
                this.select_node(_nodeid);
                this.begin_edit(_nodeid);
              }
            }
          },
          checkEnable: function () {
            return this.options.editable;
          },
          text: '插入兄弟节点'
        },
        delete: {
          isDepNode: true,
          fn: function (selected_node) {
            if (!!selected_node) {
              this.remove_node(selected_node);
            }
          },
          checkEnable: function () {
            return this.options.editable;
          },
          text: '删除节点'
        },
        upNode: {
          isDepNode: true,
          fn: function (selected_node) {
            if (!!selected_node) {
              if (selected_node.index <= 1) {return;}
              this.move_node(selected_node.id, selected_node.parent.children[selected_node.index - 2].id, selected_node.parent.id, selected_node.direction);
              this.select_node(selected_node.id);
            }
          },
          checkEnable: function (selected_node) {
            return selected_node.index > 1;
          },
          text: '上移节点'
        },
        downNode: {
          isDepNode: true,
          fn: function (selected_node) {
            if (!!selected_node) {
              if (selected_node.index >= selected_node.parent.children.length) {return;}
              const nextId = selected_node.index + 2 > selected_node.parent.children.length ? '_last_' : selected_node.parent.children[selected_node.index + 1].id;
              this.move_node(selected_node.id, nextId, selected_node.parent.id, selected_node.direction);
              this.select_node(selected_node.id);
            }
          },
          checkEnable: function (selected_node) {
            return selected_node.index < selected_node.parent.children.length;
          },
          text: '下移节点'
        },
        showAll: {
          sDepNode: false,
          fn: function () {
            this.expand_all(this)
          },
          checkEnable: function () {
            return this.options.editable && !this.is_expand_all();
          },
          text: '展开全部'
        },
        hideAll: {
          isDepNode: false,
          fn: function () {
            this.collapse_all(this)
          },
          checkEnable: function () {
            return this.options.editable && !this.is_collapse_all();
          },
          text: '收起全部'
        },
        screenshot: {
          isDepNode: false,
          fn: function (selected_node, name) {
            if (!this.screenshot) {
              logger.error('[jsmind] screenshot dependent on jsmind.screenshot.js !');
              return;
            }
            this.screenshot.shootDownload(name);
          },
          checkEnable: function () {
            return !!this.screenshot;
          },
          text: '存为图片'
        },
        showNode: {
          isDepNode: true,
          fn: function (selected_node) {
            if (!!selected_node) {
              this.expand_node(selected_node);
            }
          },
          checkEnable: function (selected_node) {
            return this.options.editable && this.can_node_expand(selected_node);
          },
          text: '展开节点'
        },
        hideNode: {
          isDepNode: true,
          fn: function (selected_node) {
            if (!!selected_node) {
              this.collapse_node(selected_node);
            }
          },
          checkEnable: function (selected_node) {
            return this.options.editable && this.can_node_collapse(selected_node);
          },
          text: '收起节点'
        },
      },
      menuStl: {
        'width': '120px',
        'padding': '12px 0',
        'position': 'fixed',
        'z-index': '10',
        'background': '#fff',
        'box-shadow': '0 2px 12px 3px rgba(0,0,0,0.1)',
        'border-radius': '5px',
        'font-size': '12px',
        'display': 'none'
      },
      menuItemStl: {
        padding: '5px 15px',
        cursor: 'pointer',
        display: 'block',
        'text-align': 'center',
        'transition': 'all .2s',
        background: '#fff',
        color: '#333',
      },
      menuItemHoverStl: {
        padding: '5px 15px',
        cursor: 'pointer',
        display: 'block',
        'text-align': 'center',
        'transition': 'all .2s',
        background: 'rgb(179, 216, 255)',
        color: '#333',
      },
      menuItemDisableStl: {
        padding: '5px 15px',
        cursor: 'not-allowed',
        display: 'block',
        'text-align': 'center',
        'transition': 'all .2s',
        background: '#fff',
        color: '#aaa',
      },
      injectionList: ['edit', 'addChild', 'addBrother', 'delete', 'upNode', 'downNode', 'showAll', 'hideAll', 'screenshot', 'showNode', 'hideNode'],
    },

    init: function (_jm) {
      this._init_option_style();
      this._create_node_menu();
      this._create_out_menu();
      this._get_injectionList();
      // this.menuOpts.switchMidStage && Jdom.add_event(_jm.view.e_editor , 'blur', function (e) {
      //       this._menu_default_mind_methods._menu_edit_node_end.call(_jm.view);

      //       this._menu_default_mind_methods._menu_update_edit_node.call(this);
      //   }.bind(this));
    },

    _event_contextMenu(e) {
      e.preventDefault();
      let nodeid = this.jm.view.get_binded_nodeid(e.target);
      let isexpander = this.jm.view.is_expander(e.target);

      if (!!nodeid && !isexpander) {
        this.jm.select_node(nodeid);
        this.menuInNode.style.left = e.clientX + 'px';
        this.menuInNode.style.top = e.clientY + 'px';
        this.menuInNode.style.display = 'block';
        this.selected_node = this.jm.get_selected_node();
        this.set_menu_item_in_node_status();
      } else {
        this.menuWithoutNode.style.left = e.clientX + 'px';
        this.menuWithoutNode.style.top = e.clientY + 'px';
        this.menuWithoutNode.style.display = 'block';
        this.selected_node = null;
        this.set_menu_item_out_status();
      }
    },

    _event_hideMenu2(e) {
      if (e.target.tagName.toLowerCase() !== 'jsmind-menu-item') {
        if (this.menuInNode.style.display != 'none') {
          this.menuInNode.style.display = 'none';
        }
        if (this.menuWithoutNode.style.display != 'none') {
          this.menuWithoutNode.style.display = 'none';
        }
      }
    },

    _event_hideMenu(e) {
      if (this.menuInNode.style.display != 'none') {
        this.menuInNode.style.display = 'none';
      }
      if (this.menuWithoutNode.style.display != 'none') {
        this.menuWithoutNode.style.display = 'none';
      }
    },

    _mount_events() {
      Jdom.add_event(this.jm.view.container, 'contextmenu', this._event_contextMenu.bind(this));
      $w['onmousedown'] = this._event_hideMenu2.bind(this);
      $w['onclick'] = this._event_hideMenu.bind(this);
    },

    _create_node_menu() {
      var d = $c('jsmind-menu');
      this._set_menu_wrap_syl(d);
      this.menuInNode = d;
      this.e_panel = this.jm.view.e_panel;
      this.e_panel.appendChild(d);
    },

    _create_out_menu() {
      var d = $c('jsmind-menu');
      this._set_menu_wrap_syl(d);
      this.menuWithoutNode = d;
      this.e_panel = this.jm.view.e_panel;
      this.e_panel.appendChild(d);
    },

    _create_menu_item(text, fn, isDepNode, cb, defaultFn, checkEnable) {
      var d = $c('jsmind-menu-item');
      this._set_menu_item_syl(d);
      d.innerText = text;
      d.addEventListener('click', function (e) {
        if (!d.dataset.enable) {return;}
        if (!checkEnable.call(this.jm, this.selected_node)) {return;}
        if (this.selected_node || !isDepNode) {
          defaultFn.call(this, this.selected_node);
          if (!this._get_mid_opts()) {
            cb(this.selected_node, _noop)
            fn.call(this.jm, this.selected_node);
            return;
          } else {
            cb(this.selected_node, this._mid_stage_next(function () {
              var retArgs = [this.selected_node],
              argus = Array.prototype.slice.call(arguments[0], 0);
              retArgs.push(...argus);
              fn.apply(this.jm, retArgs);
            }.bind(this)))
          }
        } else {
          alert(this.menuOpts.tipContent || 'Continue with node selected！')
        }
      }.bind(this))
      d.addEventListener('mouseover', () => {
        if (d.dataset.enable == 'true') {
          this._set_menu_item_hover_syl(d);
        }
      });
      d.addEventListener('mouseleave', () => {
        if (d.dataset.enable == 'true') {
          this._set_menu_item_syl(d);
        }
      });
      return d
    },

    set_menu_item_in_node_status() {
      this.funcListInNode.forEach((o) => {
        if (o.checkEnable.call(this.jm, this.selected_node)) {
          this._set_menu_item_syl(o.element);
          o.element.dataset.enable = true;
        } else {
          this._set_menu_item_disable_syl(o.element);
          o.element.dataset.enable = false;
        }
      })
    },

    set_menu_item_out_status() {
      this.funcListOut.forEach((o) => {
        if (o.checkEnable.call(this.jm, this.selected_node)) {
          this._set_menu_item_syl(o.element);
          o.element.dataset.enable = true;
        } else {
          this._set_menu_item_disable_syl(o.element);
          o.element.dataset.enable = false;
        }
      })
    },

    _set_menu_wrap_syl(d) {
      var os = this.styleOptions['menu'];
      d.style.cssText = this._format_cssText(os);
    },

    _set_menu_item_syl(d) {
      var os = this.styleOptions['menuItem'];
      d.style.cssText = this._format_cssText(os)
    },

    _set_menu_item_hover_syl(d) {
      var os = this.styleOptions['menuItemHover'];
      d.style.cssText = this._format_cssText(os)
    },

    _set_menu_item_disable_syl(d) {
      var os = this.styleOptions['menuItemDisable'];
      d.style.cssText = this._format_cssText(os)
    },

    _format_cssText(o) {
      var text = '';
      Object.keys(o).forEach(function (k) {
        text += k + ':' + o[k] + ';'
      })
      return text;
    },

    _empty_object(o) {
      return Object.keys(o).length == 0 ? true : false
    },

    _init_option_style () {
      var sty = this.menuOpts.style,
        menu = this.defaultDataMap.menuStl,
        menuItem = this.defaultDataMap.menuItemStl,
        menuItemHover = this.defaultDataMap.menuItemHoverStl,
        menuItemDisable = this.defaultDataMap.menuItemDisableStl;
      this.styleOptions = { menu, menuItem, menuItemHover, menuItemDisable };
      if (!sty) {
        return;
      }
      Object.keys(o).forEach(type => {
        if (!sty[type]) return;
        if (!sty[type] || this._empty_object(sty[type])) return;
        this.styleOptions[type] = this._get_mixin_sty(this.styleOptions[type], sty[type])
      })
    },

    _get_mixin_sty(dSty, oSty) {
      var o = {};
      Object.keys(oSty).forEach(function (k) {
        o[k] = oSty[k];
      })
      Object.keys(dSty).forEach(function (k) {
        if (!o[k]) o[k] = dSty[k];
      })
      return o
    },

    _get_menu_options(j, fn) {
      var options = j.options;
      if (!options.menuOpts) return;
      if (!options.menuOpts.showMenu) return;
      this.menuOpts = j.options.menuOpts
      fn.call(this)
    },

    _get_injectionDetail() {
      var iLs = this.menuOpts.injectionList,
        dLs = this.defaultDataMap.injectionList;
      if (!iLs) return dLs;
      if (!Array.isArray(iLs)) {
        logger.error('[jsmind] injectionList must be a Array');
        return;
      }
      if (iLs.length == 0) return dLs;
      return iLs
    },

    _get_injectionList() {
      let list = this._get_injectionDetail(),
        _this = this;
      list.forEach(function (k) {
        var o = null,
          text = "",
          callback = _noop,
          defaultFn = _noop,
          checkEnable = () => true;

        if (typeof k == 'object') {
          o = _this.defaultDataMap.funcMap[k.target];
          text = k.text;
          k.callback && (callback = k.callback);
        } else {
          o = _this.defaultDataMap.funcMap[k];
          text = o.text;
        }

        if (o.defaultFn) defaultFn = o.defaultFn;
        if (o.checkEnable) checkEnable = o.checkEnable;
        if (o.isDepNode) {
          o.element = _this.menuInNode.appendChild(_this._create_menu_item(text, o.fn, o.isDepNode, callback, defaultFn, checkEnable));
          _this.funcListInNode.push(o);
        } else {
          o.element = _this.menuWithoutNode.appendChild(_this._create_menu_item(text, o.fn, o.isDepNode, callback, defaultFn, checkEnable));
          _this.funcListOut.push(o);
        }
      })
    },

    _get_mid_opts() {
      var b = this.menuOpts.switchMidStage;
      if (!b) return false;
      if (typeof b !== 'boolean') {
        logger.error('[jsmind] switchMidStage must be Boolean');
        return false;
      }
      return b
    },

    _mid_stage_next(fn) {
      return function () {
        fn(arguments);
      }
    },

    _reset_mind_event_edit() { },

    _menu_default_mind_methods: {
      _menu_begin_edit: function () {
        var f = this.get_editable();
        if (!f) {
          logger.error('fail, this mind map is not editable.');
        };
        return f;
      },
      _menu_edit_node_begin(scope, node) {
        if (!node.topic) {
          logger.warn("don't edit image nodes");
          return;
        }
        if (scope.editing_node != null) {
          this._menu_default_mind_methods._menu_edit_node_end.call(scope);
        }
        scope.editing_node = node;
        var view_data = node._data.view;
        var element = view_data.element;
        var topic = node.topic;
        var ncs = getComputedStyle(element);
        scope.e_editor.innerHTML = topic + '\n';
        element.innerHTML = '';
        element.appendChild(scope.e_editor);
        element.style.zIndex = 5;
        scope.e_editor.focus();
        const range = document.createRange();
        range.selectNodeContents(scope.e_editor);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      },
      _menu_edit_node_end: function () {
        if (this.editing_node != null) {
          var node = this.editing_node;
          this.editing_node = null;
          var view_data = node._data.view;
          var element = view_data.element;
          var topic = this.e_editor.innerHTML;
          element.style.zIndex = 'auto';
          element.removeChild(this.e_editor);
          this.jm.jmMenu._update_node_info = { id: node.id, topic: topic };
          if (Jm.util.text.is_empty(topic) || node.topic === topic) {
            // if (this.opts.support_html) {
            //   $h(element, node.topic);
            // } else {
            //   $t(element, node.topic);
            // }
            $t(element, node.topic);
          }
        }
      },
      _menu_update_edit_node: function () {
        var info = this._update_node_info;
        this.jm.update_node(info.id, info.topic);
      }
    }

  }
  var plugin = new Jm.plugin('menu', function (_jm) {
    let jmMenu = new Jm.menu(_jm);

    jmMenu.jm = _jm;

    if (jmMenu.menuOpts) {
      _jm.jmMenu = jmMenu;
    }

  })

  Jm.register_plugin(plugin)

})(window, 'jsMind')
