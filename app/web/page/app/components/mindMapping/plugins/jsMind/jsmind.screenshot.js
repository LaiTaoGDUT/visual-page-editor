/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function ($w) {
    'use strict';

    let __name__ = 'jsMind';
    let jsMind = $w[__name__];
    if (!jsMind) { return; }
    if (typeof jsMind.screenshot != 'undefined') { return; }

    let $d = $w.document;
    let $c = function (tag) { return $d.createElement(tag); };

    let css = function (cstyle, property_name) {
        return cstyle.getPropertyValue(property_name);
    };
    let is_visible = function (cstyle) {
        let visibility = css(cstyle, 'visibility');
        let display = css(cstyle, 'display');
        return (visibility !== 'hidden' && display !== 'none');
    };
    let jcanvas = {};

    let DEFAULT_SCREENSHOT_OPTIONS = {
        waterMark: {
            waterMark1: {
                topic: '',
                color: '#000000',
                fontSize: 12,
            },
            waterMark2: {
                topic: '',
                color: '#000000',
                fontSize: 12,
            }
        }
    }

    jcanvas.rect = function (ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
    };

    jcanvas.text_multiline = function (ctx, text, x, y, w, h, lineheight) {
        let line = '';
        let text_len = text.length;
        let chars = text.split('');
        let test_line = null;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        for (let i = 0; i < text_len; i++) {
            test_line = line + chars[i];
            if (ctx.measureText(test_line).width > w && i > 0) {
                ctx.fillText(line, x, y);
                line = chars[i];
                y += lineheight;
            } else {
                line = test_line;
            }
        }
        ctx.fillText(line, x, y);
    };

    jcanvas.text_ellipsis = function (ctx, text, x, y, w, h) {
        let center_y = y + h / 2;
        let _text = jcanvas.fittingString(ctx, text, w);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(_text, x, center_y, w);
    };

    jcanvas.fittingString = function (ctx, text, max_width) {
        let width = ctx.measureText(text).width;
        let ellipsis = '…';
        let ellipsis_width = ctx.measureText(ellipsis).width;
        if (width <= max_width || width <= ellipsis_width) {
            return text;
        } else {
            let len = text.length;
            while (width >= max_width - ellipsis_width && len-- > 0) {
                text = text.substring(0, len);
                width = ctx.measureText(text).width;
            }
            return text + ellipsis;
        }
    };

    jcanvas.image = function (ctx, url, x, y, w, h, r, rotation, callback) {
        let img = new Image();
        img.src = url;
        img.onload = function () {
            ctx.save();
            ctx.translate(x, y);
            ctx.save();
            ctx.beginPath();
            jcanvas.rect(ctx, 0, 0, w, h, r);
            ctx.closePath();
            ctx.clip();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
            ctx.restore();
            !!callback && callback();
        }
    };

    jsMind.screenshot = function (jm) {
        this.jm = jm;
        this.canvas_elem = null;
        this.canvas_ctx = null;
        this._inited = false;
        let opts = {};
        jsMind.util.json.merge(opts, DEFAULT_SCREENSHOT_OPTIONS);
        jsMind.util.json.merge(opts, jm.options.screenshot);
        opts.support_html = jm.options.support_html;
        this.options = opts;
    };

    jsMind.screenshot.prototype = {
        init: function () {
            if (this._inited) { return; }
            let c = $c('canvas');
            let ctx = c.getContext('2d');
            this.canvas_elem = c;
            this.canvas_ctx = ctx;
            this.jm.view.e_panel.appendChild(c);
            this._inited = true;
            this.resize();
        },

        setWaterMark: function (waterMark1, waterMark2) {
            this.options.waterMark.waterMark1.topic = waterMark1;
            this.options.waterMark.waterMark2.topic = waterMark2;
        },

        loadHtml2canvas: function(html2canvas) {
            this.html2canvas = html2canvas;
        },

        shoot: function (callback) {
            this.init();
            this._draw(function () {
                !!callback && callback();
                this.clean();
            }.bind(this));
             this._watermark();
        },

        shootDownload: function (name) {
            this.shoot(function () {
                this._download(name);
            }.bind(this));
        },

        shootAsDataURL: function (callback) {
            this.shoot(function () {
                !!callback && callback(this.canvas_elem.toDataURL());
            }.bind(this));
        },

        resize: function () {
            if (this._inited) {
                this.canvas_elem.width = this.jm.view.size.w;
                this.canvas_elem.height = this.jm.view.size.h;
            }
        },

        clean: function () {
            let c = this.canvas_elem;
            this.canvas_ctx.clearRect(0, 0, c.width, c.height);
        },

        _watermark: function () {
            const waterMarkOpts = this.options.waterMark;
            if (!waterMarkOpts.waterMark1.topic && !waterMarkOpts.waterMark2.topic) {
                return;
            }
            let c = this.canvas_elem;
            let ctx = this.canvas_ctx;
            ctx.textBaseline = 'bottom';
            if (waterMarkOpts.waterMark1.topic) {
                ctx.fillStyle = waterMarkOpts.waterMark1.color;
                ctx.font = `${waterMarkOpts.waterMark1.fontSize}px Verdana,Arial,Helvetica,sans-serif`;
                ctx.textAlign = 'left';
                ctx.fillText(waterMarkOpts.waterMark2.topic, 5.5, c.height - 2.5);
            }
            if (waterMarkOpts.waterMark2.topic) {
                ctx.fillStyle = waterMarkOpts.waterMark2.color;
                ctx.font = `${waterMarkOpts.waterMark2.fontSize}px Verdana,Arial,Helvetica,sans-serif`;
                ctx.textAlign = 'right';
                ctx.fillText(waterMarkOpts.waterMark1.topic, c.width - 5.5, c.height - 2.5);
            }
        },

        _draw: function (callback) {
            let ctx = this.canvas_ctx;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            this._draw_lines(function () {
                this._draw_nodes(callback);
            }.bind(this));
        },

        _draw_lines: function (callback) {
            this.jm.view.graph.copy_to(this.canvas_ctx, callback);
        },

        _draw_nodes: function (callback) {
            let nodes = this.jm.mind.nodes;
            let node;
            for (let nodeid in nodes) {
                node = nodes[nodeid];
                this._draw_node(node);
            }

            function check_nodes_ready() {
                let allOk = true;
                for (let nodeid in nodes) {
                    node = nodes[nodeid];
                    allOk = allOk & node.ready;
                }

                if (!allOk) {
                    $w.setTimeout(check_nodes_ready, 200);
                } else {
                    $w.setTimeout(callback, 200);
                }
            }
            check_nodes_ready();
        },

        _draw_node: function (node) {
            let ctx = this.canvas_ctx;
            let view_data = node._data.view;
            let node_element = view_data.element;
            let ncs = getComputedStyle(node_element);
            if (!is_visible(ncs)) {
                node.ready = true;
                return;
            }

            let bgcolor = css(ncs, 'background-color');
            let round_radius = parseInt(css(ncs, 'border-top-left-radius'));
            let color = css(ncs, 'color');
            let padding_left = parseInt(css(ncs, 'padding-left'));
            let padding_right = parseInt(css(ncs, 'padding-right'));
            let padding_top = parseInt(css(ncs, 'padding-top'));
            let padding_bottom = parseInt(css(ncs, 'padding-bottom'));
            let text_overflow = css(ncs, 'text-overflow');
            let font = css(ncs, 'font-style') + ' ' +
                css(ncs, 'font-variant') + ' ' +
                css(ncs, 'font-weight') + ' ' +
                css(ncs, 'font-size') + '/' + css(ncs, 'line-height') + ' ' +
                css(ncs, 'font-family');

            let rb = {
                x: view_data.abs_x,
                y: view_data.abs_y,
                w: view_data.width + 1,
                h: view_data.height + 1
            };
            let tb = {
                x: rb.x + padding_left,
                y: rb.y + padding_top,
                w: rb.w - padding_left - padding_right,
                h: rb.h - padding_top - padding_bottom
            };

            ctx.font = font;
            ctx.fillStyle = bgcolor;
            ctx.beginPath();
            jcanvas.rect(ctx, rb.x, rb.y, rb.w, rb.h, round_radius);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = color;
            if ('background-image' in node.data) {
                let backgroundUrl = css(ncs, 'background-image').slice(5, -2);
                node.ready = false;
                let rotation = 0;
                if ('background-rotation' in node.data) {
                    rotation = node.data['background-rotation'];
                }
                jcanvas.image(ctx, backgroundUrl, rb.x, rb.y, rb.w, rb.h, round_radius, rotation,
                    () => {
                        if (!!node.topic) {
                            if (text_overflow === 'ellipsis') {
                                jcanvas.text_ellipsis(ctx, node.topic, tb.x, tb.y, tb.w, tb.h);
                            } else {
                                let line_height = parseInt(css(ncs, 'line-height'));
                                jcanvas.text_multiline(ctx, node.topic, tb.x, tb.y, tb.w, tb.h, line_height);
                            }
                        }
                        if (!!view_data.expander) {
                            this._draw_expander(view_data.expander);
                        }
                        node.ready = true;
                    }
                );
            } else {
                if (!!node.topic) {
                    if (text_overflow === 'ellipsis') {
                        jcanvas.text_ellipsis(ctx, node.topic, tb.x, tb.y, tb.w, tb.h);
                    } else {
                        let line_height = parseInt(css(ncs, 'line-height'));
                        jcanvas.text_multiline(ctx, node.topic, tb.x, tb.y, tb.w, tb.h, line_height);
                    }
                }
                if (!!view_data.expander) {
                    this._draw_expander(view_data.expander);
                }
                node.ready = true;
            }
        },

        _draw_html_node: function (node) {

        },

        _draw_expander: function (expander) {
            let ctx = this.canvas_ctx;
            let ncs = getComputedStyle(expander);
            if (!is_visible(ncs)) { return; }

            let style_left = css(ncs, 'left');
            let style_top = css(ncs, 'top');
            let font = css(ncs, 'font');
            let left = parseInt(style_left);
            let top = parseInt(style_top);
            let is_plus = expander.innerHTML === '+';

            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(left + 7, top + 7, 5, 0, Math.PI * 2, true);
            ctx.moveTo(left + 10, top + 7);
            ctx.lineTo(left + 4, top + 7);
            if (is_plus) {
                ctx.moveTo(left + 7, top + 4);
                ctx.lineTo(left + 7, top + 10);
            }
            ctx.closePath();
            ctx.stroke();
        },

        _download: function (imageName) {
            let c = this.canvas_elem;
            let name = imageName || this.jm.mind.name + '.png';

            if (navigator.msSaveBlob && (!!c.msToBlob)) {
                let blob = c.msToBlob();
                navigator.msSaveBlob(blob, name);
            } else {
                let bloburl = this.canvas_elem.toDataURL();
                let anchor = $c('a');
                if ('download' in anchor) {
                    anchor.style.visibility = 'hidden';
                    anchor.href = bloburl;
                    anchor.download = name;
                    $d.body.appendChild(anchor);
                    let evt = $d.createEvent('MouseEvents');
                    evt.initEvent('click', true, true);
                    anchor.dispatchEvent(evt);
                    $d.body.removeChild(anchor);
                } else {
                    location.href = bloburl;
                }
            }
        },

        jm_event_handle: function (type, data) {
            if (type === jsMind.event_type.resize) {
                this.resize();
            }
        }
    };

    let screenshot_plugin = new jsMind.plugin('screenshot', function (jm) {
        let jss = new jsMind.screenshot(jm);
        jm.screenshot = jss;
        jm.shoot = function (callback) {
            jss.shoot(callback);
        };
        jm.shootDownload = function (name) {
            jss.shootDownload(name);
        }
        jm.shootAsDataURL = function () {
            jss.shootAsDataURL();
        }
        jm.setWaterMark = function (waterMark) {
            jss.setWaterMark(waterMark);
        }
        jm.add_event_listener(jsMind.event_type.resize, function (data) {
            jss.jm_event_handle.call(jss, jsMind.event_type.resize, data);
        });
    });

    jsMind.register_plugin(screenshot_plugin);

})(window);
