/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 * 
 * Overwrite by:
 *   Lai Tao at 02.23.2021
 */

(function ($w) {
    'use strict';
    let $d = $w.document;
    let __name__ = 'jsMind';
    let jsMind = $w[__name__];
    if (!jsMind) { return; }
    if (typeof jsMind.draggable != 'undefined') { return; }

    let jdom = jsMind.util.dom;
    let clear_selection = 'getSelection' in $w ? function () {
        $w.getSelection().removeAllRanges();
    } : function () {
        $d.selection.empty();
    };

    let options = {
        line_width: 4,
        lookup_delay: 600, // show guide line 300ms delay after move node
        lookup_interval: 100 // refresh guide line per 40ms
    };

    jsMind.draggable = function (jm) {
        this.jm = jm;
        this.e_canvas = null;
        this.canvas_ctx = null;
        this.shadow = null;
        this.shadow_w = 0;
        this.shadow_h = 0;
        this.active_node = null;
        this.target_node = null;
        this.target_action = 0;
        this.target_direct = null;
        this.client_w = 0;
        this.client_h = 0;
        this.offset_x = 0;
        this.offset_y = 0;
        this.move_x = 0;
        this.move_y = 0;
        this.hlookup_delay = 0;
        this.hlookup_timer = 0;
        this.capture = false;
        this.moved = false;
        this.needRefresh = false;
        
        this.offsetCapture = false;
        this.offset_move_x = 0;
        this.offset_move_y = 0;
    };

    jsMind.draggable.prototype = {
        init: function () {
            this._create_canvas();
            this._create_shadow();
            this._event_bind();
        },

        resize: function () {
            this.jm.view.e_nodes.appendChild(this.shadow);
            this.e_canvas.width = this.jm.view.size.w + 290;
            this.e_canvas.height = this.jm.view.size.h + (this.jm.options.layout.vspace - 5) * 2;
        },

        _create_canvas: function () {
            let c = $d.createElement('canvas');
            this.jm.view.e_panel.appendChild(c);
            let ctx = c.getContext('2d');
            this.e_canvas = c;
            this.canvas_ctx = ctx;
        },

        _create_shadow: function () {
            let s = $d.createElement('jmnode');
            s.style.visibility = 'hidden';
            s.style.zIndex = '3';
            s.style.cursor = 'move';
            s.style.opacity = '0.7';
            this.shadow = s;
        },

        reset_shadow: function (el) {
            let s = this.shadow.style;
            this.shadow.innerHTML = el.innerHTML;
            s.left = el.style.left;
            s.top = el.style.top;
            let elStyle;
            if(window.getComputedStyle) { 
              elStyle = window.getComputedStyle(el); 
            }else{ 
              elStyle = el.currentStyle; 
            } 
            s.width = elStyle.width;
            s.height = elStyle.height;
            s.backgroundImage = el.style.backgroundImage;
            s.backgroundSize = el.style.backgroundSize;
            s.transform = el.style.transform;
            this.shadow_w = this.shadow.clientWidth;
            this.shadow_h = this.shadow.clientHeight;

        },

        show_shadow: function () {
            if (!this.moved) {
                this.shadow.style.visibility = 'visible';
            }
        },

        hide_shadow: function () {
            this.shadow.style.visibility = 'hidden';
        },

        _magnet_shadow: function (node) {
            if (!!node) {
                this.canvas_ctx.lineWidth = options.line_width;
                this.canvas_ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                this.canvas_ctx.lineCap = 'round';
                this._canvas_lineto(node.sp.x, node.sp.y, node.np.x, node.np.y);
            }
        },

        _magnet_shadow2: function (node) {
            if (!!node) {
                this.canvas_ctx.lineWidth = options.line_width;
                this.canvas_ctx.lineCap = 'round';
                this.canvas_ctx.strokeStyle = this.jm.mind.wait_insert_data['outline-color'] || 'rgba(0,0,0,0.4)';
                this.canvas_ctx.fillStyle = this.jm.mind.wait_insert_data['outline-color'] || 'rgba(0,0,0,0.4)';
                this._canvas_lineto2(node);
            }
        },

        _clear_lines: function () {
            this.canvas_ctx.clearRect(0, 0, this.jm.view.size.w + 290, this.jm.view.size.h + (this.jm.options.layout.vspace - 5) * 2);
        },

        _set_heightline: function () {
            const target_element = this.target_node._data.view.element;
            target_element.className += ' jsmind-wait-insert';
            const wait_insert_data = this.jm.mind.wait_insert_data;
			if (!!wait_insert_data['outline-color']) {
				target_element.style.outlineColor = wait_insert_data['outline-color'];
			}
			if (!!wait_insert_data['outline-width']) {
				target_element.style.outlineWidth = wait_insert_data['outline-width'] + 'px';
			}
			if (!!wait_insert_data['outline-style']) {
				target_element.style.outlineStyle = wait_insert_data['outline-style'];
			}
        },

        _clear_heightline: function () {
            if (!!this.target_node) {
                const target_element = this.target_node._data.view.element;
                target_element.style.outlineColor = "";
                target_element.style.outlineWidth = "";
                target_element.style.outlineStyle = "";
                target_element.className = target_element.className.replace(/\s*jsmind-wait-insert\b/i, '');
            }
        },

        _canvas_lineto: function (x1, y1, x2, y2) {
            this.canvas_ctx.beginPath();
            const px = 145;
            const py = this.jm.options.layout.vspace - 5;
            this.canvas_ctx.moveTo(x1 + px, y1 + py);
            this.canvas_ctx.lineTo(x2 + px, y2 + py);
            this.canvas_ctx.stroke();
        },

        _canvas_lineto2: function (node_data) {
            let x1 = node_data.np.x,
                y1 = node_data.np.y,
                direction = node_data.direction,
                action = node_data.action,
                node = node_data.node;
                parent = node.parent;
            this.canvas_ctx.beginPath();
            const px = x1 + 145;
            const py = y1 + this.jm.options.layout.vspace - 5;
            if (action == 0) {
                this.canvas_ctx.moveTo(px, py);
                this.canvas_ctx.lineTo(px + 75 * direction, py);
                this.canvas_ctx.stroke();
                if (direction == jsMind.direction.left) {
                    this.canvas_ctx.fillRect(px + (75 + 100) * direction, py - 15, 100, 30);
                } else {
                    this.canvas_ctx.fillRect(px + 75 * direction, py - 15, 100, 30);
                }          
            } else {
                let ns = node.get_size();
                let pnl = parent.get_location();
                let pns = parent.get_size();
                const parent_px = pnl.x + 145;
                const parent_py = pnl.y + this.jm.options.layout.vspace - 5;
                let mh = Math.max(Math.min(ns.h, this.jm.options.layout.vspace - 5), 5);
                let mh_2 = Math.round(mh / 2);
                let ms_h_2 = Math.round(ns.h / 2);
                if (action == 1) {
                    this.canvas_ctx.fillRect(px - ns.w * (direction + 1) / 2, py + ms_h_2, ns.w, mh);
                    this.canvas_ctx.moveTo(px - ns.w * direction, py + mh_2 + ms_h_2);
                } else {
                    this.canvas_ctx.fillRect(px - ns.w * (direction + 1) / 2, py - mh - ms_h_2, ns.w, mh);
                    this.canvas_ctx.moveTo(px - ns.w * direction, py - mh_2 - ms_h_2);
                }
                this.canvas_ctx.lineTo(parent_px + pns.w * (direction + 1) / 2, parent_py + Math.round(pns.h / 2));
                this.canvas_ctx.stroke();
            }
            this.canvas_ctx.closePath();
            this.canvas_ctx.fill();
        },

        _lookup_close_node: function () {
            let root = this.jm.get_root();
            let root_location = root.get_location();
            let root_size = root.get_size();
            let root_x = root_location.x + root_size.w / 2;

            let sw = this.shadow_w;
            let sh = this.shadow_h;
            let sx = this.shadow.offsetLeft;
            let sy = this.shadow.offsetTop;

            let ns, nl;

            let direct = (sx + sw / 2) >= root_x ?
                jsMind.direction.right : jsMind.direction.left;
            let nodes = this.jm.mind.nodes;
            let node = null;
            let min_distance = Number.MAX_VALUE;
            let distance = 0;
            let closest_node = null;
            let closest_p = null;
            let shadow_p = null;
            for (let nodeid in nodes) {
                let np, sp;
                node = nodes[nodeid];
                if (node.isroot || node.direction == direct) {
                    if (node.id == this.active_node.id) {
                        continue;
                    }
                    if (('visible' in node._data.layout) && !node._data.layout.visible) {
                        continue;
                    }
                    ns = node.get_size();
                    nl = node.get_location();
                    if (direct == jsMind.direction.right) {
                        if (sx - nl.x - ns.w <= 0) { continue; }
                        distance = Math.abs(sx - nl.x - ns.w) + Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
                        np = { x: nl.x + ns.w - options.line_width, y: nl.y + ns.h / 2 };
                        sp = { x: sx + options.line_width, y: sy + sh / 2 };
                    } else {
                        if (nl.x - sx - sw <= 0) { continue; }
                        distance = Math.abs(sx + sw - nl.x) + Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
                        np = { x: nl.x + options.line_width, y: nl.y + ns.h / 2 };
                        sp = { x: sx + sw - options.line_width, y: sy + sh / 2 };
                    }
                    if (distance < min_distance) {
                        closest_node = node;
                        closest_p = np;
                        shadow_p = sp;
                        min_distance = distance;
                    }
                }
            }
            let result_node = null;
            if (!!closest_node) {
                result_node = {
                    node: closest_node,
                    direction: direct,
                    sp: shadow_p,
                    np: closest_p
                };
            }
            return result_node;
        },

        _lookup_close_node2: function () {
            let root = this.jm.get_root();
            let root_location = root.get_location();
            let root_size = root.get_size();
            let map_size = this.jm.view.size;
            let root_x = root_location.x + root_size.w / 2;

            let sw = this.shadow_w;
            let sh = this.shadow_h;
            let sx = this.shadow.offsetLeft;
            let sy = this.shadow.offsetTop;
            let sc = { x: sx + Math.round(sw / 2), y: sy + Math.round(sh / 2) };

            let ns, nl, nc;

            let direct = (sx + sw / 2) >= root_x ?
                jsMind.direction.right : jsMind.direction.left;
            let nodes = this.jm.mind.nodes;
            let node = null;
            let min_distance = Number.MAX_VALUE;
            let distance = 0;
            let closest_node = null;
            let closest_p = null;
            let shadow_p = null;
            let node_center = null;
            let action = 0;  // 0 add as child ; 1 add as next brother ; 2 add as a pre brother

            if (sx > map_size.w + sw || sx < -sw || sy > map_size.h + sh || sy < -sh) {
                return null;
            }

            for (let nodeid in nodes) {
                let np, sp;
                node = nodes[nodeid];
                if (node.isroot || node.direction == direct) {
                    if (node.id == this.active_node.id) {
                        continue;
                    }
                    if (('visible' in node._data.layout) && !node._data.layout.visible) {
                        continue;
                    }
                    ns = node.get_size();
                    nl = node.get_location();
                    nc = { x: nl.x + ns.w / 2, y: nl.y + ns.h / 2 };
                    if (Math.abs(sc.x - nc.x) > (ns.w + sw) / 2 + 5) {continue;}
                    if (Math.abs(sc.y - nc.y) > (ns.h + sh) / 2 + 5) {continue;}
                    if (direct == jsMind.direction.right) {
                        distance = Math.abs(sc.x - nc.x) + Math.abs(sc.y - nc.y);
                        np = { x: nl.x + ns.w, y: nl.y + ns.h / 2 };
                        sp = { x: scrollX, y: sy + sh / 2 };
                    } else {
                        distance = Math.abs(sc.x - nc.x) + Math.abs(sc.y - nc.y);
                        np = { x: nl.x, y: nl.y + ns.h / 2 };
                        sp = { x: sx + sw, y: sy + sh / 2 };
                    }
                    if (distance < min_distance) {
                        closest_node = node;
                        closest_p = np;
                        shadow_p = sp;
                        min_distance = distance;
                        node_center = nc;
                    }
                }
            }
            let result_node = null;
            if (!!closest_node) {
                let mid_ns_h = Math.round((closest_node.get_size()).h / 2);
                if (closest_node.isroot) {
                    action = 0;
                } else if (sc.y - node_center.y > mid_ns_h) {
                    action = 1;
                } else if (sc.y - node_center.y < -mid_ns_h) {
                    action = 2;
                } else {
                    action = 0;
                }
                result_node = {
                    node: closest_node,
                    direction: direct,
                    sp: shadow_p,
                    np: closest_p,
                    action: action,
                };
            }
            return result_node;
        },

        lookup_close_node: function () {
            let node_data = this._lookup_close_node();
            this._clear_lines();
            this._clear_heightline();
            if (!!node_data) {
                this._magnet_shadow(node_data);
                this.target_node = node_data.node;
                this._set_heightline();
                this.target_direct = node_data.direction;
            }
        },

        lookup_close_node2: function () {
            if (!this.needRefresh) {return;}
            this.needRefresh = false;
            let node_data = this._lookup_close_node2();
            if (!!node_data && !!this.target_node && !node_data.node.isroot && node_data.node.id == this.target_node.id && node_data.action == this.target_action) {
                return;
            }
            this._clear_lines();
            this._clear_heightline();
            this.target_node = null;
            this.target_direct = null;
            if (!!node_data) {
                this._magnet_shadow2(node_data);
                this.target_node = node_data.node;
                this.target_action = node_data.action;
                this._set_heightline();
                this.target_direct = node_data.direction;
            }
        },

        _event_bind: function () {
            let jd = this;
            let container = this.jm.view.container;
            jdom.add_event(container, 'mousedown', function (e) {
                let evt = e;
                jd.dragstart.call(jd, evt);                
            });
            jdom.add_event(container, 'mousemove', function (e) {
                let evt = e;
                jd.throttle(jd.drag, jd.lookup_interval).call(jd, evt);
            });
            jdom.add_event(container, 'mouseup', function (e) {
                let evt = e;
                jd.dragend.call(jd, evt);
            });
            jdom.add_event(container, 'mouseleave', function (e) {
                let evt = e;
                jd.moved = false;
                jd.dragend.call(jd, evt);
            });
            jdom.add_event(container, 'touchstart', function (e) {
                let evt = e;
                jd.dragstart.call(jd, evt, true);
            });
            jdom.add_event(container, 'touchmove', function (e) {
                let evt = e;
                jd.throttle(jd.drag, jd.lookup_interval).call(jd, evt, true); 
            });
            jdom.add_event(container, 'touchend', function (e) {
                let evt = e;
                jd.dragend.call(jd, evt, true);
            });
        },

        dragstart: function (e, isMobile) {
            if (!isMobile && e.buttons != 1) {return;}
            if (!this.jm.get_editable()) { return; }
            if (e.target.className.toLowerCase() === 'jsmind-editor') {return;}	
            let el = e.target;
            if (this.capture) { return; }
            this.active_node = null;
            let jview = this.jm.view;
            let nodeid = jview.get_binded_nodeid(el);
            let isexpander = jview.is_expander(el);
            if (!!nodeid && !isexpander) {
                let node = this.jm.get_node(nodeid);
                if (!node.isroot) {
                    this.reset_shadow(el);
                    this.active_node = node;
                    this.move_x = e.clientX ? e.clientX : e.touches ? e.touches[0].clientX : 0;
                    this.move_y = e.clientY ? e.clientY : e.touches ? e.touches[0].clientY : 0;
                    this.offset_x = el.offsetLeft;
                    this.offset_y = el.offsetTop;
                    if (this.hlookup_delay != 0) {
                        $w.clearTimeout(this.hlookup_delay);
                    }
                    if (this.hlookup_timer != 0) {
                        $w.clearInterval(this.hlookup_timer);
                    }
                    let jd = this;
                    this.hlookup_delay = $w.setTimeout(function () {
                        jd.hlookup_delay = 0;
                        jd.hlookup_timer = $w.setInterval(function () {
                            // jd.lookup_close_node.call(jd);
                            jd.lookup_close_node2.call(jd);
                        }, options.lookup_interval);
                    }, options.lookup_delay);
                    this.capture = true;
                }
            }
        },

        drag: function (e) {
            if (!this.jm.get_editable()) { return; }
            if (this.capture) {
                this.e_canvas.style.zIndex = 3;
                e.preventDefault();
                this.show_shadow();
                this.moved = true;
                clear_selection();
                let px = this.offset_x + ((e.clientX ? e.clientX : e.touches ? e.touches[0].clientX : 0) - this.move_x) / this.jm.view.actualZoom;
                let py = this.offset_y + ((e.clientY ? e.clientY : e.touches ? e.touches[0].clientY : 0) - this.move_y) / this.jm.view.actualZoom;
                if (this.shadow.offsetLeft == px && this.shadow.offsetTop == py) {
                    this.needRefresh = false;
                } else {
                    this.needRefresh = true;
                    this.shadow.style.left = px + 'px';
                    this.shadow.style.top = py + 'px';
                }
                clear_selection();
            }
        },

        dragend: function (e) {
            if (!this.jm.get_editable()) { return; }
            if (this.capture) {
                if (this.hlookup_delay != 0) {
                    $w.clearTimeout(this.hlookup_delay);
                    this.hlookup_delay = 0;
                    this._clear_lines();
                    this._clear_heightline();
                }
                if (this.hlookup_timer != 0) {
                    $w.clearInterval(this.hlookup_timer);
                    this.hlookup_timer = 0;
                    this._clear_lines();
                    this._clear_heightline();
                }
                if (this.moved) {
                    let src_node = this.active_node;
                    let target_node = this.target_node;
                    let target_direct = this.target_direct;
                    let target_action = this.target_action;
                    // this.move_node(src_node, target_node, target_direct);
                    this.move_node2(src_node, target_node, target_direct, target_action);
                }
                this.e_canvas.style.zIndex = -1;
                this.hide_shadow();
            }
            this.moved = false;
            this.capture = false;
        },

        move_node: function (src_node, target_node, target_direct) {
            let shadow_h = this.shadow.offsetTop;
            if (!!target_node && !!src_node && !jsMind.node.inherited(src_node, target_node)) {
                // lookup before_node
                let sibling_nodes = target_node.children;
                let sc = sibling_nodes.length;
                let node = null;
                let delta_y = Number.MAX_VALUE;
                let node_before = null;
                let beforeid = '_last_';
                while (sc--) {
                    node = sibling_nodes[sc];
                    if (node.direction == target_direct && node.id != src_node.id) {
                        let dy = node.get_location().y - shadow_h;
                        if (dy > 0 && dy < delta_y) {
                            delta_y = dy;
                            node_before = node;
                            beforeid = '_first_';
                        }
                    }
                }
                if (!!node_before) { beforeid = node_before.id; }
                this.jm.move_node(src_node.id, beforeid, target_node.id, target_direct);
            }
            this.active_node = null;
            this.target_node = null;
            this.target_direct = null;
        },

        move_node2: function (src_node, target_node, target_direct, action) {
            if (!target_node || !src_node) {
                return;
            }
            if (action == 0) {
                this.jm.move_node(src_node.id, '_last_', target_node.id, target_direct);
            } else if (action == 2) {
                this.jm.move_node(src_node.id, target_node.id, target_node.parent.id, target_direct);
            } else {
                let nextSilibing = null, index = target_node.index;
                let before_id = '_last_';
                while(!nextSilibing && index < target_node.parent.children.length) {
                    nextSilibing = target_node.parent.children[index++];
                    if (nextSilibing.direction != target_direct || nextSilibing.id == src_node.id) {
                        nextSilibing = null;
                    }
                }
                if (nextSilibing) {
                    before_id = nextSilibing.id;
                }
                this.jm.move_node(src_node.id, before_id, target_node.parent.id, target_direct);
            }
            this.active_node = null;
            this.target_node = null;
            this.target_action = 0;
            this.target_direct = null;
        },

        throttle(fn, delay) {
            var timer;
            return function () {
                var _this = this;
                var args = arguments;
                if (timer) {
                    return;
                }
                timer = setTimeout(function () {
                    fn.apply(_this, args);
                    timer = null;
                }, delay)
            }
        },

        jm_event_handle: function (type, data) {
            if (type === jsMind.event_type.resize) {
                this.resize();
            }
        }
    };

    let draggable_plugin = new jsMind.plugin('draggable', function (jm) {
        let jd = new jsMind.draggable(jm);
        jd.init();
        jm.add_event_listener(jsMind.event_type.resize, function (data) {
            jd.jm_event_handle.call(jd, jsMind.event_type.resize, data);
        });
    });

    jsMind.register_plugin(draggable_plugin);

})(window);
