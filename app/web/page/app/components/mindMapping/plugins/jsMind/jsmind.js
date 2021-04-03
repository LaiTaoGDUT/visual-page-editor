/*
 * Released under BSD License
 * Copyright (c) 2014-2016 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 * 
 * Overwrite by:
 *   Lai Tao at 02.23.2021
 */
; (function ($w) {
	'use strict';
	// set 'jsMind' as the library name.
	// __name__ should be a const value, Never try to change it easily.
	let __name__ = 'jsMind';
	// library version
	let __version__ = '0.4.6';
	// author
	let __author__ = 'hizzgdev@163.com';

	let logger = console;

	// check global variables
	if (typeof module === 'undefined' || !module.exports) {
		if (typeof $w[__name__] != 'undefined') {
			logger.log(__name__ + ' has been already exist.');
			return;
		}
	}

	// shortcut of methods in dom
	let $d = $w.document;
	let $g = function (id) { return $d.getElementById(id); };
	let $c = function (tag) { return $d.createElement(tag); };
	let $t = function (n, t) {if (n.hasChildNodes()) { n.firstChild.nodeValue = t; } else { n.appendChild($d.createTextNode(t)); } };

	let $h = function (n, t) {
		if (t instanceof HTMLElement) {
			n.innerHTML = '';
			n.appendChild(t);
		} else {
			n.innerHTML = t;
		}
	};
	// detect isElement
	let $i = function (el) { return !!el && (typeof el === 'object') && (el.nodeType === 1) && (typeof el.style === 'object') && (typeof el.ownerDocument === 'object'); };
	if (typeof String.prototype.startsWith != 'function') { String.prototype.startsWith = function (p) { return this.slice(0, p.length) === p; }; }

	const DEFAULT_OPTIONS = {
		container: '',   // id of the container
		editable: false, // you can change it in your options
		theme: null,
		mode: 'full',    // full or side
		support_html : false,
		step_stack_len: 20,
		view: {
			engine: 'svg',
			line_width: 2,
			line_color: '#555',
			min_zoom: 0.5,
			max_zoom: 2,
			zoom_step: 0.1,
			line_style: 'default',
		},
		layout: {
			hspace: 30,
			vspace: 30,
			pspace: 13,
		},
		default_event_handle: {
			enable_mousedown_handle: true,
			enable_click_handle: true,
			enable_dblclick_handle: true
		},
		shortcut: {
			enable: true,
			newNodeText: '新节点',
			handles: {
			},
			mapping: {
				addchild: 45, // Insert
				addbrother: 13, // Enter
				editnode: 113,// F2
				delnode: 46, // Delete
				toggle: 32, // Space
				left: 37, // Left
				up: 38, // Up
				right: 39, // Right
				down: 40, // Down
				back: 4096 + 90,  // Ctrl + Z
				forward: 4096 + 89, // Ctrl + Y
			}
		},
		extra: {
			quickZoom: true,
		}
	};

	// core object
	let jm = function (options) {
		jm.current = this;

		this.version = __version__;
		let opts = {};
		jm.util.json.merge(opts, DEFAULT_OPTIONS);
		jm.util.json.merge(opts, options);

		if (!opts.container) {
			logger.error('the options.container should not be null or empty.');
			return;
		}
		this.options = opts;
		this.inited = false;
		this.mind = null;
		this.stepStack = [];
		this.currentStep = -1;
		this.isStepBack = false;
		this.isStepForward = false;
		this.event_handles = {};
		for(let key of Object.keys(jm.event_type)) {
			this.event_handles[key] = [];
		}
		this.init();
	};

	// ============= static object =============================================
	jm.direction = { left: -1, center: 0, right: 1 };
	jm.event_type = {
		inited: 'inited',
		show: 'show',
		resize: 'resize',
		edit: 'edit',
		select: 'select',
		addNode: 'addNode', // add a children for selected node
		updateNode: 'updateNode',
		insertNode: 'insertNode', // add a sibling before or after selected node
		removeNode: 'removeNode', // remove selected node
		moveNode: 'moveNode', // move selected node
		expandNode: 'expandNode',
		collapseNode: 'collapseNode',
		setTheme: 'setTheme',
		setLine: 'setLine',
	};
	jm.key = { meta: 1 << 13, ctrl: 1 << 12, alt: 1 << 11, shift: 1 << 10 };

	jm.node = function (sId, iIndex, sTopic, oData, bIsRoot, oParent, eDirection, bExpanded) {
		if (!sId) { logger.error('invalid nodeid'); return; }
		if (typeof iIndex != 'number') { logger.error('invalid node index'); return; }
		if (typeof bExpanded === 'undefined') { bExpanded = true; }
		this.id = sId;
		this.index = iIndex;
		this.topic = sTopic;
		this.data = oData || {};
		this.isroot = bIsRoot;
		this.parent = oParent;
		this.direction = eDirection;
		this.expanded = !!bExpanded;
		this.children = [];
		this._data = {};
	};

	jm.node.compare = function (node1, node2) {
		// '-1' is alwary the last
		let r = 0;
		let i1 = node1.index;
		let i2 = node2.index;
		if (i1 >= 0 && i2 >= 0) {
			r = i1 - i2;
		} else if (i1 == -1 && i2 == -1) {
			r = 0;
		} else if (i1 == -1) {
			r = 1;
		} else if (i2 == -1) {
			r = -1;
		} else {
			r = 0;
		}
		//logger.debug(i1+' <> '+i2+'  =  '+r);
		return r;
	};

	jm.node.inherited = function (pnode, node) {
		if (!!pnode && !!node) {
			if (pnode.id === node.id) {
				return true;
			}
			if (pnode.isroot) {
				return true;
			}
			let pid = pnode.id;
			let p = node;
			while (!p.isroot) {
				p = p.parent;
				if (p.id === pid) {
					return true;
				}
			}
		}
		return false;
	};

	jm.node.prototype = {
		get_location: function () {
			let vd = this._data.view;
			return {
				x: vd.abs_x,
				y: vd.abs_y
			};
		},
		get_size: function () {
			let vd = this._data.view;
			return {
				w: vd.width,
				h: vd.height
			}
		}
	};


	jm.mind = function () {
		this.name = null;
		this.author = null;
		this.version = null;
		this.root = null;
		this.selected = null;
		this.selected_data = {};
		this.wait_insert_data = {};
		this.nodes = {};
	};

	jm.mind.prototype = {
		get_node: function (nodeid) {
			if (nodeid in this.nodes) {
				return this.nodes[nodeid];
			} else {
				logger.warn('the node[id=' + nodeid + '] can not be found');
				return null;
			}
		},

		get_node_style: function (nodeid) {
			if (nodeid in this.nodes) {
				return this.nodes[nodeid].data;
			} else {
				logger.warn('the node[id=' + nodeid + '] can not be found');
				return null;
			}
		},

		set_root: function (nodeid, topic, data) {
			if (this.root == null) {
				this.root = new jm.node(nodeid, 0, topic, data, true);
				this._put_node(this.root);
			} else {
				logger.error('root node is already exist');
			}
		},

		add_node: function (parent_node, nodeid, topic, data, idx, direction, expanded) {
			if (!jm.util.is_node(parent_node)) {
				let the_parent_node = this.get_node(parent_node);
				if (!the_parent_node) {
					logger.error('the parent_node[id=' + parent_node + '] can not be found.');
					return null;
				} else {
					return this.add_node(the_parent_node, nodeid, topic, data, idx, direction, expanded);
				}
			}
			let nodeindex = idx || -1;
			let node = null;
			if (parent_node.isroot) {
				let d = jm.direction.right;
				if (isNaN(direction)) {
					let children = parent_node.children;
					let children_len = children.length;
					let r = 0;
					for (let i = 0; i < children_len; i++) { if (children[i].direction === jm.direction.left) { r--; } else { r++; } }
					d = (children_len > 1 && r > 0) ? jm.direction.left : jm.direction.right;
				} else {
					d = (direction != jm.direction.left) ? jm.direction.right : jm.direction.left;
				}
				node = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, d, expanded);
			} else {
				node = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, parent_node.direction, expanded);
			}
			if (this._put_node(node)) {
				parent_node.children.push(node);
				this._reindex(parent_node);
			} else {
				logger.error('fail, the nodeid \'' + node.id + '\' has been already exist.');
				node = null;
			}
			return node;
		},

		insert_node_before: function (node_before, nodeid, topic, data) {
			if (!jm.util.is_node(node_before)) {
				let the_node_before = this.get_node(node_before);
				if (!the_node_before) {
					logger.error('the node_before[id=' + node_before + '] can not be found.');
					return null;
				} else {
					return this.insert_node_before(the_node_before, nodeid, topic, data);
				}
			}
			let node_index = node_before.index - 0.5;
			return this.add_node(node_before.parent, nodeid, topic, data, node_index);
		},

		get_node_before: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return null;
				} else {
					return this.get_node_before(the_node);
				}
			}
			if (node.isroot) { return null; }
			let idx = node.index - 2;
			if (idx >= 0) {
				return node.parent.children[idx];
			} else {
				return null;
			}
		},

		insert_node_after: function (node_after, nodeid, topic, data) {
			if (!jm.util.is_node(node_after)) {
				let the_node_after = this.get_node(node_after);
				if (!the_node_after) {
					logger.error('the node_after[id=' + node_after + '] can not be found.');
					return null;
				} else {
					return this.insert_node_after(the_node_after, nodeid, topic, data);
				}
			}
			let node_index = node_after.index + 0.5;
			return this.add_node(node_after.parent, nodeid, topic, data, node_index);
		},

		get_node_after: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return null;
				} else {
					return this.get_node_after(the_node);
				}
			}
			if (node.isroot) { return null; }
			let idx = node.index;
			let brothers = node.parent.children;
			if (brothers.length >= idx) {
				return node.parent.children[idx];
			} else {
				return null;
			}
		},

		move_node: function (node, beforeid, parentid, direction) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return null;
				} else {
					return this.move_node(the_node, beforeid, parentid, direction);
				}
			}
			if (!parentid) {
				parentid = node.parent.id;
			}
			return this._move_node(node, beforeid, parentid, direction);
		},

		_flow_node_direction: function (node, direction) {
			if (typeof direction === 'undefined') {
				direction = node.direction;
			} else {
				node.direction = direction;
			}
			let len = node.children.length;
			while (len--) {
				this._flow_node_direction(node.children[len], direction);
			}
		},

		_move_node_internal: function (node, beforeid) {
			if (!!node && !!beforeid) {
				if (beforeid == '_last_') {
					node.index = -1;
					this._reindex(node.parent);
				} else if (beforeid == '_first_') {
					node.index = 0;
					this._reindex(node.parent);
				} else {
					let node_before = (!!beforeid) ? this.get_node(beforeid) : null;
					if (node_before != null && node_before.parent != null && node_before.parent.id == node.parent.id) {
						node.index = node_before.index - 0.5;
						this._reindex(node.parent);
					}
				}
			}
			return node;
		},

		_move_node: function (node, beforeid, parentid, direction) {
			if (!!node && !!parentid) {
				if (node.parent.id != parentid) {
					// remove from parent's children
					let sibling = node.parent.children;
					let si = sibling.length;
					while (si--) {
						if (sibling[si].id == node.id) {
							sibling.splice(si, 1);
							break;
						}
					}
					node.parent = this.get_node(parentid);
					node.parent.children.push(node);
				}

				if (node.parent.isroot) {
					if (direction == jm.direction.left) {
						node.direction = direction;
					} else {
						node.direction = jm.direction.right;
					}
				} else {
					node.direction = node.parent.direction;
				}
				this._move_node_internal(node, beforeid);
				this._flow_node_direction(node);
			}
			return node;
		},

		remove_node: function (node, betch) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return false;
				} else {
					return this.remove_node(the_node);
				}
			}
			if (!node) {
				logger.error('fail, the node can not be found');
				return false;
			}
			if (node.isroot) {
				logger.error('fail, can not remove root node');
				return false;
			}
			if (this.selected != null && this.selected.id == node.id) {
				this.selected = null;
			}
			// clean all subordinate nodes
			let children = node.children;
			let ci = children.length;
			while (ci--) {
				this.remove_node(children[ci], true);
			}
			// clean all children
			children.length = 0;
			// remove from parent's children
			let sibling = node.parent.children;
			let si = sibling.length;
			while (si--) {
				if (sibling[si].id == node.id) {
					sibling.splice(si, 1);
					break;
				}
			}
			if (!betch) {
				this._reindex(node.parent);
			}
			// remove from global nodes
			delete this.nodes[node.id];
			// clean all properties
			for (let k in node) {
				delete node[k];
			}
			// remove it's self
			node = null;
			//delete node;
			return true;
		},

		_put_node: function (node) {
			if (node.id in this.nodes) {
				logger.warn('the nodeid \'' + node.id + '\' has been already exist.');
				return false;
			} else {
				this.nodes[node.id] = node;
				return true;
			}
		},

		_reindex: function (node) {
			if (node instanceof jm.node) {
				node.children.sort(jm.node.compare);
				for (let i = 0; i < node.children.length; i++) {
					node.children[i].index = i + 1;
				}
			}
		},
	};

	jm.format = {
		node_tree: {
			example: {
				"meta": {
					"name": __name__,
					"author": __author__,
					"version": __version__
				},
				"format": "node_tree",
				"data": { "id": "root", "topic": "jsMind Example" }
			},
			get_mind: function (source) {
				let df = jm.format.node_tree;
				let mind = new jm.mind();
				mind.name = source.meta.name;
				mind.author = source.meta.author;
				mind.version = source.meta.version;
				mind.selected_data = source.selected_data || {};
				mind.wait_insert_data = source.wait_insert_data || {};
				df._parse(mind, source.data);
				return mind;
			},
			get_data: function (mind) {
				let df = jm.format.node_tree;
				let json = {};
				json.meta = {
					name: mind.name,
					author: mind.author,
					version: mind.version
				};
				json.style = {
					selected: mind.selected_data,
					waitInsert: mind.wait_insert_data
				}
				json.format = 'node_tree';
				json.data = df._buildnode(mind.root);
				return json;
			},

			_parse: function (mind, node_root) {
				let df = jm.format.node_tree;
				let data = df._extract_data(node_root);
				mind.set_root(node_root.id, node_root.topic, data);
				if ('children' in node_root) {
					let children = node_root.children;
					for (let i = 0; i < children.length; i++) {
						df._extract_subnode(mind, mind.root, children[i]);
					}
				}
			},

			_extract_data: function (node_json) {
				let data = {};
				for (let k in node_json) {
					if (k == 'id' || k == 'topic' || k == 'children' || k == 'direction' || k == 'expanded') {
						continue;
					}
					data[k] = node_json[k];
				}
				return data;
			},

			_extract_subnode: function (mind, node_parent, node_json) {
				let df = jm.format.node_tree;
				let data = df._extract_data(node_json);
				let d = null;
				if (node_parent.isroot) {
					d = node_json.direction == 'left' ? jm.direction.left : jm.direction.right;
				}
				let node = mind.add_node(node_parent, node_json.id, node_json.topic, data, null, d, node_json.expanded);
				if ('children' in node_json) {
					let children = node_json.children;
					for (let i = 0; i < children.length; i++) {
						df._extract_subnode(mind, node, children[i]);
					}
				}
			},

			_buildnode: function (node) {
				let df = jm.format.node_tree;
				if (!(node instanceof jm.node)) { return; }
				let o = {
					id: node.id,
					topic: node.topic,
					expanded: node.expanded
				};
				if (!!node.parent && node.parent.isroot) {
					o.direction = node.direction == jm.direction.left ? 'left' : 'right';
				}
				if (node.data != null) {
					let node_data = node.data;
					for (let k in node_data) {
						o[k] = node_data[k];
					}
				}
				let children = node.children;
				if (children.length > 0) {
					o.children = [];
					for (let i = 0; i < children.length; i++) {
						o.children.push(df._buildnode(children[i]));
					}
				}
				return o;
			}
		},

		node_array: {
			example: {
				"meta": {
					"name": __name__,
					"author": __author__,
					"version": __version__
				},
				"format": "node_array",
				"data": [
					{ "id": "root", "topic": "jsMind Example", "isroot": true }
				]
			},

			get_mind: function (source) {
				let df = jm.format.node_array;
				let mind = new jm.mind();
				mind.name = source.meta.name;
				mind.author = source.meta.author;
				mind.version = source.meta.version;
				mind.selected_data = source.selected_data || {};
				mind.wait_insert_data = source.wait_insert_data || {};
				df._parse(mind, source.data);
				return mind;
			},

			get_data: function (mind) {
				let df = jm.format.node_array;
				let json = {};
				json.meta = {
					name: mind.name,
					author: mind.author,
					version: mind.version
				};
				json.format = 'node_array';
				json.data = [];
				df._array(mind, json.data);
				return json;
			},

			_parse: function (mind, node_array) {
				let df = jm.format.node_array;
				let narray = node_array.slice(0);
				// reverse array for improving looping performance
				narray.reverse();
				let root_id = df._extract_root(mind, narray);
				if (!!root_id) {
					df._extract_subnode(mind, root_id, narray);
				} else {
					logger.error('root node can not be found');
				}
			},

			_extract_root: function (mind, node_array) {
				let df = jm.format.node_array;
				let i = node_array.length;
				while (i--) {
					if ('isroot' in node_array[i] && node_array[i].isroot) {
						let root_json = node_array[i];
						let data = df._extract_data(root_json);
						mind.set_root(root_json.id, root_json.topic, data);
						node_array.splice(i, 1);
						return root_json.id;
					}
				}
				return null;
			},

			_extract_subnode: function (mind, parentid, node_array) {
				let df = jm.format.node_array;
				let i = node_array.length;
				let node_json = null;
				let data = null;
				let extract_count = 0;
				while (i--) {
					node_json = node_array[i];
					if (node_json.parentid == parentid) {
						data = df._extract_data(node_json);
						let d = null;
						let node_direction = node_json.direction;
						if (!!node_direction) {
							d = node_direction == 'left' ? jm.direction.left : jm.direction.right;
						}
						mind.add_node(parentid, node_json.id, node_json.topic, data, null, d, node_json.expanded);
						node_array.splice(i, 1);
						extract_count++;
						let sub_extract_count = df._extract_subnode(mind, node_json.id, node_array);
						if (sub_extract_count > 0) {
							// reset loop index after extract subordinate node
							i = node_array.length;
							extract_count += sub_extract_count;
						}
					}
				}
				return extract_count;
			},

			_extract_data: function (node_json) {
				let data = {};
				for (let k in node_json) {
					if (k == 'id' || k == 'topic' || k == 'parentid' || k == 'isroot' || k == 'direction' || k == 'expanded') {
						continue;
					}
					data[k] = node_json[k];
				}
				return data;
			},

			_array: function (mind, node_array) {
				let df = jm.format.node_array;
				df._array_node(mind.root, node_array);
			},

			_array_node: function (node, node_array) {
				let df = jm.format.node_array;
				if (!(node instanceof jm.node)) { return; }
				let o = {
					id: node.id,
					topic: node.topic,
					expanded: node.expanded
				};
				if (!!node.parent) {
					o.parentid = node.parent.id;
				}
				if (node.isroot) {
					o.isroot = true;
				}
				if (!!node.parent && node.parent.isroot) {
					o.direction = node.direction == jm.direction.left ? 'left' : 'right';
				}
				if (node.data != null) {
					let node_data = node.data;
					for (let k in node_data) {
						o[k] = node_data[k];
					}
				}
				node_array.push(o);
				let ci = node.children.length;
				for (let i = 0; i < ci; i++) {
					df._array_node(node.children[i], node_array);
				}
			},
		},

		freemind: {
			example: {
				"meta": {
					"name": __name__,
					"author": __author__,
					"version": __version__
				},
				"format": "freemind",
				"data": "<map version=\"1.0.1\"><node ID=\"root\" TEXT=\"freemind Example\"/></map>"
			},
			get_mind: function (source) {
				let df = jm.format.freemind;
				let mind = new jm.mind();
				mind.name = source.meta.name;
				mind.author = source.meta.author;
				mind.version = source.meta.version;
				mind.selected_data = source.selected_data || {};
				mind.wait_insert_data = source.wait_insert_data || {};
				let xml = source.data;
				let xml_doc = df._parse_xml(xml);
				let xml_root = df._find_root(xml_doc);
				df._load_node(mind, null, xml_root);
				return mind;
			},

			get_data: function (mind) {
				let df = jm.format.freemind;
				let json = {};
				json.meta = {
					name: mind.name,
					author: mind.author,
					version: mind.version
				};
				json.format = 'freemind';
				let xmllines = [];
				xmllines.push('<map version=\"1.0.1\">');
				df._buildmap(mind.root, xmllines);
				xmllines.push('</map>');
				json.data = xmllines.join(' ');
				return json;
			},

			_parse_xml: function (xml) {
				let xml_doc = null;
				if (window.DOMParser) {
					let parser = new DOMParser();
					xml_doc = parser.parseFromString(xml, 'text/xml');
				} else { // Internet Explorer
					xml_doc = new ActiveXObject('Microsoft.XMLDOM');
					xml_doc.async = false;
					xml_doc.loadXML(xml);
				}
				return xml_doc;
			},

			_find_root: function (xml_doc) {
				let nodes = xml_doc.childNodes;
				let node = null;
				let root = null;
				let n = null;
				for (let i = 0; i < nodes.length; i++) {
					n = nodes[i];
					if (n.nodeType == 1 && n.tagName == 'map') {
						node = n;
						break;
					}
				}
				if (!!node) {
					let ns = node.childNodes;
					node = null;
					for (let i = 0; i < ns.length; i++) {
						n = ns[i];
						if (n.nodeType == 1 && n.tagName == 'node') {
							node = n;
							break;
						}
					}
				}
				return node;
			},

			_load_node: function (mind, parent_id, xml_node) {
				let df = jm.format.freemind;
				let node_id = xml_node.getAttribute('ID');
				let node_topic = xml_node.getAttribute('TEXT');
				// look for richcontent
				if (node_topic == null) {
					let topic_children = xml_node.childNodes;
					let topic_child = null;
					for (let i = 0; i < topic_children.length; i++) {
						topic_child = topic_children[i];
						//logger.debug(topic_child.tagName);
						if (topic_child.nodeType == 1 && topic_child.tagName === 'richcontent') {
							node_topic = topic_child.textContent;
							break;
						}
					}
				}
				let node_data = df._load_attributes(xml_node);
				let node_expanded = ('expanded' in node_data) ? (node_data.expanded == 'true') : true;
				delete node_data.expanded;

				let node_position = xml_node.getAttribute('POSITION');
				let node_direction = null;
				if (!!node_position) {
					node_direction = node_position == 'left' ? jm.direction.left : jm.direction.right;
				}
				//logger.debug(node_position +':'+ node_direction);
				if (!!parent_id) {
					mind.add_node(parent_id, node_id, node_topic, node_data, null, node_direction, node_expanded);
				} else {
					mind.set_root(node_id, node_topic, node_data);
				}
				let children = xml_node.childNodes;
				let child = null;
				for (let i = 0; i < children.length; i++) {
					child = children[i];
					if (child.nodeType == 1 && child.tagName == 'node') {
						df._load_node(mind, node_id, child);
					}
				}
			},

			_load_attributes: function (xml_node) {
				let children = xml_node.childNodes;
				let attr = null;
				let attr_data = {};
				for (let i = 0; i < children.length; i++) {
					attr = children[i];
					if (attr.nodeType == 1 && attr.tagName === 'attribute') {
						attr_data[attr.getAttribute('NAME')] = attr.getAttribute('VALUE');
					}
				}
				return attr_data;
			},

			_buildmap: function (node, xmllines) {
				let df = jm.format.freemind;
				let pos = null;
				if (!!node.parent && node.parent.isroot) {
					pos = node.direction === jm.direction.left ? 'left' : 'right';
				}
				xmllines.push('<node');
				xmllines.push('ID=\"' + node.id + '\"');
				if (!!pos) {
					xmllines.push('POSITION=\"' + pos + '\"');
				}
				xmllines.push('TEXT=\"' + node.topic + '\">');

				// store expanded status as an attribute
				xmllines.push('<attribute NAME=\"expanded\" VALUE=\"' + node.expanded + '\"/>');

				// for attributes
				let node_data = node.data;
				if (node_data != null) {
					for (let k in node_data) {
						xmllines.push('<attribute NAME=\"' + k + '\" VALUE=\"' + node_data[k] + '\"/>');
					}
				}

				// for children
				let children = node.children;
				for (let i = 0; i < children.length; i++) {
					df._buildmap(children[i], xmllines);
				}

				xmllines.push('</node>');
			},
		},
	};

	// ============= utility object =============================================

	jm.util = {
		is_node: function (node) {
			return !!node && node instanceof jm.node;
		},
		ajax: {
			_xhr: function () {
				let xhr = null;
				if (window.XMLHttpRequest) {
					xhr = new XMLHttpRequest();
				} else {
					try {
						xhr = new ActiveXObject('Microsoft.XMLHTTP');
					} catch (e) { }
				}
				return xhr;
			},
			_eurl: function (url) {
				return encodeURIComponent(url);
			},
			request: function (url, param, method, callback, fail_callback) {
				let a = jm.util.ajax;
				let p = null;
				let tmp_param = [];
				for (let k in param) {
					tmp_param.push(a._eurl(k) + '=' + a._eurl(param[k]));
				}
				if (tmp_param.length > 0) {
					p = tmp_param.join('&');
				}
				let xhr = a._xhr();
				if (!xhr) { return; }
				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						if (xhr.status == 200 || xhr.status == 0) {
							if (typeof callback === 'function') {
								let data = jm.util.json.string2json(xhr.responseText);
								if (data != null) {
									callback(data);
								} else {
									callback(xhr.responseText);
								}
							}
						} else {
							if (typeof fail_callback === 'function') {
								fail_callback(xhr);
							} else {
								logger.error('xhr request failed.', xhr);
							}
						}
					}
				}
				method = method || 'GET';
				xhr.open(method, url, true);
				xhr.setRequestHeader('If-Modified-Since', '0');
				if (method == 'POST') {
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
					xhr.send(p);
				} else {
					xhr.send();
				}
			},
			get: function (url, callback) {
				return jm.util.ajax.request(url, {}, 'GET', callback);
			},
			post: function (url, param, callback) {
				return jm.util.ajax.request(url, param, 'POST', callback);
			}
		},

		dom: {
			//target,eventType,handler
			add_event: function (t, e, h) {
				if (!!t.addEventListener) {
					t.addEventListener(e, h, false);
				} else {
					t.attachEvent('on' + e, h);
				}
			}
		},

		file: {
			read: function (file_data, fn_callback) {
				let reader = new FileReader();
				reader.onload = function () {
					if (typeof fn_callback === 'function') {
						fn_callback(this.result, file_data.name);
					}
				};
				reader.readAsText(file_data);
			},

			save: function (file_data, type, name) {
				let blob;
				if (typeof $w.Blob === 'function') {
					blob = new Blob([file_data], { type: type });
				} else {
					let BlobBuilder = $w.BlobBuilder || $w.MozBlobBuilder || $w.WebKitBlobBuilder || $w.MSBlobBuilder;
					let bb = new BlobBuilder();
					bb.append(file_data);
					blob = bb.getBlob(type);
				}
				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, name);
				} else {
					let URL = $w.URL || $w.webkitURL;
					let bloburl = URL.createObjectURL(blob);
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
			}
		},

		json: {
			json2string: function (json) {
				if (!!JSON) {
					try {
						let json_str = JSON.stringify(json);
						return json_str;
					} catch (e) {
						logger.warn(e);
						logger.warn('can not convert to string');
						return null;
					}
				}
			},
			string2json: function (json_str) {
				if (!!JSON) {
					try {
						let json = JSON.parse(json_str);
						return json;
					} catch (e) {
						logger.warn(e);
						logger.warn('can not parse to json');
						return null;
					}
				}
			},
			merge: function (b, a) {
				for (let o in a) {
					if (o in b) {
						if (typeof b[o] === 'object' &&
							Object.prototype.toString.call(b[o]).toLowerCase() == '[object object]' &&
							!b[o].length) {
							jm.util.json.merge(b[o], a[o]);
						} else {
							b[o] = a[o];
						}
					} else {
						b[o] = a[o];
					}
				}
				return b;
			}
		},

		uuid: {
			newid: function () {
				return (new Date().getTime().toString(16) + Math.random().toString(16).substr(2)).substr(2, 16);
			}
		},

		text: {
			is_empty: function (s) {
				if (!s) { return true; }
				return s.replace(/\s*/, '').length == 0;
			}
		}
	};

	jm.prototype = {
		init: function () {
			if (this.inited) { return; }
			this.inited = true;

			let opts = this.options;

			let opts_layout = {
				mode: opts.mode,
				hspace: opts.layout.hspace,
				vspace: opts.layout.vspace,
				pspace: opts.layout.pspace
			}
			let opts_view = {
				container: opts.container,
				engine: opts.view.engine,
				support_html: opts.support_html,
				line_width: opts.view.line_width,
				line_color: opts.view.line_color,
				line_style: opts.view.line_style,
				min_zoom: opts.view.min_zoom,
				max_zoom: opts.view.max_zoom,
				zoom_step: opts.view.zoom_step,
			};
			// create instance of function provider
			this.data = new jm.data_provider(this);
			this.layout = new jm.layout_provider(this, opts_layout);
			this.view = new jm.view_provider(this, opts_view);
			this.shortcut = new jm.shortcut_provider(this, opts.shortcut);

			this.data.init();
			this.layout.init();
			this.view.init();
			this.shortcut.init();

			this._init_quick_zoom(opts.extra.quickZoom);
			this._event_bind();

			jm.init_plugins(this);
			this.invoke_event_handle(jm.event_type.inited, {});
		},

		enable_edit: function () {
			this.options.editable = true;
		},

		disable_edit: function () {
			this.options.editable = false;
		},

		// call enable_event_handle('dblclick')
		// options are 'mousedown', 'click', 'dblclick'
		enable_event_handle: function (event_handle) {
			this.options.default_event_handle['enable_' + event_handle + '_handle'] = true;
		},

		// call disable_event_handle('dblclick')
		// options are 'mousedown', 'click', 'dblclick'
		disable_event_handle: function (event_handle) {
			this.options.default_event_handle['enable_' + event_handle + '_handle'] = false;
		},

		get_editable: function () {
			return this.options.editable;
		},

		_save_step: function (func, ...args) {
			if (this.isStepBack) {
				this.stepStack[this.currentStep + 1] = { func, args };
			} else if (this.isStepForward) {
				this.stepStack[this.currentStep] = { func, args };
			} else {
				if (this.options.step_stack_len <= 0) {return;}
				this.stepStack.splice(this.currentStep + 1);
				this.stepStack.push({ func, args });
				while (this.stepStack.length > this.options.step_stack_len) {
					this.stepStack.shift();
				}
				this.currentStep = this.stepStack.length - 1;
			}
			this.isStepBack = false;
			this.isStepForward = false;
		},

		_step_back: function () {
			if (this.currentStep < 0) {return false;}
			const step = this.stepStack[this.currentStep];
			this.currentStep = this.currentStep - 1;
			this.isStepBack = true;
			this[step.func](...step.args);
			return this.currentStep < 0;
		},

		_step_forward: function () {
			if (this.currentStep >= this.stepStack.length - 1) {return false;}
			const step = this.stepStack[this.currentStep + 1];
			this.currentStep = this.currentStep + 1;
			this.isStepForward = true;
			this[step.func](...step.args);
			return this.currentStep >= this.stepStack.length - 1;
		},

		set_theme: function (theme) {
			if (!this.get_editable()) {return;}
			let theme_old = this.options.theme;
			this.options.theme = (!!theme) ? theme : null;
			if (theme_old != this.options.theme) {
				this.view.reset_theme();
				this.view.reset_custom_style();
				this._save_step('set_theme', theme_old);
				this.invoke_event_handle(jm.event_type.setTheme, { evt: 'set_theme', data: { theme } });
			}
		},

		set_line_width: function (line_width) {
			if (!this.get_editable()) {return;}
			line_width = parseInt(line_width);
			if (typeof line_width != 'number') {return;}
			let line_width_old = this.options.view.line_width;
			if (line_width == line_width_old) {return;}
			this.view.opts.line_width = this.options.view.line_width = line_width;
			this.view.show_lines();
			this._save_step('set_line_width', line_width_old);
			this.invoke_event_handle(jm.event_type.setLine, { evt: 'set_line_width', data: { line_width } });
		},

		set_line_color: function (line_color) {
			if (!this.get_editable()) {return;}
			if (typeof line_color != 'string') {return;}
			let line_color_old = this.options.view.line_color;
			if (line_color_old == line_color) {return;}
			this.view.opts.line_color = this.options.view.line_color = line_color;
			this.view.show_lines();
			this._save_step('set_line_color', line_color_old);
			this.invoke_event_handle(jm.event_type.setLine, { evt: 'set_line_color', data: { line_color } });
		},

		set_line_style: function (line_style) {
			if (!this.get_editable()) {return;}
			if (typeof line_style != 'string') {return;}
			let line_style_old = this.options.view.line_style;
			if (line_style_old == line_style) {return;}
			this.view.opts.line_style = this.options.view.line_style = line_style;
			this.view.show_lines();
			this._save_step('set_line_style', line_style_old);
			this.invoke_event_handle(jm.event_type.setLine, { evt: 'set_line_style', data: { line_style } });
		},

		zoom_in: function () {
			this.view.zoom_in();
		},
		zoom_out: function () {
			this.view.zoom_out();
		},
		set_zoom: function (zoom) {
			if (typeof zoom != 'number') {
				logger.error('the zoom must be a number');
				return;
			}
			if (zoom > this.view.maxZoom || zoom < this.view.minZoom) {
				logger.error(`the zoom must be between ${this.view.minZoom} and ${this.view.maxZoom}`);
				return;
			}
			this.view.set_zoom(zoom);
		},
		_init_quick_zoom: function (lock) {
			if (!lock) { return; }
            let container = this.view.container;
			jm.util.dom.add_event(container, 'wheel', (e) => {
				if (e.ctrlKey === true || e.metaKey === true) {
					e.preventDefault();
					if (e.deltaY > 0) {
						this.zoom_out();
					} else {
						this.zoom_in();
					}
				}
			});
		},
		_event_bind: function () {
			this.view.add_event(this, 'mousedown', this.mousedown_handle, this.view.e_container);
			this.view.add_event(this, 'click', this.click_handle);
			this.view.add_event(this, 'dblclick', this.dblclick_handle);
		},

		mousedown_handle: function (e) {
			if (e.buttons != 1) {return;}
			if (!this.options.default_event_handle['enable_mousedown_handle']) {
				return;
			}
			let element = e.target;
			let nodeid = this.view.get_binded_nodeid(element);
			let isexpander = this.view.is_expander(element);
			if (!!nodeid) {
				if (!isexpander) {
					this.select_node(nodeid);
				}
			} else {
				this.select_clear();
			}
		},

		click_handle: function (e) {
			if (!this.options.default_event_handle['enable_click_handle']) {
				return;
			}
			let element = e.target;
			let isexpander = this.view.is_expander(element);
			if (isexpander) {
				let nodeid = this.view.get_binded_nodeid(element);
				if (!!nodeid) {
					this.toggle_node(nodeid);
				}
			}
		},

		dblclick_handle: function (e) {
			if (!this.options.default_event_handle['enable_dblclick_handle']) {
				return;
			}
			if (this.get_editable()) {
				let element = e.target;
				let isexpander = this.view.is_expander(element);
				if (!isexpander) {
					let nodeid = this.view.get_binded_nodeid(element);
					if (!!nodeid) {
						this.begin_edit(nodeid);
					}
				}
			}
		},

		begin_edit: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return false;
				} else {
					return this.begin_edit(the_node);
				}
			}
			if (this.get_editable()) {
				this.view.edit_node_begin(node);
			} else {
				logger.error('fail, this mind map is not editable.');
				return;
			}
		},

		end_edit: function () {
			this.view.edit_node_end();
		},

		toggle_node: function (node) {
			if (!this.get_editable()) {return;}
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.toggle_node(the_node);
				}
			}
			if (node.isroot) { return; }
			this.view.save_location(node);
			let toggleStatus = this.layout.toggle_node(node);
			if (toggleStatus == 1) {
				this._save_step('expand_node', node.id);
			} else if (toggleStatus == 2){
				this._save_step('collapse_node', node.id);
			}
			this.view.relayout();
			this.view.restore_location(node);
			
		},

		can_node_expand: function (node) {
			return this.layout.can_node_expand(node);
		},

		expand_node: function (node) {
			if (!this.get_editable()) {return;}
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.expand_node(the_node);
				}
			}
			if (node.isroot) {return;}
			if (!this.can_node_expand(node)) {return;}
			this.view.save_location(node);
			this.layout.expand_node(node);
			this.view.relayout();
			this.view.restore_location(node);
			this._save_step('collapse_node', node.id);
		},

		can_node_collapse: function (node) {
			return this.layout.can_node_collapse(node);
		},

		collapse_node: function (node) {
			if (!this.get_editable()) {return;}
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.collapse_node(the_node);
				}
			}
			if (node.isroot) {return;}
			if (!this.can_node_collapse(node)) {return;}
			this.view.save_location(node);
			this.layout.collapse_node(node);
			this.view.relayout();
			this.view.restore_location(node);
			this._save_step('expand_node', node.id);
		},

		is_expand_all: function () {
			return this.layout.is_expand_all();
		},

		expand_all: function () {
			if (!this.get_editable()) {return;}
			if (this.is_expand_all()) {return;}
			this._save_step('show', this.get_data());
			this.layout.expand_all();
			this.view.relayout();
		},

		is_collapse_all: function () {
			return this.layout.is_collapse_all();
		},

		collapse_all: function () {
			if (!this.get_editable()) {return;}
			if (this.is_collapse_all()) {return;}
			this._save_step('show', this.get_data());
			this.layout.collapse_all();
			this.view.relayout();
		},

		expand_to_depth: function (depth) {
			if (!this.get_editable()) {return;}
			this._save_step('show', this.get_data());
			this.layout.expand_to_depth(depth);
			this.view.relayout();
		},

		_reset: function () {
			this.view.reset();
			this.layout.reset();
			this.data.reset();
		},

		_show: function (mind) {
			let m = mind || jm.format.node_array.example;

			this.mind = this.data.load(m);
			if (!this.mind) {
				logger.error('data.load error');
				return;
			} else {
				logger.debug('data.load ok');
			}

			this.view.load();
			logger.debug('view.load ok');

			this.layout.layout();
			logger.debug('layout.layout ok');

			this.view.show(true);
			logger.debug('view.show ok');
			setTimeout(() => {
				this.invoke_event_handle(jm.event_type.show, { data: [mind] });
			});
		},

		show: function (mind) {
			return new Promise((resolve) => {
				setTimeout(() => {
					try {
						const oData = this.get_data();
						this._save_step('show', oData);
					} catch (err) {
						
					}
					this._reset();
					this._show(mind);
					if (this.get_editable()) {
						this.options.editable = false;
						setTimeout(() => {
							this.options.editable = true;
						}, 500);
					}
					setTimeout(() => {
						resolve();
					})
				}, 100)
			})
		},

		get_meta: function () {
			return {
				name: this.mind.name,
				author: this.mind.author,
				version: this.mind.version
			};
		},

		get_data: function (data_format) {
			let df = data_format || 'node_tree';
			return this.data.get_data(df);
		},

		get_node_style: function (nodeid) {
			return this.mind.get_node_style(nodeid);
		},

		get_root: function () {
			return this.mind.root;
		},

		get_node: function (nodeid) {
			return this.mind.get_node(nodeid);
		},

		add_node: function (parent_node, nodeid, topic, data) {
			if (this.get_editable()) {
				let node = this.mind.add_node(parent_node, nodeid, topic, data);
				if (!!node) {
					this.view.add_node(node);
					this.layout.layout();
					this.view.show(false);
					this.view.reset_node_custom_style(node);
					this.expand_node(parent_node);
					this.invoke_event_handle(jm.event_type.addNode, { evt: 'add_node', data: [parent_node.id, nodeid, topic, data], node: nodeid });
					this._save_step('remove_node', nodeid);
				}
				return node;
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		insert_node_before: function (node_before, nodeid, topic, data) {
			if (this.get_editable()) {
				let beforeid = jm.util.is_node(node_before) ? node_before.id : node_before;
				let node = this.mind.insert_node_before(node_before, nodeid, topic, data);
				if (!!node) {
					this.view.add_node(node);
					this.layout.layout();
					this.view.show(false);
					this.invoke_event_handle(jm.event_type.insertNode, { evt: 'insert_node_before', data: [beforeid, nodeid, topic, data], node: nodeid });
					this._save_step('remove_node', nodeid);
				}
				return node;
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		insert_node_after: function (node_after, nodeid, topic, data) {
			if (this.get_editable()) {
				let afterid = jm.util.is_node(node_after) ? node_after.id : node_after;
				let node = this.mind.insert_node_after(node_after, nodeid, topic, data);
				if (!!node) {
					this.view.add_node(node);
					this.layout.layout();
					this.view.show(false);
					this.invoke_event_handle(jm.event_type.insertNode, { evt: 'insert_node_after', data: [afterid, nodeid, topic, data], node: nodeid });
					this._save_step('remove_node', nodeid);
				}
				return node;
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		remove_node: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return false;
				} else {
					return this.remove_node(the_node);
				}
			}
			if (this.get_editable()) {
				let nodeid = node.id;
				let oBeforeNode = this.find_node_before(nodeid);
				let oAfterNode = this.find_node_after(nodeid);
				let topic = node.topic;
				let data = node.data;
				let parentid = node.parent.id;
				let parent_node = this.get_node(parentid);
				this.view.save_location(parent_node);
				this.view.remove_node(node);
				this.mind.remove_node(node);
				this.layout.layout();
				this.view.show(false);
				this.view.restore_location(parent_node);
				this.invoke_event_handle(jm.event_type.removeNode, { evt: 'remove_node', data: [nodeid], node: parentid });
				if (oBeforeNode) {
					this._save_step('insert_node_after', oBeforeNode.id, nodeid, topic, data);
				} else if (oAfterNode) {
					this._save_step('insert_node_before', oAfterNode.id, nodeid, topic, data);
				} else {
					this._save_step('add_node', parent_node.id, nodeid, topic, data);
				}
				
				return true;
			} else {
				logger.error('fail, this mind map is not editable');
				return false;
			}
		},

		update_node: function (nodeid, topic) {
			if (this.get_editable()) {
				if (jm.util.text.is_empty(topic)) {
					logger.warn('fail, topic can not be empty');
					return;
				}
				let node = this.get_node(nodeid);
				if (!!node) {
					if (node.topic === topic) {
						logger.info('nothing changed');
						this.view.update_node(node);
						return;
					}
					let oldTopic = node.topic;
					node.topic = topic;
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
					this.invoke_event_handle(jm.event_type.updateNode, { evt: 'update_node', data: [nodeid, topic], node: nodeid });
					this._save_step('update_node', nodeid, oldTopic);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return;
			}
		},

		move_node: function (nodeid, beforeid, parentid, direction) {
			let oNode = null;
			if (!jm.util.is_node(nodeid)) {
				oNode = this.get_node(nodeid);
				if (!oNode) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				}
			} else {
				oNode = nodeid;
			}
			let oDirection = oNode.direction;
			let oParentId = oNode.parent.id;
			let oBeforeNode = this.find_node_before(nodeid);
			let oBeforeId = oBeforeNode ? oBeforeNode.id : '_first_';

			if (this.get_editable()) {
				let node = this.mind.move_node(nodeid, beforeid, parentid, direction);
				if (!!node) {
					this.expand_node(parentid);
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
					this.invoke_event_handle(jm.event_type.moveNode, { evt: 'move_node', data: [nodeid, beforeid, parentid, direction], node: nodeid });
					this._save_step('move_node', oNode.id, oBeforeId, oParentId, oDirection);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return;
			}
		},

		select_node: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.select_node(the_node);
				}
			}
			if (!this.layout.is_visible(node)) {
				return;
			}
			this.mind.selected = node;
			this.view.select_node(node);
			this.invoke_event_handle(jm.event_type.select, { evt: 'select_node', data: [], node: node });
		},

		get_selected_node: function () {
			if (!!this.mind) {
				return this.mind.selected;
			} else {
				return null;
			}
		},

		select_clear: function () {
			if (!!this.mind) {
				this.mind.selected = null;
				this.view.select_clear();
				this.invoke_event_handle(jm.event_type.select, { evt: 'select_node', data: [], node: null });
			}
		},

		is_node_visible: function (node) {
			return this.layout.is_visible(node);
		},

		find_node_before: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.find_node_before(the_node);
				}
			}
			if (node.isroot) { return null; }
			let n = null;
			if (node.parent.isroot) {
				let c = node.parent.children;
				let prev = null;
				let ni = null;
				for (let i = 0; i < c.length; i++) {
					ni = c[i];
					if (node.direction === ni.direction) {
						if (node.id === ni.id) {
							n = prev;
						}
						prev = ni;
					}
				}
			} else {
				n = this.mind.get_node_before(node);
			}
			return n;
		},

		find_node_after: function (node) {
			if (!jm.util.is_node(node)) {
				let the_node = this.get_node(node);
				if (!the_node) {
					logger.error('the node[id=' + node + '] can not be found.');
					return;
				} else {
					return this.find_node_after(the_node);
				}
			}
			if (node.isroot) { return null; }
			let n = null;
			if (node.parent.isroot) {
				let c = node.parent.children;
				let getthis = false;
				let ni = null;
				for (let i = 0; i < c.length; i++) {
					ni = c[i];
					if (node.direction === ni.direction) {
						if (getthis) {
							n = ni;
							break;
						}
						if (node.id === ni.id) {
							getthis = true;
						}
					}
				}
			} else {
				n = this.mind.get_node_after(node);
			}
			return n;
		},

		set_node_color: function (nodeid, bgcolor, fgcolor) {
			if (this.get_editable()) {
				let node = this.mind.get_node(nodeid);
				if (!!node) {
					let oBgcolor = false, oFgcolor = false;
					if (bgcolor !== false) {
						oBgcolor = node.data['background-color'];
						node.data['background-color'] = bgcolor;
					}
					if (fgcolor !== false) {
						oFgcolor = node.data['foreground-color'];
						node.data['foreground-color'] = fgcolor;
					}
					this._save_step('set_node_color', nodeid, oBgcolor, oFgcolor);
					this.view.reset_node_custom_style(node);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_node_font_style: function (nodeid, size, weight, family) {
			if (this.get_editable()) {
				let node = this.mind.get_node(nodeid);
				if (!!node) {
					let oSize = false, oWeight = false, oFamily = false;
					if (size !== false) {
						oSize = node.data['font-size'];
						node.data['font-size'] = size;
					}
					if (weight !== false) {
						oWeight = node.data['font-weight'];
						node.data['font-weight'] = weight;
					}
					if (family !== false) {
						oFamily = node.data['font-family'];
						node.data['font-family'] = family;
					}
					this._save_step('set_node_font_style', nodeid, oSize, oWeight, oFamily);
					this.view.reset_node_custom_style(node);
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_node_size: function (nodeid, width, height) {
			if (this.get_editable()) {
				let node = this.mind.get_node(nodeid);
				if (!!node) {
					let oWidth = false, oHeight = false;
					if (width !== false) {
						oWidth = node.data['width'];
						node.data['width'] = width;
					}
					if (height !== false) {
						oHeight = node.data['height'];
						node.data['height'] = height;
					}
					this._save_step('set_node_size', nodeid, oWidth, oHeight);
					this.view.reset_node_custom_style(node);
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_node_background_image: function (nodeid, image, width, height, rotation) {
			if (this.get_editable()) {
				let node = this.mind.get_node(nodeid);
				if (!!node) {
					let oImage = false, oWidth = false, oHeight = false;
					if (image !== false) {
						oImage = node.data['background-image'];
						node.data['background-image'] = image;
					}
					if (width !== false) {
						oWidth = node.data['width'];
						node.data['width'] = width;
					}
					if (height !== false) {
						oHeight = node.data['height'];
						node.data['height'] = height;
					}
					this._save_step('set_node_background_image', nodeid, oImage, oWidth, oHeight);
					this.view.reset_node_custom_style(node);
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_node_background_rotation: function (nodeid, rotation) {
			if (this.get_editable()) {
				let node = this.mind.get_node(nodeid);
				if (!!node) {
					if (!node.data['background-image']) {
						logger.error('fail, only can change rotation angle of node with background image');
						return null;
					}
					this._save_step('set_node_background_rotation', node.data['background-rotation']);
					node.data['background-rotation'] = rotation;
					this.view.reset_node_custom_style(node);
					this.view.update_node(node);
					this.layout.layout();
					this.view.show(false);
				}
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_selected_style: function (color, style, width) {
			if (this.get_editable()) {
				let selected_data = this.mind.selected_data;
				let oColor = false, oStyle = false, oWidth = false;
				if (color !== false) {
					oColor = selected_data['outline-color'];
					selected_data['outline-color'] = color;
				}
				if (style !== false) {
					oStyle = selected_data['outline-style'];
					selected_data['outline-style'] = style;
				}
				if (width !== false) {
					oWidth = selected_data['outline-width'];
					selected_data['outline-width'] = width;
				}
				this._save_step('set_selected_style', oColor, oStyle, oWidth);
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_selected_color: function (bgcolor, fgcolor) {
			if (this.get_editable()) {
				let selected_data = this.mind.selected_data;
				let oBgcolor = false, oFgcolor = false;
				if (bgcolor !== false) {
					oBgcolor = node.data['background-color'];
					selected_data['background-color'] = bgcolor;
				}
				if (fgcolor !== false) {
					oFgcolor = node.data['foreground-color'];
					selected_data['foreground-color'] = fgcolor;
				}
				this._save_step('set_selected_color', oBgcolor, oFgcolor);
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		set_wait_insert_style: function (color, style, width) {
			if (this.get_editable()) {
				let wait_insert_data = this.mind.wait_insert_data;
				let oColor = false, oStyle = false, oWidth = false;
				if (color !== false) {
					oColor = wait_insert_data['outline-color'];
					wait_insert_data['outline-color'] = color;
				}
				if (style !== false) {
					oStyle = wait_insert_data['outline-style'];
					wait_insert_data['outline-style'] = style;
				}
				if (width !== false) {
					oWidth = wait_insert_data['outline-width'];
					wait_insert_data['outline-width'] = width;
				}
				this._save_step('set_wait_insert_style', oColor, oStyle, oWidth);
			} else {
				logger.error('fail, this mind map is not editable');
				return null;
			}
		},

		resize: function () {
			this.view.resize();
		},
		reset_offset: function () {
			this.view.reset_offset();
		},
		set_offset: function (x, y) {
			this.view.set_offset(x, y);
		},

		// callback(type, data)
		add_event_listener: function (type, callback) {
			if (typeof callback === 'function' && type in jm.event_type) {
				this.event_handles[type].push(callback);
			}
		},

		clear_event_listener: function (type, flag) {
			if (!type) {
				this.event_handles = {};
				for(let key of Object.keys(jm.event_type)) {
					this.event_handles[key] = [];
				}
			} else {
				if (typeof flag === 'number') {
					this.event_handles[type][flag] = null;	
				} else {
					this.event_handles[type] = [];
				}
			}
		},

		invoke_event_handle: function (type, data) {
			let j = this;
			$w.setTimeout(function () {
				j._invoke_event_handle(type, data);
				if (type === jm.event_type.inited) {
					j.clear_event_listener(jm.event_type.inited);
				}
			}, 0);
		},

		_invoke_event_handle: function (type, data) {
			let l = this.event_handles[type].length;
			for (let i = 0; i < l; i++) {
				if (typeof this.event_handles[type][i] === 'function') {
					this.event_handles[type][i](data, type);
				}
			}
		}

	};

	// ============= data provider =============================================

	jm.data_provider = function (jm) {
		this.jm = jm;
	};

	jm.data_provider.prototype = {
		init: function () {
			logger.debug('data.init');
		},

		reset: function () {
			logger.debug('data.reset');
		},

		load: function (mind_data) {
			let df = null;
			let mind = null;
			if (typeof mind_data === 'object') {
				if (!!mind_data.format) {
					df = mind_data.format;
				} else {
					df = 'node_tree';
				}
			} else {
				df = 'freemind';
			}

			if (df == 'node_array') {
				mind = jm.format.node_array.get_mind(mind_data);
			} else if (df == 'node_tree') {
				mind = jm.format.node_tree.get_mind(mind_data);
			} else if (df == 'freemind') {
				mind = jm.format.freemind.get_mind(mind_data);
			} else {
				logger.warn('unsupported format');
			}
			return mind;
		},

		get_data: function (data_format) {
			let data = null;
			if (data_format == 'node_array') {
				data = jm.format.node_array.get_data(this.jm.mind);
			} else if (data_format == 'node_tree') {
				data = jm.format.node_tree.get_data(this.jm.mind);
			} else if (data_format == 'freemind') {
				data = jm.format.freemind.get_data(this.jm.mind);
			} else {
				logger.error('unsupported ' + data_format + ' format');
			}
			return data;
		},
	};

	// ============= layout provider ===========================================

	jm.layout_provider = function (jm, options) {
		this.opts = options;
		this.jm = jm;
		this.isside = (this.opts.mode == 'side');
		this.bounds = null;

		this.cache_valid = false;
	};

	jm.layout_provider.prototype = {
		init: function () {
			logger.debug('layout.init');
		},
		reset: function () {
			logger.debug('layout.reset');
			this.bounds = { n: 0, s: 0, w: 0, e: 0 };
		},
		layout: function () {
			logger.debug('layout.layout');
			this.layout_direction();
			this.layout_offset();
		},

		layout_direction: function () {
			this._layout_direction_root();
		},

		_layout_direction_root: function () {
			let node = this.jm.mind.root;
			// logger.debug(node);
			let layout_data = null;
			if ('layout' in node._data) {
				layout_data = node._data.layout;
			} else {
				layout_data = {};
				node._data.layout = layout_data;
			}
			let children = node.children;
			let children_count = children.length;
			layout_data.direction = jm.direction.center;
			layout_data.side_index = 0;
			if (this.isside) {
				let i = children_count;
				while (i--) {
					this._layout_direction_side(children[i], jm.direction.right, i);
				}
			} else {
				let i = children_count;
				let subnode = null;
				while (i--) {
					subnode = children[i];
					if (subnode.direction == jm.direction.left) {
						this._layout_direction_side(subnode, jm.direction.left, i);
					} else {
						this._layout_direction_side(subnode, jm.direction.right, i);
					}
				}
			}
		},

		_layout_direction_side: function (node, direction, side_index) {
			let layout_data = null;
			if ('layout' in node._data) {
				layout_data = node._data.layout;
			} else {
				layout_data = {};
				node._data.layout = layout_data;
			}
			let children = node.children;
			let children_count = children.length;

			layout_data.direction = direction;
			layout_data.side_index = side_index;
			let i = children_count;
			while (i--) {
				this._layout_direction_side(children[i], direction, i);
			}
		},

		layout_offset: function () {
			let node = this.jm.mind.root;
			let layout_data = node._data.layout;
			layout_data.offset_x = 0;
			layout_data.offset_y = 0;
			layout_data.outer_height = 0;
			let children = node.children;
			let i = children.length;
			let left_nodes = [];
			let right_nodes = [];
			let subnode = null;
			while (i--) {
				subnode = children[i];
				if (subnode._data.layout.direction == jm.direction.right) {
					right_nodes.unshift(subnode);
				} else {
					left_nodes.unshift(subnode);
				}
			}
			layout_data.left_nodes = left_nodes;
			layout_data.right_nodes = right_nodes;
			layout_data.outer_height_left = this._layout_offset_subnodes(left_nodes);
			layout_data.outer_height_right = this._layout_offset_subnodes(right_nodes);
			this.bounds.e = node._data.view.width / 2;
			this.bounds.w = 0 - this.bounds.e;
			//logger.debug(this.bounds.w);
			this.bounds.n = 0;
			this.bounds.s = Math.max(layout_data.outer_height_left, layout_data.outer_height_right);
		},

		// layout both the x and y axis
		// 获取节点相对于父节点的offset
		// 根节点的offset为0
		// 当节点在左侧时，offset的计算点在右边界的中点
		// 当节点在右侧时，offset的计算点在左边界的中点
		_layout_offset_subnodes: function (nodes) {
			let total_height = 0;
			let nodes_count = nodes.length;
			let i = nodes_count;
			let node = null;
			let node_outer_height = 0;
			let layout_data = null;
			let base_y = 0;
			let pd = null; // parent._data
			// 节点的offset计算时从最后一个开始计算
			while (i--) {
				node = nodes[i];
				layout_data = node._data.layout;
				if (pd == null) {
					pd = node.parent._data;
				}
				if (!node.expanded) {
					node_outer_height = 0;
					this.set_visible(node.children, false);
				} else {
					node_outer_height = this._layout_offset_subnodes(node.children);
				}
				// 算出绘制该节点及其子节点需要的最大高度
				node_outer_height = Math.max(node._data.view.height, node_outer_height);
				layout_data.outer_height = node_outer_height;

				// 开始计算offsetX
				// offsetX = 节点水平间距 * direction + 父节点宽度 * (父元素direction + direction) / 2
				// 根节点直接子节点offsetX = (节点水平间距 + 父节点宽度 / 2) * direction
				// 非根节点直接子节点offsetX =  (节点水平间距 + 父节点宽度) * direction
				layout_data.offset_x = this.opts.hspace * layout_data.direction + pd.view.width * (pd.layout.direction + layout_data.direction) / 2;
				// 非根节点直接子节点offsetX还要加上节点与连接线的水平间距
				if (!node.parent.isroot) {
					layout_data.offset_x += this.opts.pspace * layout_data.direction;
				}
				// 开始计算offsetY
				// 需要把所有节点从0开始从下往上排列起来（父节点的上方）
				// 初始时baseY为0，以baseY为基线,节点的offsetY设置为基线往上，节点最大高度一半的位置，这样节点就会位于子节点的中心
				layout_data.offset_y = base_y - node_outer_height / 2;
				// 每次计算完一个节点，下一个节点的baseY向上提高 节点最大高度 + 节点垂直间距 的距离
				base_y = base_y - node_outer_height - this.opts.vspace;


				total_height += node_outer_height;
			}
			if (nodes_count > 1) {
				total_height += this.opts.vspace * (nodes_count - 1);
			}
			i = nodes_count;

			// 经过上方的offsetY计算，现在每个子节点的offsetY（负值）已经按照既定的距离在父元素的 上方 排列好了
			// 现在要将它们平均分布在父元素的上下两侧，因此每个节点的offsetY都要增加总长度的一半
			let middle_height = total_height / 2;
			while (i--) {
				node = nodes[i];
				node._data.layout.offset_y += middle_height;
			}
			return total_height;
		},

		// layout the y axis only, for collapse/expand a node
		_layout_offset_subnodes_height: function (nodes) {
			let total_height = 0;
			let nodes_count = nodes.length;
			let i = nodes_count;
			let node = null;
			let node_outer_height = 0;
			let layout_data = null;
			let base_y = 0;
			let pd = null; // parent._data
			while (i--) {
				node = nodes[i];
				layout_data = node._data.layout;
				if (pd == null) {
					pd = node.parent._data;
				}

				node_outer_height = this._layout_offset_subnodes_height(node.children);
				if (!node.expanded) {
					node_outer_height = 0;
				}
				node_outer_height = Math.max(node._data.view.height, node_outer_height);

				layout_data.outer_height = node_outer_height;
				layout_data.offset_y = base_y - node_outer_height / 2;
				base_y = base_y - node_outer_height - this.opts.vspace;
				total_height += node_outer_height;
			}
			if (nodes_count > 1) {
				total_height += this.opts.vspace * (nodes_count - 1);
			}
			i = nodes_count;
			let middle_height = total_height / 2;
			while (i--) {
				node = nodes[i];
				node._data.layout.offset_y += middle_height;
				//logger.debug(node.topic);
				//logger.debug(node._data.layout.offset_y);
			}
			return total_height;
		},

		// 获取节点相对根节点的真实偏移
		get_node_offset: function (node) {
			let layout_data = node._data.layout;
			let offset_cache = null;
			if (('_offset_' in layout_data) && this.cache_valid) {
				offset_cache = layout_data._offset_;
			} else {
				offset_cache = { x: -1, y: -1 };
				layout_data._offset_ = offset_cache;
			}
			if (offset_cache.x == -1 || offset_cache.y == -1) {
				let x = layout_data.offset_x;
				let y = layout_data.offset_y;
				if (!node.isroot) {
					let offset_p = this.get_node_offset(node.parent);
					x += offset_p.x;
					y += offset_p.y;
				}
				offset_cache.x = x;
				offset_cache.y = y;
			}
			return offset_cache;
		},

		// 获取节点左上角相对根节点的真实偏移
		get_node_point: function (node) {
			let view_data = node._data.view;
			let offset_p = this.get_node_offset(node);
			//logger.debug(offset_p);
			let p = {};
			p.x = offset_p.x + view_data.width * (node._data.layout.direction - 1) / 2;
			p.y = offset_p.y - view_data.height / 2;
			//logger.debug(p);
			return p;
		},

		get_node_point_in: function (node) {
			let p = this.get_node_offset(node);
			return p;
		},

		get_node_point_out: function (node) {
			let layout_data = node._data.layout;
			let pout_cache = null;
			if (('_pout_' in layout_data) && this.cache_valid) {
				pout_cache = layout_data._pout_;
			} else {
				pout_cache = { x: -1, y: -1 };
				layout_data._pout_ = pout_cache;
			}
			if (pout_cache.x == -1 || pout_cache.y == -1) {
				if (node.isroot) {
					pout_cache.x = 0;
					pout_cache.y = 0;
				} else {
					let view_data = node._data.view;
					let offset_p = this.get_node_offset(node);
					pout_cache.x = offset_p.x + (view_data.width + this.opts.pspace) * node._data.layout.direction;
					pout_cache.y = offset_p.y;
					//logger.debug('pout');
					//logger.debug(pout_cache);
				}
			}
			return pout_cache;
		},

		get_expander_point: function (node) {
			let p = this.get_node_point_out(node);
			let ex_p = {};
			if (node._data.layout.direction == jm.direction.right) {
				ex_p.x = p.x - this.opts.pspace;
			} else {
				ex_p.x = p.x;
			}
			ex_p.y = p.y - Math.ceil(this.opts.pspace / 2);
			return ex_p;
		},

		get_min_size: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pout = null;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (('visible' in node._data.layout) && !node._data.layout.visible) {continue;}
				pout = this.get_node_point_out(node);
				if (pout.x > this.bounds.e) { this.bounds.e = pout.x; }
				if (pout.x < this.bounds.w) { this.bounds.w = pout.x; }
			}
			return {
				w: this.bounds.e - this.bounds.w,
				h: this.bounds.s - this.bounds.n
			}
		},

		toggle_node: function (node) {
			if (node.isroot) {
				return;
			}
			if (node.expanded) {
				this.collapse_node(node);
				return 1;
			} else {
				this.expand_node(node);
				return 2;
			}
		},

		can_node_expand: function (node) {
			return node.children.length > 0 && !node.expanded;
		},

		expand_node: function (node) {
			if (!this.can_node_expand(node)) {return false;}
			node.expanded = true;
			this.part_layout(node);
			this.set_visible(node.children, true);
			this.jm.invoke_event_handle(jm.event_type.expandNode, { evt: 'expand_node', data: [], node: node.id });
			return true;
		},

		can_node_collapse: function (node) {
			return node.children.length > 0 && node.expanded;
		},

		collapse_node: function (node) {
			if (!this.can_node_collapse(node)) {return false;}
			node.expanded = false;
			this.part_layout(node);
			this.set_visible(node.children, false);
			this.jm.invoke_event_handle(jm.event_type.collapseNode, { evt: 'collapse_node', data: [], node: node.id });
			return true;
		},

		is_expand_all: function () {
			let nodes = this.jm.mind.nodes;
			let node;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!node.expanded) {
					return false
				}
			}
			return true;
		},

		expand_all: function () {
			let nodes = this.jm.mind.nodes;
			let c = 0;
			let node;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!node.expanded) {
					node.expanded = true;
					c++;
				}
			}
			if (c > 0) {
				let root = this.jm.mind.root;
				this.part_layout(root);
				this.set_visible(root.children, true);
			}
		},

		is_collapse_all: function () {
			let nodes = this.jm.mind.nodes;
			let node;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (node.expanded && !node.isroot) {
					return false
				}
			}
			return true;
		},

		collapse_all: function () {
			let nodes = this.jm.mind.nodes;
			let c = 0;
			let node;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (node.expanded && !node.isroot) {
					node.expanded = false;
					c++;
				}
			}
			if (c > 0) {
				let root = this.jm.mind.root;
				this.part_layout(root);
				this.set_visible(root.children, true);
			}
		},

		expand_to_depth: function (target_depth, curr_nodes, curr_depth) {
			if (target_depth < 1) { return; }
			let nodes = curr_nodes || this.jm.mind.root.children;
			let depth = curr_depth || 1;
			let i = nodes.length;
			let node = null;
			while (i--) {
				node = nodes[i];
				if (depth < target_depth) {
					if (!node.expanded) {
						this.expand_node(node);
					}
					this.expand_to_depth(target_depth, node.children, depth + 1);
				}
				if (depth == target_depth) {
					if (node.expanded) {
						this.collapse_node(node);
					}
				}
			}
		},

		part_layout: function (node) {
			let root = this.jm.mind.root;
			if (!!root) {
				let root_layout_data = root._data.layout;
				if (node.isroot) {
					root_layout_data.outer_height_right = this._layout_offset_subnodes_height(root_layout_data.right_nodes);
					root_layout_data.outer_height_left = this._layout_offset_subnodes_height(root_layout_data.left_nodes);
				} else {
					if (node._data.layout.direction == jm.direction.right) {
						root_layout_data.outer_height_right = this._layout_offset_subnodes_height(root_layout_data.right_nodes);
					} else {
						root_layout_data.outer_height_left = this._layout_offset_subnodes_height(root_layout_data.left_nodes);
					}
				}
				this.bounds.e = root._data.view.width / 2;
				this.bounds.w = 0 - this.bounds.e;
				this.bounds.s = Math.max(root_layout_data.outer_height_left, root_layout_data.outer_height_right);
				this.cache_valid = false;
			} else {
				logger.warn('can not found root node');
			}
		},

		set_visible: function (nodes, visible) {
			let i = nodes.length;
			let node = null;
			let layout_data = null;
			while (i--) {
				node = nodes[i];
				layout_data = node._data.layout;
				if (node.expanded) {
					this.set_visible(node.children, visible);
				} else {
					this.set_visible(node.children, false);
				}
				if (!node.isroot) {
					node._data.layout.visible = visible;
				}
			}
		},

		is_expand: function (node) {
			return node.expanded;
		},

		is_visible: function (node) {
			let layout_data = node._data.layout;
			if (('visible' in layout_data) && !layout_data.visible) {
				return false;
			} else {
				return true;
			}
		}
	};

	jm.graph_canvas = function (view) {
		this.opts = view.opts;
		this.e_canvas = $c('canvas');
		this.e_canvas.className = 'jsmind';
		this.canvas_ctx = this.e_canvas.getContext('2d');
		this.size = { w: 0, h: 0 };
	};

	jm.graph_canvas.prototype = {
		element: function () {
			return this.e_canvas;
		},

		set_size: function (w, h) {
			this.size.w = w;
			this.size.h = h;
			this.e_canvas.width = w;
			this.e_canvas.height = h;
		},

		clear: function () {
			this.canvas_ctx.clearRect(0, 0, this.size.w, this.size.h);
		},

		draw_line: function (pout, pin, offset, mode) {
			let ctx = this.canvas_ctx;
			ctx.strokeStyle = this.opts.line_color;
			ctx.lineWidth = this.opts.line_width;
			ctx.lineCap = 'round';
			switch(mode) {
				case 'curve':
					this._bezier_to_second(ctx, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				case 'line':
					this._line_to(ctx, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				case 'bracket':
					this._polyline_to(ctx, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				default: 
					this._bezier_to(ctx, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
			}
		},

		copy_to: function (dest_canvas_ctx, callback) {
			dest_canvas_ctx.drawImage(this.e_canvas, 0, 0);
			!!callback && callback();
		},

		_bezier_to: function (ctx, x1, y1, x2, y2) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.bezierCurveTo(x1 + (x2 - x1) * 2 / 3, y1, x1, y2, x2, y2);
			ctx.stroke();
		},

		_line_to: function (ctx, x1, y1, x2, y2) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		},

		_bezier_to_second: function (ctx, x1, y1, x2, y2) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(x2, y1, x2, y2);
			ctx.stroke();
		},

		_polyline_to: function (ctx, x1, y1, x2, y2) {
			if (y1 == y2) {
				return this._line_to(ctx, x1, y1, x2, y2);
			}
			let xDirective = x1 > x2 ? 1 : -1;
			let yDirective = y1 < y2 ? -1 : 1;
			let radius = 4;
			let sweepFlag;
			if (xDirective > 0) {
				sweepFlag = y1 < y2 ? '0' : '1';
			} else {
				sweepFlag = y1 < y2 ? '1' : '0';
			}
			let midX = (x2 + x1) / 2;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(midX + radius * xDirective, y1);
			ctx.quadraticCurveTo(midX, y1, midX, y1 - radius * yDirective);
			ctx.lineTo(midX, y2);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}
	};

	jm.graph_svg = function (view) {
		this.view = view;
		this.opts = view.opts;
		this.e_svg = jm.graph_svg.c('svg');
		this.e_svg.setAttribute('class', 'jsmind');
		this.size = { w: 0, h: 0 };
		this.lines = [];
	};

	jm.graph_svg.c = function (tag) {
		return $d.createElementNS('http://www.w3.org/2000/svg', tag);
	};

	jm.graph_svg.prototype = {
		element: function () {
			return this.e_svg;
		},

		set_size: function (w, h) {
			this.size.w = w;
			this.size.h = h;
			this.e_svg.setAttribute('width', w);
			this.e_svg.setAttribute('height', h);
		},

		clear: function () {
			let len = this.lines.length;
			while (len--) {
				this.e_svg.removeChild(this.lines[len]);
			}
			this.lines.length = 0;
		},

		draw_line: function (pout, pin, offset, mode) {
			let line = jm.graph_svg.c('path');
			line.setAttribute('stroke', this.opts.line_color);
			line.setAttribute('stroke-width', this.opts.line_width);
			line.setAttribute('fill', 'transparent');
			this.lines.push(line);
			this.e_svg.appendChild(line);
			switch(mode) {
				case 'curve':
					this._bezier_to_second(line, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				case 'line':
					this._line_to(line, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				case 'bracket':
					this._polyline_to(line, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
				default: 
					this._bezier_to(line, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
					break;
			}
		},

		copy_to: function (dest_canvas_ctx, callback) {
			let img = new Image();
			img.onload = function () {
				dest_canvas_ctx.drawImage(img, 0, 0);
				!!callback && callback();
			}
			img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(this.e_svg));
		},

		_bezier_to: function (path, x1, y1, x2, y2) {
			path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C ' + (x1 + (x2 - x1) * 2 / 3) + ' ' + y1 + ', ' + x1 + ' ' + y2 + ', ' + x2 + ' ' + y2);
		},

		_bezier_to_second: function (path, x1, y1, x2, y2) {
			path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' Q ' + x2 + ' ' + y1 + ', ' + x2 + ' ' + y2);
		},

		_line_to: function (path, x1, y1, x2, y2) {
			path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2);
		},

		_polyline_to: function (path, x1, y1, x2, y2) {
			if (y1 == y2) {
				return this._line_to(path, x1, y1, x2, y2);
			}
			let xDirective = x1 > x2 ? 1 : -1;
			let yDirective = y1 < y2 ? -1 : 1;
			let radius = 4;
			let midX = (x2 + x1) / 2;
			path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' L ' + (midX + radius * xDirective) + ' ' + y1 + ' Q ' + midX + ' ' + y1 + ', ' + midX + ' ' + (y1 - radius * yDirective) + ' L ' + midX + ' ' + y2 + ' L ' + x2 + ' ' + y2);
		}
	};

	// view provider
	jm.view_provider = function (jm, options) {
		this.opts = options;
		this.jm = jm;
		this.layout = jm.layout;
		this.e_scorllMask = null;
		this.container = null;
		this.e_container = null;
		this.e_panel = null;
		this.e_nodes = null;

		this.size = { w: 0, h: 0 };

		this.selected_node = null;
		this.editing_node = null;

		this.graph = null;

        this.offsetCapture = false;
        this.offset_move_x = 0;
        this.offset_move_y = 0;
	};

	jm.view_provider.prototype = {
		init: function () {
			logger.debug('view.init');

			this.container = $i(this.opts.container) ? this.opts.container : $g(this.opts.container);
			if (!this.container) {
				logger.error('the options.view.container was not be found in dom');
				return;
			}
			this.e_scorllMask = $c('div');
			this.e_container = $c('div');
			this.e_panel = $c('div');
			this.e_nodes = $c('jmnodes');
			this.e_editor = $c('div');

			this.graph = this.opts.engine.toLowerCase() === 'svg' ? new jm.graph_svg(this) : new jm.graph_canvas(this);

			this.e_scorllMask.className = 'jsmind-scroll';
			this.e_container.className = 'jsmind-container';
			this.e_panel.className = 'jsmind-inner';
			this.e_panel.appendChild(this.graph.element());
			this.e_panel.appendChild(this.e_nodes);

			this.e_editor.className = 'jsmind-editor';
			// this.e_editor.type = 'text';
			this.e_editor.setAttribute("contenteditable", true);
			this._kill_html_paste(this.e_editor);

			this.actualZoom = 1;
			this.zoomStep = this.opts.zoom_step;
			this.minZoom = this.opts.min_zoom;
			this.maxZoom = this.opts.max_zoom;

			let v = this;
			jm.util.dom.add_event(this.e_editor, 'keydown', function (e) {
				let evt = e;
				if (evt.keyCode == 13) {
					if (evt.altKey) {
						v.e_editor.innerHTML += '\n';
						v.setRangeToLast();
					} else {
						v.edit_node_end();
					}
					evt.stopPropagation();
				}
			});
			jm.util.dom.add_event(this.e_editor, 'blur', function (e) {
				v.edit_node_end();
			});

			this.init_offset_move();

			this.e_container.appendChild(this.e_panel);
			this.e_scorllMask.appendChild(this.e_container);
			this.container.appendChild(this.e_scorllMask);
		},

		_kill_html_paste(editor) {
			try {
				document.execCommand("AutoUrlDetect", false, false);
			} catch (e) {}
			editor.addEventListener('paste', function(e) {
				e.preventDefault();
				var text = null;
			
				if(window.clipboardData && clipboardData.setData) {
					// IE
					text = window.clipboardData.getData('text');
				} else {
					text = (e.originalEvent || e).clipboardData.getData('text/plain') || '';
				}
				if (!text) {return;}
				if (document.body.createTextRange) {    
					if (document.selection) {
						textRange = document.selection.createRange();
					} else if (window.getSelection) {
						sel = window.getSelection();
						var range = sel.getRangeAt(0);
						
						// 创建临时元素，使得TextRange可以移动到正确的位置
						var tempEl = document.createElement("span");
						tempEl.innerHTML = "&#FEFF;";
						range.deleteContents();
						range.insertNode(tempEl);
						textRange = document.body.createTextRange();
						textRange.moveToElementText(tempEl);
						tempEl.parentNode.removeChild(tempEl);
					}
					textRange.text = text;
					textRange.collapse(false);
					textRange.select();
				} else {
					// Chrome之类浏览器
					document.execCommand("insertText", false, text);
				}
			});
			// 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
			editor.addEventListener('keydown', function(e) {
				// e.metaKey for mac
				if (e.ctrlKey || e.metaKey) {
					switch(e.keyCode){
						case 66: //ctrl+B or ctrl+b
						case 98: 
						case 73: //ctrl+I or ctrl+i
						case 105: 
						case 85: //ctrl+U or ctrl+u
						case 117: {
							e.preventDefault();    
							break;
						}
					}
				}    
			})
		},

		init_offset_move: function (e) {
			let v = this;
            jm.util.dom.add_event(this.container, 'mousedown', function (e) {
                let evt = e;
                v.offsetStart.call(v, evt);                
            });
            jm.util.dom.add_event(this.container, 'mousemove', function (e) {
                let evt = e;
                v.offsetMove.call(v, evt);
            });
            jm.util.dom.add_event(this.container, 'mouseup', function (e) {
                let evt = e;
                v.offsetEnd.call(v, evt);
            });
            jm.util.dom.add_event(this.container, 'mouseleave', function (e) {
                let evt = e;
                v.offsetEnd.call(v, evt);
            });
		},

        offsetStart: function (e) {
			if (e.buttons != 1) {return;}
			if (!!this.get_binded_nodeid(e.target)) {return;}
			if (e.target.className.toLowerCase() === 'jsmind-editor') {return;}			
            if (this.offsetCapture) { return; }
            this.offsetCapture = true;
            this.offset_move_x = e.clientX ? e.clientX : e.touches ? e.touches[0].clientX : 0;
            this.offset_move_y = e.clientY ? e.clientY : e.touches ? e.touches[0].clientY : 0;
        },

        offsetMove: function (e) {
            if (this.offsetCapture) {
                const ex = e.clientX ? e.clientX : e.touches ? e.touches[0].clientX : 0;
                const ey = e.clientY ? e.clientY : e.touches ? e.touches[0].clientY : 0;
                const px = ex - this.offset_move_x;
                const py = ey - this.offset_move_y;
                this.jm.set_offset(this.jm.view.e_scorllMask.scrollLeft - px, this.jm.view.e_scorllMask.scrollTop - py);
                this.offset_move_x = ex;
                this.offset_move_y = ey;
            }
        },

        offsetEnd: function (e) {
            if (this.offsetCapture) {
                this.offsetCapture = false;
            }
        },

		add_event: function (obj, event_name, event_handle, listener = this.e_nodes) {
			jm.util.dom.add_event(listener, event_name, function (e) {
				let evt = e;
				event_handle.call(obj, evt);
			});
		},

		get_binded_nodeid: function (element) {
			if (element == null) {
				return null;
			}
			let tagName = element.tagName.toLowerCase();
			if (tagName == 'jmnodes' || tagName == 'body' || tagName == 'html') {
				return null;
			}
			if (element.className.toLowerCase() == 'jsmind-container') {
				return null;
			}
			if (tagName == 'jmnode' || tagName == 'jmexpander') {
				return element.getAttribute('nodeid');
			} else {
				return this.get_binded_nodeid(element.parentElement);
			}
		},

		is_expander: function (element) {
			return (element.tagName.toLowerCase() == 'jmexpander');
		},

		reset: function () {
			logger.debug('view.reset');
			this.selected_node = null;
			this.clear_lines();
			this.clear_nodes();
			this.reset_offset();
			this.reset_theme();
		},

		reset_offset: function () {
			this.e_scorllMask.scrollTop = 10000 - Math.floor(this.container.clientHeight / 2);
			this.e_scorllMask.scrollLeft = 10000 - Math.floor(this.container.clientWidth / 2);
		},

		set_offset: function (x, y) {
			if (typeof x === 'number') {
				this.e_scorllMask.scrollLeft = x;
			}
			if (typeof y === 'number') {
				this.e_scorllMask.scrollTop = y;
			}
		},

		reset_theme: function () {
			let theme_name = this.jm.options.theme;
			if (!!theme_name) {
				this.e_nodes.className = 'theme-' + theme_name;
			} else {
				this.e_nodes.className = '';
			}
		},

		reset_custom_style: function () {
			let nodes = this.jm.mind.nodes;
			for (let nodeid in nodes) {
				this.reset_node_custom_style(nodes[nodeid]);
			}
		},

		load: function () {
			logger.debug('view.load');
			this.init_nodes();
		},

		expand_size: function () {
			let min_size = this.layout.get_min_size();
			let min_width = min_size.w;
			let min_height = min_size.h;
			// let client_w = this.e_panel.clientWidth;
			// let client_h = this.e_panel.clientHeight;
			// if (client_w < min_width) { client_w = min_width; }
			// if (client_h < min_height) { client_h = min_height; }
			this.size.w = min_width;
			this.size.h = min_height;
		},

		init_nodes_size: function (node) {
			let view_data = node._data.view;
			view_data.width = view_data.element.clientWidth;
			view_data.height = view_data.element.clientHeight;
			// delete <pre>
			if (!!node.topic) {
				view_data.element.innerHTML = '';
                // if (this.opts.support_html) {
                //     $h(view_data.element, node.topic);
                // } else {
                //     $t(view_data.element, node.topic);
                // }
				$t(view_data.element, node.topic);
			}

		},

		init_nodes: function () {
			let nodes = this.jm.mind.nodes;
			let doc_frag = $d.createDocumentFragment();
			for (let nodeid in nodes) {
				this.create_node_element(nodes[nodeid], doc_frag);
			}
			this.e_nodes.appendChild(doc_frag);
			for (let nodeid in nodes) {
				this.init_nodes_size(nodes[nodeid]);
			}
		},

		add_node: function (node) {
			this.create_node_element(node, this.e_nodes);
			this.init_nodes_size(node);
		},

		create_node_element: function (node, parent_node) {
			let view_data = null;
			if ('view' in node._data) {
				view_data = node._data.view;
			} else {
				view_data = {};
				node._data.view = view_data;
			}
			
			let d = $c('jmnode');
			if (node.isroot) {
				d.className = 'jmnode-root';
			} else {
				let d_e = $c('jmexpander');
				$t(d_e, '-');
				d_e.setAttribute('nodeid', node.id);
				d_e.style.visibility = 'hidden';
				parent_node.appendChild(d_e);
				view_data.expander = d_e;
			}
			if (!!node.topic) {
				// add a <pre> to maintain muti-line text
				let pre = $d.createElement('pre');
                // if (this.opts.support_html) {
                //     $h(pre, node.topic);
                // } else {
                //     $t(pre, node.topic);
                // }
				$t(pre, node.topic);
				d.appendChild(pre);
			}
			d.setAttribute('nodeid', node.id);
			d.style.visibility = 'hidden';
			this._reset_node_custom_style(d, node.data);

			parent_node.appendChild(d);
			view_data.element = d;
		},

		remove_node: function (node) {
			if (this.selected_node != null && this.selected_node.id == node.id) {
				this.selected_node = null;
			}
			if (this.editing_node != null && this.editing_node.id == node.id) {
				node._data.view.element.removeChild(this.e_editor);
				this.editing_node = null;
			}
			let children = node.children;
			let i = children.length;
			while (i--) {
				this.remove_node(children[i]);
			}
			if (node._data.view) {
				let element = node._data.view.element;
				let expander = node._data.view.expander;
				this.e_nodes.removeChild(element);
				this.e_nodes.removeChild(expander);
				node._data.view.element = null;
				node._data.view.expander = null;
			}
		},

		update_node: function (node) {
			let view_data = node._data.view;
			let element = view_data.element;
			if (!!node.topic) {
                // if (this.opts.support_html) {
                //     $h(element, node.topic);
                // } else {
                //     $t(element, node.topic);
                // }
				$t(element, node.topic);
			}
			view_data.width = element.clientWidth;
			view_data.height = element.clientHeight;
		},

		select_node: function (node) {
			if (!!this.selected_node) {
				this.selected_node._data.view.element.className =
					this.selected_node._data.view.element.className.replace(/\s*jsmind-selected\b/i, '');
				this.clear_select_custom_style();
				this.reset_node_custom_style(this.selected_node);
			}
			if (!!node) {
				this.selected_node = node;
				node._data.view.element.className += ' jsmind-selected';
				this.reset_select_custom_style();
			}
		},

		select_clear: function () {
			this.select_node(null);
		},

		get_editing_node: function () {
			return this.editing_node;
		},

		is_editing: function () {
			return (!!this.editing_node);
		},

		setRangeToLast() {
			const range = document.createRange();
			range.selectNodeContents(this.e_editor);
			range.collapse(false);
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},

		edit_node_begin: function (node) {
			if (!node.topic) {
				logger.warn("don't edit image nodes");
				return;
			}
			if (this.editing_node != null) {
				this.edit_node_end();
			}
			this.editing_node = node;
			let view_data = node._data.view;
			let element = view_data.element;
			let topic = node.topic;
			this.e_editor.innerHTML = topic + '\n';
			element.innerHTML = '';
			element.appendChild(this.e_editor);
			element.style.zIndex = 5;
			this.e_editor.focus();
			// this.e_editor.select();
			const range = document.createRange();
			range.selectNodeContents(this.e_editor);
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);

		},

		edit_node_end: function () {
			if (this.editing_node != null) {
				let node = this.editing_node;
				this.editing_node = null;
				let view_data = node._data.view;
				let element = view_data.element;
				let topic = this.e_editor.innerHTML;
				while(topic.endsWith('\n')) {
					topic = topic.substring(0, topic.length - 1);
				}
				element.style.zIndex = 'auto';
				element.removeChild(this.e_editor);
				if (jm.util.text.is_empty(topic) || node.topic === topic) {
                    // if (this.opts.support_html) {
                    //     $h(element, node.topic);
                    // } else {
                    //     $t(element, node.topic);
                    // }
					$t(element, node.topic);
				} else {
					this.jm.update_node(node.id, topic);
				}
			}
		},

		get_view_offset: function () {
			let bounds = this.layout.bounds;
			let _x = (this.size.w - bounds.e - bounds.w) / 2;
			let _y = this.size.h / 2;
			return { x: _x, y: _y };
		},

		resize: function () {
			this.graph.set_size(1, 1);
			this.e_nodes.style.width = '1px';
			this.e_nodes.style.height = '1px';

			this.expand_size();
			this._show();
		},

		_show: function () {
			this.graph.set_size(this.size.w, this.size.h);
			this.e_nodes.style.width = this.size.w + 'px';
			this.e_nodes.style.height = this.size.h + 'px';
			this.show_nodes();
			this.show_lines();
			//this.layout.cache_valid = true;
			this.jm.invoke_event_handle(jm.event_type.resize, { data: [] });
		},

		zoom_in: function () {
			return this.set_zoom(this.actualZoom + this.zoomStep);
		},

		zoom_out: function () {
			return this.set_zoom(this.actualZoom - this.zoomStep);
		},

		set_zoom: function (zoom) {
			if ((zoom < this.minZoom) || (zoom > this.maxZoom)) {
				return false;
			}
			this.actualZoom = zoom;
			for (let i = 0; i < this.e_panel.children.length; i++) {
				this.e_panel.children[i].style.transform = 'scale(' + zoom + ')';
			};
			this.show(true);
			return true;

		},

		_center_root: function () {
			// center root node
			let outer_w = this.e_panel.clientWidth;
			let outer_h = this.e_panel.clientHeight;
			if (this.size.w > outer_w) {
				let _offset = this.get_view_offset();
				this.e_panel.scrollLeft = _offset.x - outer_w / 2;
			}
			if (this.size.h > outer_h) {
				this.e_panel.scrollTop = (this.size.h - outer_h) / 2;
			}
		},

		show: function (keep_center) {
			logger.debug('view.show');
			this.expand_size();
			this._show();
			if (!!keep_center) {
				this._center_root();
			}
		},

		relayout: function () {
			this.expand_size();
			this._show();
		},

		save_location: function (node) {
			let vd = node._data.view;
			vd._saved_location = {
				x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
				y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
			};
		},

		restore_location: function (node) {
			let vd = node._data.view;
			this.e_panel.scrollLeft = parseInt(vd.element.style.left) - vd._saved_location.x;
			this.e_panel.scrollTop = parseInt(vd.element.style.top) - vd._saved_location.y;
		},

		clear_nodes: function () {
			let mind = this.jm.mind;
			if (mind == null) {
				return;
			}
			let nodes = mind.nodes;
			let node = null;
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				node._data.view.element = null;
				node._data.view.expander = null;
			}
			this.e_nodes.innerHTML = '';
		},

		show_nodes: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let node_element = null;
			let expander = null;
			let p = null;
			let p_expander = null;
			let expander_text = '-';
			let view_data = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				view_data = node._data.view;
				node_element = view_data.element;
				expander = view_data.expander;
				if (!this.layout.is_visible(node)) {
					node_element.style.display = 'none';
					expander.style.display = 'none';
					continue;
				}
				this.reset_node_custom_style(node);
				p = this.layout.get_node_point(node);
				view_data.abs_x = _offset.x + p.x;
				view_data.abs_y = _offset.y + p.y;
				node_element.style.left = view_data.abs_x + 'px';
				node_element.style.top = view_data.abs_y + 'px';
				node_element.style.display = '';
				node_element.style.visibility = 'visible';
				if (!node.isroot && node.children.length > 0) {
					expander_text = node.expanded ? '-' : '+';
					p_expander = this.layout.get_expander_point(node);
					expander.style.left = (_offset.x + p_expander.x) + 'px';
					expander.style.top = (_offset.y + p_expander.y) + 'px';
					expander.style.display = '';
					expander.style.visibility = 'visible';
					$t(expander, expander_text);
				}
				// hide expander while all children have been removed
				if (!node.isroot && node.children.length == 0) {
					expander.style.display = 'none';
					expander.style.visibility = 'hidden';
				}
			}
		},

		reset_node_custom_style: function (node) {
			this.clear_node_custom_style(node);
			this._reset_node_custom_style(node._data.view.element, node.data);
		},

		clear_node_custom_style: function (node) {
			let node_element = node._data.view.element;
			node_element.style.backgroundColor = null;
			node_element.style.color = null;
			node_element.style.width = null;
			node_element.style.height = null;
			node_element.style.fontSize = null;
			node_element.style.fontWeight = null;
			node_element.style.fontFamily = null;
			node_element.style.backgroundImage = null;
			node_element.style.transform = null;
		},

		_reset_node_custom_style: function (node_element, node_data) {
			if (!!node_data['background-color']) {
				node_element.style.backgroundColor = node_data['background-color'];
			}
			if (!!node_data['foreground-color']) {
				node_element.style.color = node_data['foreground-color'];
			}
			if (!!node_data['width']) {
				node_element.style.width = node_data['width'] + 'px';
			}
			if (!!node_data['height']) {
				node_element.style.height = node_data['height'] + 'px';
			}
			if (!!node_data['font-size']) {
				node_element.style.fontSize = node_data['font-size'] + 'px';
			}
			if (!!node_data['font-weight']) {
				node_element.style.fontWeight = node_data['font-weight'];
			}
			if (node_data['font-family']) {
				node_element.style.fontFamily = node_data['font-family'];
			}
			if (!!node_data['background-image']) {
				let backgroundImage = node_data['background-image'];
				if (backgroundImage.startsWith('data') && node_data['width'] && node_data['height']) {
					let img = new Image();

					img.onload = function () {
						let c = $c('canvas');
						c.width = node_element.clientWidth;
						c.height = node_element.clientHeight;
						let img = this;
						if (c.getContext) {
							let ctx = c.getContext('2d');
							ctx.drawImage(img, 2, 2, node_element.clientWidth, node_element.clientHeight);
							let scaledImageData = c.toDataURL();
							node_element.style.backgroundImage = 'url(' + scaledImageData + ')';
						}
					};
					img.src = backgroundImage;

				} else {
					node_element.style.backgroundImage = 'url(' + backgroundImage + ')';
				}
				node_element.style.backgroundSize = '99% 99%';

				if ('background-rotation' in node_data) {
					node_element.style.transform = 'rotate(' + node_data['background-rotation'] + 'deg)';
				}
			}
		},

		reset_select_custom_style: function () {
			this._reset_select_custom_style();
		},

		_reset_select_custom_style: function () {
			const selected_data = this.jm.mind.selected_data;
			const selected_element = this.selected_node._data.view.element;
			if (!!selected_data['outline-color']) {
				target_element.style.outlineColor = selected_data['outline-color'];
			}
			if (!!selected_data['outline-width']) {
				target_element.style.outlineWidth = selected_data['outline-width'] + 'px';
			}
			if (!!selected_data['outline-style']) {
				target_element.style.outlineStyle = selected_data['outline-style'];
			}
			if (!!selected_data['background-color']) {
				selected_element.style.backgroundColor = selected_data['background-color'];
			}
			if (!!selected_data['foreground-color']) {
				selected_element.style.color = selected_data['foreground-color'];
			}
		},

		clear_select_custom_style: function () {
			let selected_element = this.selected_node._data.view.element;
			selected_element.style.backgroundColor = "";
			selected_element.style.color = "";
			selected_element.style.outlineColor = "";
			selected_element.style.outlineStyle = "";
			selected_element.style.outlineWidth = "";
		},

		clear_lines: function () {
			this.graph.clear();
		},

		show_lines: function () {
			this.clear_lines();
			const line_style = this.opts.line_style;
			switch(line_style) {
				case 'curve':
					this._show_curve_lines();
					break;
				case 'line':
					this._show_line_lines();
					break;
				case 'bracket': 
					this._show_bracket_lines();
					break;
				case 'curveAndBracket':
					this._show_bracket_curve_lines();
					break;
				default:
					this._show_default_lines();
					break;
			}
		},

		_show_default_lines: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pin = null;
			let pout = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!!node.isroot) { continue; }
				if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
				pin = this.layout.get_node_point_in(node);
				pout = this.layout.get_node_point_out(node.parent);
				this.graph.draw_line(pout, pin, _offset);
			}
		},

		_show_curve_lines: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pin = null;
			let pout = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!!node.isroot) { continue; }
				if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
				pin = this.layout.get_node_point_in(node);
				pout = this.layout.get_node_point_out(node.parent);
				this.graph.draw_line(pout, pin, _offset, 'curve');
			}	
		},

		_show_line_lines: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pin = null;
			let pout = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!!node.isroot) { continue; }
				if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
				pin = this.layout.get_node_point_in(node);
				pout = this.layout.get_node_point_out(node.parent);
				this.graph.draw_line(pout, pin, _offset, 'line');
			}
		},
		
		_show_bracket_lines: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pin = null;
			let pout = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!!node.isroot) { continue; }
				if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
				pin = this.layout.get_node_point_in(node);
				pout = this.layout.get_node_point_out(node.parent);
				this.graph.draw_line(pout, pin, _offset, 'bracket');
			}	
		},

		_show_bracket_curve_lines: function () {
			let nodes = this.jm.mind.nodes;
			let node = null;
			let pin = null;
			let pout = null;
			let _offset = this.get_view_offset();
			for (let nodeid in nodes) {
				node = nodes[nodeid];
				if (!!node.isroot) { continue; }
				if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
				pin = this.layout.get_node_point_in(node);
				pout = this.layout.get_node_point_out(node.parent);
				if (!!node.parent.isroot) {
					this.graph.draw_line(pout, pin, _offset, 'curve');
				} else {
					this.graph.draw_line(pout, pin, _offset, 'bracket');
				}
				
			}		
		}

	};

	// shortcut provider
	jm.shortcut_provider = function (jm, options) {
		this.jm = jm;
		this.opts = options;
		this.mapping = options.mapping;
		this.handles = options.handles;
		this.newNodeText = options.newNodeText;
		this._newid = null;
		this._mapping = {};
	};

	jm.shortcut_provider.prototype = {
		init: function () {
			jm.util.dom.add_event($d, 'keydown', this.handler.bind(this));

			this.handles['addchild'] = this.handle_addchild;
			this.handles['addbrother'] = this.handle_addbrother;
			this.handles['editnode'] = this.handle_editnode;
			this.handles['delnode'] = this.handle_delnode;
			this.handles['toggle'] = this.handle_toggle;
			this.handles['up'] = this.handle_up;
			this.handles['down'] = this.handle_down;
			this.handles['left'] = this.handle_left;
			this.handles['right'] = this.handle_right;
			this.handles['back'] = this.handle_back;
			this.handles['forward'] = this.handle_forward;

			for (let handle in this.mapping) {
				if (!!this.mapping[handle] && (handle in this.handles)) {
					if (this.mapping[handle] instanceof Array) {
						for (let k of this.mapping[handle]) {
							this._mapping[k] = this.handles[handle];
						}
					} else {
						this._mapping[this.mapping[handle]] = this.handles[handle];
					}
				}
			}

			if (typeof this.opts.id_generator === 'function') {
				this._newid = this.opts.id_generator;
			} else {
				this._newid = jm.util.uuid.newid;
			}
		},

		enable_shortcut: function () {
			this.opts.enable = true;
		},

		disable_shortcut: function () {
			this.opts.enable = false;
		},

		handler: function (e) {
			if (e.which == 9) { e.preventDefault(); } //prevent tab to change focus in browser
			if (this.jm.view.is_editing()) { return; }
			let evt = e;
			if (!this.opts.enable) { return true; }
			let kc = evt.keyCode + (evt.metaKey << 13) + (evt.ctrlKey << 12) + (evt.altKey << 11) + (evt.shiftKey << 10);
			if (kc in this._mapping) {
				this._mapping[kc].call(this, this.jm, e);
			}
		},

		handle_addchild: function (_jm, e) {
			let selected_node = _jm.get_selected_node();
			if (!!selected_node) {
				let nodeid = this._newid();
				let node = _jm.add_node(selected_node, nodeid, this.newNodeText);
				if (!!node) {
					_jm.select_node(nodeid);
					_jm.begin_edit(nodeid);
				}
			}
		},
		handle_addbrother: function (_jm, e) {
			e.preventDefault();
			let selected_node = _jm.get_selected_node();
			if (!!selected_node && !selected_node.isroot) {
				let nodeid = this._newid();
				let node = _jm.insert_node_after(selected_node, nodeid, this.newNodeText);
				if (!!node) {
					_jm.select_node(nodeid);
					_jm.begin_edit(nodeid);
				}
			}
		},
		handle_editnode: function (_jm, e) {
			let selected_node = _jm.get_selected_node();
			if (!!selected_node) {
				_jm.begin_edit(selected_node);
			}
		},
		handle_delnode: function (_jm, e) {
			let selected_node = _jm.get_selected_node();
			if (!!selected_node && !selected_node.isroot) {
				_jm.select_clear();
				_jm.remove_node(selected_node);
			}
		},
		handle_toggle: function (_jm, e) {
			let evt = e || event;
			let selected_node = _jm.get_selected_node();
			if (!!selected_node) {
				_jm.toggle_node(selected_node.id);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},
		handle_up: function (_jm, e) {
			let evt = e || event;
			let selected_node = _jm.get_selected_node();
			if (!!selected_node) {
				let up_node = _jm.find_node_before(selected_node);
				if (!up_node) {
					let np = _jm.find_node_before(selected_node.parent);
					if (!!np && np.children.length > 0) {
						up_node = np.children[np.children.length - 1];
					}
				}
				if (!!up_node) {
					_jm.select_node(up_node);
				}
				evt.stopPropagation();
				evt.preventDefault();
			}
		},
		handle_down: function (_jm, e) {
			let evt = e || event;
			let selected_node = _jm.get_selected_node();
			if (!!selected_node) {
				let down_node = _jm.find_node_after(selected_node);
				if (!down_node) {
					let np = _jm.find_node_after(selected_node.parent);
					if (!!np && np.children.length > 0) {
						down_node = np.children[0];
					}
				}
				if (!!down_node) {
					_jm.select_node(down_node);
				}
				evt.stopPropagation();
				evt.preventDefault();
			}
		},
		handle_left: function (_jm, e) {
			this._handle_direction(_jm, e, jm.direction.left);
		},
		handle_right: function (_jm, e) {
			this._handle_direction(_jm, e, jm.direction.right);
		},
		_handle_direction: function (_jm, e, d) {
			let evt = e || event;
			let selected_node = _jm.get_selected_node();
			let node = null;
			if (!!selected_node) {
				if (selected_node.isroot) {
					let c = selected_node.children;
					let children = [];
					for (let i = 0; i < c.length; i++) {
						if (c[i].direction === d) {
							children.push(i);
						}
					}
					node = c[children[Math.floor((children.length - 1) / 2)]];
				}
				else if (selected_node.direction === d) {
					let children = selected_node.children;
					let childrencount = children.length;
					if (childrencount > 0) {
						node = children[Math.floor((childrencount - 1) / 2)];
					}
				} else {
					node = selected_node.parent;
				}
				if (!!node) {
					_jm.select_node(node);
				}
				evt.stopPropagation();
				evt.preventDefault();
			}
		},
		handle_back: function (_jm, e) {
			let evt = e;
			_jm._step_back();
			evt.stopPropagation();
			evt.preventDefault();
		},
		handle_forward: function (_jm, e) {
			let evt = e;
			_jm._step_forward();
			evt.stopPropagation();
			evt.preventDefault();
		}
	};


	// plugin
	jm.plugin = function (name, init) {
		this.name = name;
		this.init = init;
	};

	jm.plugins = [];

	jm.register_plugin = function (plugin) {
		if (plugin instanceof jm.plugin) {
			jm.plugins.push(plugin);
		}
	};

	jm.init_plugins = function (sender) {
		$w.setTimeout(function () {
			jm._init_plugins(sender);
		}, 0);
	};

	jm._init_plugins = function (sender) {
		let l = jm.plugins.length;
		let fn_init = null;
		for (let i = 0; i < l; i++) {
			fn_init = jm.plugins[i].init;
			if (typeof fn_init === 'function') {
				fn_init(sender);
			}
		}
	};

	// quick way to show
	jm.show = function (options, mind) {
		let _jm = new jm(options);
		_jm.show(mind);
		return _jm;
	};

	// export jsmind
	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = jm;
	} else if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(function () { return jm; });
	} else {
		$w[__name__] = jm;
	}
})(typeof window !== 'undefined' ? window : global);

