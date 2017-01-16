;
(function(document, window, undefined) {

	'use strict';

	// Polyfill
	if (window.Element && !Element.prototype.closest) {
		Element.prototype.closest = function(s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s),
				i,
				el = this;
			do {
				i = matches.length;
				while (--i >= 0 && matches.item(i) !== el) {};
			} while ((i < 0) && (el = el.parentElement));
			return el;
		};
	}

	function noop() {};

	function $Dom(list) {
		this.list = [];
		if (typeof list === 'object') {
			this.list = list; //NodeList
		}

		this.length = this.list.length;
	};

	$Dom.prototype._apply = function(action) {
		var count = this.list.length;
		for (var i = 0; i < count; ++i) {
			var item = this.list[i];
			try {
				action(item, i);
			} catch ($e) {
				console.error($e);
			}
		}
		return this;
	};
	$Dom.prototype.each = function(callback) {
		return this._apply(callback || noop);
	};
	$Dom.prototype.closest = function(selector) {
		var firstEl = this.first();
		if (firstEl) {
			var el = firstEl.closest(selector);
			return $(el);
		}
		return new $Dom();
	};
	$Dom.prototype.on = function(eventName, callback) {
		var action = function(el) {
			if (el)
				el.addEventListener(eventName, callback, false);
		};
		return this._apply(action);
	};
	$Dom.prototype.off = function(eventName, callback) {
		var action = function(el) {
			el.removeEventListener(eventName, callback, false);
		};
		return this._apply(action);
	};
	$Dom.prototype.find = function(selector) {
		var firstEl = this.first();
		if (firstEl) {
			var el = firstEl.querySelectorAll(selector);
			if (el.length)
				return new $Dom([].slice.call(el));
		}
		return new $Dom();
	};
	$Dom.prototype.hide = function() {
		var action = function(el) {
			el.style.display = 'hide';
		};
		return this._apply(action);
	};
	$Dom.prototype.show = function() {
		var action = function(el) {
			el.style.display = 'block';
		};
		return this._apply(action);
	};
	$Dom.prototype.hasClass = function(c) {
		var firstEl = this.first();
		return firstEl.className && new RegExp("(\\s|^)" + c + "(\\s|$)").test(firstEl.className);
	};
	$Dom.prototype.addClass = function(c) {
		var action = function(el) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
			if (re.test(el.className)) return;
			el.className = (el.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
		};
		return this._apply(action);
	};
	$Dom.prototype.removeClass = function(c) {
		var action = function(el) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
			el.className = el.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
		};
		return this._apply(action);
	};
	$Dom.prototype.val = function(newVal) {
		var firstEl = this.first(),
			val = null;
		if (firstEl) {
			if (newVal) {
				firstEl.value = newVal;
			} else {
				val = firstEl.value;
			}
		}
		return val;
	};
	$Dom.prototype.first = function() {
		return this.list.length > 0 ? this.list[0] : null;
	};
	$Dom.prototype.attr = function() {
		var $el = this.first();
		if (arguments.length == 1) {
			return $el.getAttribute(arguments[0]);
		} else if (arguments.length == 2) {
			$el.getAttribute(arguments[0], arguments[1])
			return this;
		}
	};
	$Dom.prototype.eq = function(index) {
		if (index > this.length) {
			return null;
		} else {
			return !!this.list[index] ? this.list[index] : null;
		}
	};
	$Dom.prototype.append = function(obj) {
		var $el = this.first();
		if (typeof obj === 'string') {
			$el.innerHTML += obj;
		} else {
			$el.appendChild(obj);
		}
		return this;
	};
	$Dom.prototype.html = function(html) {
		var $el = this.first();
		var innerHtml = $el.innerHTML;
		if (!html)
			return innerHtml;
		else
			$el.innerHTML = html;

	};
	$Dom.prototype.outerHtml = function() {
		var $el = this.first();
		return $el.outerHTML;
	};
	$Dom.prototype.remove = function() {
		var $el = this.first();
		$el.parentNode.removeChild($el);
	};

	// exporta
	window['$'] = function(selector) {
		var el;

		if (typeof selector === 'string') {
			el = document.querySelectorAll(selector);
		} else if (typeof selector === 'object') {
			el = [selector];
		}

		return new $Dom(el);
	};

})(document, window);
