'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('underscore');
var http = require('http');
var url = require('url');

var _class = function (_Base) {
	(0, _inherits3.default)(_class, _Base);

	function _class() {
		(0, _classCallCheck3.default)(this, _class);
		return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
	}

	/**
  * index action
  * @return {Promise} []
  */

	_class.prototype.indexAction = function indexAction() {
		//auto render template file index_index.html
		this.assign({
			result: this.http.query
		});
		return this.display();
	};

	_class.prototype.dataAction = function dataAction() {

		var obj = this.get();

		var version_new = this.get("compate-new") == "on" ? true : false;
		var version_old = this.get("compate-old") == "on" ? true : false;
		var version_tweener = this.get("compate-tweener") == "on" ? true : false;

		/*
   * splitParentChild 对form表单数据进行分类
   * obj 提交的表单对象
   * 返回 Object {"parent","children"}
   */
		var collectionForm = function (obj) {
			var parent = {},
			    child = {};
			for (var prop in obj) {
				if (prop == "compate-new" || prop == "compate-old" || prop == "compate-tweener" || prop == "rtl") {
					continue;
				}
				if (prop.indexOf('[]') > -1) {
					var _$extend;

					_.extend(child, (_$extend = {}, _$extend[prop] = obj[prop], _$extend));
				} else {
					var _$extend2;

					_.extend(parent, (_$extend2 = {}, _$extend2[prop] = obj[prop], _$extend2));
				}
			}
			return { "parent": parent, "child": child };
		}(obj);
		// console.log(collectionForm)

		var parentPropOpt = function parentPropOpt(obj) {
			var arr = [".flex-container{"];
			for (var prop in obj) {
				arr.push(prop + ":" + obj[prop] + ";");
			}
			arr.push("}");
			return arr;
		};

		// console.log(parentPropOpt(collectionForm.parent).join(";\n"));
		var childPropOpt = function childPropOpt(obj) {
			var keys = _.keys(obj);
			var len = _.values(obj)[0].length; // 子项的数量,取第一个属性值的长度
			var itemsArr = [];
			var arr = [];

			for (var i = 0; i < len; i++) {
				itemsArr[i] = [".flex-item:nth-child(" + (i + 1) + "){"];
				for (var j = 0; j < keys.length; j++) {
					var name = keys[j].replace("[]", "");
					itemsArr[i].push(name + ":" + obj[keys[j]][i] + ";");
				}
				itemsArr[i].push("}");
			};

			for (var i = 0; i < len; i++) {
				arr = arr.concat(itemsArr[i]);
			}
			return arr;
		};
		// console.log(childPropOpt(collectionForm.child).join(";\n"));
		var old = {
			"display": "box",
			"flex-direction": {
				"row": {
					"box-direction": "normal",
					"box-orient": "horizontal"
				},
				"row-reverse": {
					"box-direction": "reverse",
					"box-orient": "horizontal"
				},
				"column": {
					"box-direction": "normal",
					"box-orient": "vertical"
				},
				"column-reverse": {
					"box-direction": "reverse",
					"box-orient": "vertical"
				}
			},
			"flex-wrap": null,
			"justify-content": {
				prop: "box-pack",
				vals: {
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"space-between": "justify",
					"space-around": "justify"
				}
			},
			"align-items": {
				prop: "box-align",
				vals: {
					stretch: "stretch",
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"baseline": "baseline"
				}
			},
			"align-content": null,
			"order": {
				prop: "box-ordinal-group" // 取值范围>=1,在标准值上+1
			},
			"align-self": null
		};
		var tweener = {
			"display": "flexbox",
			"justify-content": {
				prop: "flex-pack",
				vals: {
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"space-between": "justify",
					"space-around": "justify"
				}
			},
			"align-items": {
				prop: "flex-align",
				vals: {
					stretch: "stretch",
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"baseline": "baseline"
				}
			},
			"align-content": {
				prop: "flex-line-pack",
				vals: {
					stretch: "stretch",
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"baseline": "baseline"
				}
			},
			"order": {
				prop: "flex-order"
			},
			"align-self": {
				prop: "flex-item-align",
				vals: {
					auto: "auto",
					"flex-start": "start",
					"flex-end": "end",
					"center": "center",
					"stretch": "stretch"
				}
			}
		};

		/*
   * cssHTML 生成添加浏览器标识之后的数组c
   * @ prefixes 需要兼容的写法
   * @ key 属性
   * @ val 值
   * @ isVal 判断属性是否需要添加浏览器标识
   */
		var cssHtml = function cssHtml(compate, key, val, isVal) {
			var prefixes = [];
			if (compate == "new") {
				prefixes = ['-webkit-', ''];
			} else if (compate == "old") {
				prefixes = ['-webkit-', '-moz-'];
			} else if (compate == "tweener") {
				prefixes = ['-ms-'];
			}
			var len = prefixes && prefixes.length;
			var arr = [];
			if (isVal) {
				for (var i = 0; i < len; i++) {
					arr.push(key + ":" + prefixes[i] + val + ";");
				}
			} else {
				for (var i = 0; i < len; i++) {
					arr.push(prefixes[i] + key + ":" + val + ";");
				}
			}
			return arr;
		};

		var compateParentOpt = function compateParentOpt(obj) {
			var arr = [".flex-container{"];
			for (var prop in obj) {
				if (version_new) {
					if (prop == "display") {
						arr = arr.concat(cssHtml("new", prop, obj[prop], true));
					} else {
						arr = arr.concat(cssHtml("new", prop, obj[prop]));
					}
				}
				if (version_old) {
					if (prop == "display") {
						arr = arr.concat(cssHtml("old", prop, old[prop], true));
					} else if (prop == "flex-direction") {
						var values = old[prop][obj[prop]];
						for (var key in values) {
							arr = arr.concat(cssHtml("old", key, values[key]));
						}
					} else {
						if (old[prop]) {
							var _prop = old[prop]["prop"],
							    _val = old[prop]["vals"][obj[prop]];
							arr = arr.concat(cssHtml("old", _prop, _val));
						}
					}
				}
				if (version_tweener) {
					if (prop == "display") {
						arr = arr.concat(cssHtml("tweener", prop, tweener[prop], true));
					} else {
						var _prop = tweener[prop]; // 该属性在tweener存在说明需要进行处理
						if (_prop) {
							arr = arr.concat(cssHtml("tweener", _prop["prop"], _prop["vals"][obj[prop]]));
						} else {
							// 属性值相同时不需要做特殊处理
							arr = arr.concat(cssHtml("tweener", prop, obj[prop]));
						}
					}
				}
			}
			arr.push("}");
			return arr;
		};
		var compateChildOpt = function compateChildOpt(obj) {
			var keys = _.keys(obj);
			var len = _.values(obj)[0].length; // 子项的数量,取第一个属性值的长度
			var arr = [];
			var itemsArr = [];
			var flexStr = [];
			for (var i = 0; i < len; i++) {
				itemsArr[i] = [".flex-item:nth-child(" + (i + 1) + "){"];
				for (var prop in obj) {
					var name = prop.replace("[]", "");
					if (name == "flex-grow") {
						if (obj[prop][i] < 0) {
							flexStr[i] = 0;
						} else {
							flexStr[i] = obj[prop][i];
						}
					} else if (name == "flex-shrink") {
						if (obj[prop][i] < 0) {
							flexStr[i] = flexStr[i] + " " + 1;
						} else {
							flexStr[i] = flexStr[i] + " " + obj[prop][i];
						}
					} else if (name == "flex-basis") {
						if (obj[prop][i] < 0) {
							flexStr[i] = flexStr[i] + " " + auto;
						} else {
							flexStr[i] = flexStr[i] + " " + obj[prop][i];
						}
					} else {
						// 与flex不相关的属性直接处理
						if (version_new) {
							itemsArr[i] = itemsArr[i].concat(cssHtml("new", name, obj[prop][i]));
						}
						if (version_old) {
							if (old[name]) {
								if (name == "order") {
									if (obj[prop][i] <= 0) {
										itemsArr[i] = itemsArr[i].concat(cssHtml("old", old[name]["prop"], 1));
									} else {
										itemsArr[i] = itemsArr[i].concat(cssHtml("old", old[name]["prop"], parseInt(obj[prop][i]) + 1));
									}
								} else {
									itemsArr[i] = itemsArr[i].concat(cssHtml("old", old[name]["prop"], obj[prop][i]));
								}
							}
						}
						if (version_tweener) {
							if (name == "order" && obj[prop][i] <= 0) {
								itemsArr[i] = itemsArr[i].concat(cssHtml("tweener", tweener[name]["prop"], 0));
							} else {
								itemsArr[i] = itemsArr[i].concat(cssHtml("tweener", tweener[name]["prop"], obj[prop][i]));
							}
						}
					}
					/* flex为flex-grow flex-shrink flex-basis的缩写
      * 判断flex的缩写完成后进行flex属性的定入
      */
					if (flexStr[i] && flexStr[i].split(" ").length == 3) {
						if (version_new) {
							itemsArr[i] = itemsArr[i].concat(cssHtml("new", "flex", flexStr[i]));
						}
						if (version_old) {
							itemsArr[i] = itemsArr[i].concat(cssHtml("old", "box-flex", flexStr[i].substr(0, 1)));
						}
						if (version_tweener) {
							itemsArr[i] = itemsArr[i].concat(cssHtml("tweener", "flex", flexStr[i]));
						}
					}
				}
				itemsArr[i] = itemsArr[i].concat(["}"]);

				arr = arr.concat(itemsArr[i]);
			}
			return arr;
		};
		var strArr = compateParentOpt(collectionForm.parent).concat(compateChildOpt(collectionForm.child));
		var vaniallaArr = parentPropOpt(collectionForm.parent).concat(childPropOpt(collectionForm.child)); // 当父,子的数组项合并
		if (obj) {
			this.success({
				kitchensink: strArr.join("\n"),
				vanialla: vaniallaArr.join("\n")
			}, "success");
		} else {
			this.fail(1000, 'params error');
		}
	};

	return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=index.js.map