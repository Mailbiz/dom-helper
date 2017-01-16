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
				while (--i >= 0 && matches.item(i) !== el) {} //jshint ignore: line
			} while ((i < 0) && (el = el.parentElement));
			return el;
		};
	}

	if (!window.addEventListener) {
		(function(WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
			WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function(type, listener) {
				var target = this;

				registry.unshift([target, type, listener, function(event) {
					event.currentTarget = target;
					event.preventDefault = function() {
						event.returnValue = false;
					};
					event.stopPropagation = function() {
						event.cancelBubble = true;
					};
					event.target = event.srcElement || target;

					listener.call(target, event);
				}]);

				this.attachEvent('on' + type, registry[0][3]);
			};

			WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function(type, listener) {
				for (var index = 0, register; register = registry[index]; ++index) {
					if (register[0] === this && register[1] === type && register[2] === listener) {
						return this.detachEvent('on' + type, registry.splice(index, 1)[0][3]);
					}
				}
			};

			WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function(eventObject) {
				return this.fireEvent('on' + eventObject.type, eventObject);
			};
		})(Window.prototype, HTMLDocument.prototype, Element.prototype, 'addEventListener', 'removeEventListener', 'dispatchEvent', []);
	}
	// End Polyfill

	function noop() {}

	function DomHelper(list) {
		this.list = [];
		if (typeof list === 'object') {
			this.list = list; //NodeList
		}

		this.length = this.list.length;
	}

	DomHelper.prototype._applyEach = function(action) {
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
	DomHelper.prototype.each = function(callback) {
		return this._applyEach(callback || noop);
	};
	DomHelper.prototype.closest = function(selector) {
		var $el = this.first();
		if ($el) {
			var el = $el.closest(selector);
			return $(el);
		}
		return new DomHelper();
	};
	DomHelper.prototype.on = function(eventName, callback) {
		var action = function(el) {
			if (el) {
				el.addEventListener(eventName, callback, false);
			}
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.off = function(eventName, callback) {
		var action = function(el) {
			el.removeEventListener(eventName, callback, false);
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.find = function(selector) {
		var $el = this.first();
		if ($el) {
			var el = $el.querySelectorAll(selector);
			if (el.length) {
				return new DomHelper([].slice.call(el));
			}
		}
		return new DomHelper();
	};
	DomHelper.prototype.hide = function() {
		var action = function(el) {
			el.style.display = 'hide';
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.show = function() {
		var action = function(el) {
			el.style.display = 'block';
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.hasClass = function(c) {
		var $el = this.first();
		return $el.className && new RegExp('(\\s|^)' + c + '(\\s|$)').test($el.className);
	};
	DomHelper.prototype.addClass = function(c) {
		var action = function(el) {
			var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
			if (re.test(el.className)) {
				return;
			}
			el.className = (el.className + ' ' + c).replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.removeClass = function(c) {
		var action = function(el) {
			var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
			el.className = el.className.replace(re, '$1').replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
		};
		return this._applyEach(action);
	};
	DomHelper.prototype.val = function(newVal) {
		var $el = this.first(),
			val = null;
		if ($el) {
			if (newVal) {
				$el.value = newVal;
			} else {
				val = $el.value;
			}
		}
		return val;
	};
	DomHelper.prototype.first = function() {
		return this.list.length > 0 ? this.list[0] : null;
	};
	DomHelper.prototype.attr = function() {
		var $el = this.first();
		if (arguments.length === 1) {
			return $el.getAttribute(arguments[0]);
		} else if (arguments.length === 2) {
			$el.getAttribute(arguments[0], arguments[1]);
			return this;
		}
	};
	DomHelper.prototype.eq = function(index) {
		if (index > this.length) {
			return null;
		} else {
			return !!this.list[index] ? this.list[index] : null;
		}
	};
	DomHelper.prototype.append = function(obj) {
		var $el = this.first();
		if (typeof obj === 'string') {
			$el.innerHTML += obj;
		} else {
			$el.appendChild(obj);
		}
		return this;
	};
	DomHelper.prototype.html = function(html) {
		var $el = this.first();
		var innerHtml = $el.innerHTML;
		if (!html) {
			return innerHtml;
		} else {
			$el.innerHTML = html;
		}
	};
	DomHelper.prototype.outerHtml = function() {
		var $el = this.first();
		return $el.outerHTML;
	};
	DomHelper.prototype.remove = function() {
		var $el = this.first();
		$el.parentNode.removeChild($el);
	};

	// exporta
	window.$ = function(selector) {
		var el;

		if (typeof selector === 'string') {
			el = document.querySelectorAll(selector);
		} else if (typeof selector === 'object') {
			el = [selector];
		}

		return new DomHelper(el);
	};

})(document, window);
