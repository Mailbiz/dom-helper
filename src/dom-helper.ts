import { IDomHelperInitializer, IDomHelper, CallbackFunction } from './types';

export { IDomHelperInitializer, IDomHelper, CallbackFunction };

declare global {
	interface Node {
		myCustomDataTag: any;
		closest(selectors: string): NodeList;
		matches(selector: string): boolean;
	}
}

function extend(first: { [x: string]: any }, second: { [x: string]: any }) {
	for (const secondProp in second) {
		const secondVal = second[secondProp];
		// Is this value an object?  If so, iterate over its properties, copying them over
		if (secondVal && Object.prototype.toString.call(secondVal) === '[object Object]') {
			first[secondProp] = first[secondProp] || {};
			extend(first[secondProp], secondVal);
		} else {
			first[secondProp] = secondVal;
		}
	}
	return first;
}

function typeOf(value: any) {
	let s: string = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
	}
	return s;
}

function noop() {}

//#endregion AJAX
function sendRequest(url: string, ajaxData: any, postData: any) {
	const onErrror = ajaxData.error || noop;
	const onSuccess = ajaxData.success || noop;
	const onComplete = ajaxData.complete || noop;

	const req = createXMLHTTPObject();
	if (!req) return;
	const method = postData ? 'POST' : 'GET';
	req.open(method, url, true);
	// Setting the user agent is not allowed in most modern browsers It was
	// a requirement for some Internet Explorer versions a long time ago.
	// There is no need for this header if you use Internet Explorer 7 or
	// above (or any other browser)
	// req.setRequestHeader('User-Agent','XMLHTTP/1.0');
	if (postData) {
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		if (typeof postData === 'object') {
			try {
				postData = Object.keys(postData)
					.map(function (k) {
						return encodeURIComponent(k) + '=' + encodeURIComponent(postData[k]);
					})
					.join('&');
			} catch ($er) {}
		}
	}
	req.onreadystatechange = function () {
		if (req.readyState != 4) {
			return;
		}
		onComplete();
		if (req.status != 200 && req.status != 201 && req.status != 304) {
			onErrror(tryParseResponse(req));
			return;
		}
		onSuccess(tryParseResponse(req));
	};
	if (req.readyState == 4) return;
	req.send(postData);
}

function tryParseResponse(req: any) {
	try {
		const jsonResponse = JSON.parse(req.responseText);
		return jsonResponse;
	} catch ($e) {
		return req.responseText;
	}
}

const XMLHttpFactories = [
	function () {
		return new XMLHttpRequest();
	},
	function () {
		return new ActiveXObject('Msxml3.XMLHTTP');
	},
	function () {
		return new ActiveXObject('Msxml2.XMLHTTP.6.0');
	},
	function () {
		return new ActiveXObject('Msxml2.XMLHTTP.3.0');
	},
	function () {
		return new ActiveXObject('Msxml2.XMLHTTP');
	},
	function () {
		return new ActiveXObject('Microsoft.XMLHTTP');
	},
];

function createXMLHTTPObject(): XMLHttpRequest {
	let xmlhttp = null;
	for (let i = 0; i < XMLHttpFactories.length; i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		} catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}
//#endregion

//#region READY
function domReady(callBack: any) {
	if (document.readyState === 'loading') {
		return document.addEventListener('DOMContentLoaded', callBack);
	}

	callBack();
}
//#endregion

//#region loadScript
function loadScript(u: string, async?: boolean) {
	const d = document;
	const t = 'script';
	const o = d.createElement(t) as HTMLScriptElement;
	const s = d.getElementsByTagName(t)[0] as HTMLScriptElement;
	o.src = u;
	o.async = async ?? true;
	(s.parentNode as HTMLScriptElement).insertBefore(o, s);
}
//#endregion

//#region getQueryParameter
function getQueryParameter(name: string, url?: string) {
	if (!url) {
		url = window.location.href;
	}

	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
	const results = regex.exec(url);
	if (!results) {
		return null;
	}
	if (!results[2]) {
		return '';
	}
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
//#endregion

const dataStorager = (function () {
	let lastId = 0;
	const store: Record<number, unknown> = {};

	return {
		set: function (element: Node, info: any) {
			let id = 0;
			if (element.myCustomDataTag === undefined) {
				id = lastId++;
				element.myCustomDataTag = id;
			}
			store[id] = info;
		},

		get: function (element: Node) {
			return store[element.myCustomDataTag];
		},
	};
})();

class DomHelper implements IDomHelper {
	list: NodeList | Node[] | string[] = [];
	length: number;

	constructor(list?: NodeList | Node[] | string[]) {
		// this.list = [] as unknown as NodeList;
		if (typeof list === 'object') {
			// this.list = list; //NodeList

			this.list =
				typeOf(list) === 'array' || list instanceof NodeList || list.length ? list : ([list] as unknown as Node[]);
		}

		this.length = this.list?.length ?? 0;
	}

	_applyEach(action: CallbackFunction): DomHelper {
		const count = this.list.length;
		for (let i = 0; i < count; ++i) {
			const item = this.list[i];
			try {
				action.call(item as any, item as any, i);
			} catch ($e) {
				console.error($e);
			}
		}
		return this;
	}

	each(callback: CallbackFunction): DomHelper {
		return this._applyEach(callback);
	}

	closest(selector: string): DomHelper {
		const $el = this.first() as HTMLElement;
		if ($el) {
			const el = $el.closest(selector);
			return new DomHelper([el as Node]);
		}
		return new DomHelper();
	}

	data(key: string, value?: any) {
		const $el = this.first();
		const d = (dataStorager.get($el as unknown as Node) ?? {}) as Record<string, unknown>;

		if (!key && !value) {
			return d;
		}

		if (value === undefined) {
			return d[key];
		}

		d[key] = value;

		return dataStorager.set($el as unknown as Node, d);
	}

	on(eventName: string, callback: Function) {
		const action: CallbackFunction = (el: any) => {
			if (el) {
				const events = eventName.split(' ');
				$constructor(events).each((ev) => {
					el.addEventListener(ev, callback, false);
				});
			}
		};
		return this._applyEach(action);
	}

	off(eventName: string, callback: Function) {
		const action = (el: any) => {
			const events = eventName.split(' ');
			$constructor(events).each((ev) => {
				el.removeEventListener(ev, callback, false);
			});
		};
		return this._applyEach(action);
	}

	is(selector: string) {
		const $el = this.first() as HTMLElement;
		if (!$el) {
			return false;
		}

		return $el.matches(selector);
	}

	find(selector: string) {
		const $el = this.first() as HTMLElement;
		if ($el && $el.querySelectorAll) {
			const el = $el.querySelectorAll(selector);
			if (el.length) {
				return new DomHelper(el);
			}
		}
		return new DomHelper();
	}

	hide() {
		const action = ({ style }: HTMLElement) => {
			style.display = 'hide';
		};
		return this._applyEach(action);
	}

	show() {
		const action = ({ style }: HTMLElement) => {
			style.display = 'block';
		};
		return this._applyEach(action);
	}

	hasClass(c: string) {
		const $el = this.first() as HTMLElement;
		return !!($el && $el.className && new RegExp(`(\\s|^)${c}(\\s|$)`).test($el.className));
	}

	addClass(c: string): DomHelper {
		const action = (el: HTMLElement) => {
			const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
			if (re.test(el.className)) {
				return;
			}
			el.className = `${el.className} ${c}`.replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
		};
		return this._applyEach(action);
	}

	removeClass(c: string) {
		const action = (el: HTMLElement) => {
			const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
			el.className = el.className
				.replace(re, '$1')
				.replace(/\s+/g, ' ')
				.replace(/(^ | $)/g, '');
		};
		return this._applyEach(action);
	}

	val(newVal: string | number) {
		const $el = this.first() as HTMLInputElement;
		let val = null;
		if ($el) {
			if (newVal) {
				$el.value = newVal.toString();
			} else {
				val = $el.value;
			}
		}
		return val;
	}

	first() {
		return this.list.length > 0 ? this.list[0] : null;
	}

	attr(key: string, val?: string) {
		const $el = this.first() as HTMLElement;
		if (!$el || !$el.getAttribute || !$el.setAttribute) {
			return undefined;
		}
		if (!val) {
			return $el.getAttribute(key);
		} else {
			$el.setAttribute(key, val);
			return this;
		}
	}

	append(obj: Node | string) {
		const $el = this.first() as HTMLElement;
		if (!$el) {
			return undefined;
		}
		if (typeof obj === 'string') {
			$el.innerHTML += obj.toString();
		} else {
			$el.appendChild(obj);
		}
		return this;
	}

	html(html?: string): string | void {
		const $el = this.first() as HTMLElement;
		if (!$el) {
			return undefined;
		}
		const innerHtml = $el.innerHTML;
		if (!html) {
			return innerHtml;
		} else {
			$el.innerHTML = html;
		}
	}

	outerHtml() {
		const $el = this.first() as HTMLElement;
		if (!$el) {
			return undefined;
		}
		return $el.outerHTML;
	}

	remove() {
		const $el = this.first() as HTMLElement;
		if (!$el || !$el.parentNode) {
			return undefined;
		}

		$el.parentNode.removeChild($el);
	}
}

function $constructor(selector?: any | any[]): DomHelper {
	let el;

	if (typeOf(selector) === 'string') {
		try {
			el = document.querySelectorAll(selector.toString()) as NodeList;
		} catch (err) {}
	} else if (typeOf(selector) === 'array') {
		if (typeof (selector as any[])[0] === 'string') {
			el = selector as string[];
		} else {
			el = selector as Node[];
		}
	} else if (typeOf(selector) === 'object') {
		el = [selector] as Node[];
	}

	return new DomHelper(el);
}

$constructor.ready = domReady;
$constructor.extend = extend;
$constructor.typeOf = typeOf;
$constructor.loadScript = loadScript;
$constructor.getQueryParameter = getQueryParameter;

$constructor.ajax = function (ajaxData: Record<string, any>) {
	const url = ajaxData.url;
	const postData = typeOf(ajaxData.type) === 'string' && ajaxData.type.toLowerCase() === 'post' ? ajaxData.data : null;

	return sendRequest(url, ajaxData, postData);
};

export { $constructor };
