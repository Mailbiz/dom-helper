function extend(first, second) {
    for (var secondProp in second) {
        var secondVal = second[secondProp];
        // Is this value an object?  If so, iterate over its properties, copying them over
        if (secondVal && Object.prototype.toString.call(secondVal) === '[object Object]') {
            first[secondProp] = first[secondProp] || {};
            extend(first[secondProp], secondVal);
        }
        else {
            first[secondProp] = secondVal;
        }
    }
    return first;
}
function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            }
        }
        else {
            s = 'null';
        }
    }
    return s;
}
function noop() { }
//#endregion AJAX
function sendRequest(url, ajaxData, postData) {
    var onErrror = ajaxData.error || noop;
    var onSuccess = ajaxData.success || noop;
    var onComplete = ajaxData.complete || noop;
    var req = createXMLHTTPObject();
    if (!req)
        return;
    var method = postData ? 'POST' : 'GET';
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
            }
            catch ($er) { }
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
    if (req.readyState == 4)
        return;
    req.send(postData);
}
function tryParseResponse(req) {
    try {
        var jsonResponse = JSON.parse(req.responseText);
        return jsonResponse;
    }
    catch ($e) {
        return req.responseText;
    }
}
var XMLHttpFactories = [
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
function createXMLHTTPObject() {
    var xmlhttp = null;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        }
        catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}
//#endregion
//#region READY
function domReady(callBack) {
    if (document.readyState === 'loading') {
        return document.addEventListener('DOMContentLoaded', callBack);
    }
    callBack();
}
//#endregion
//#region loadScript
function loadScript(u, async) {
    var d = document;
    var t = 'script';
    var o = d.createElement(t);
    var s = d.getElementsByTagName(t)[0];
    o.src = u;
    o.async = async !== null && async !== void 0 ? async : true;
    s.parentNode.insertBefore(o, s);
}
//#endregion
//#region getQueryParameter
function getQueryParameter(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
//#endregion
var dataStorager = (function () {
    var lastId = 0;
    var store = {};
    return {
        set: function (element, info) {
            var id = 0;
            if (element.myCustomDataTag === undefined) {
                id = lastId++;
                element.myCustomDataTag = id;
            }
            store[id] = info;
        },
        get: function (element) {
            return store[element.myCustomDataTag];
        }
    };
})();
var DomHelper = /** @class */ (function () {
    function DomHelper(list) {
        var _a, _b;
        this.list = [];
        this.list = [];
        if (typeof list === 'object') {
            // this.list = list; //NodeList
            this.list = typeOf(list) === 'array' ? list : [list];
        }
        this.length = (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    DomHelper.prototype._applyEach = function (action) {
        var count = this.list.length;
        for (var i = 0; i < count; ++i) {
            var item = this.list[i];
            try {
                action.call(item, item, i);
            }
            catch ($e) {
                console.error($e);
            }
        }
        return this;
    };
    DomHelper.prototype.each = function (callback) {
        return this._applyEach(callback);
    };
    DomHelper.prototype.closest = function (selector) {
        var $el = this.first();
        if ($el) {
            var el = $el.closest(selector);
            return new DomHelper([el]);
        }
        return new DomHelper();
    };
    DomHelper.prototype.data = function (key, value) {
        var _a;
        var $el = this.first();
        var d = ((_a = dataStorager.get($el)) !== null && _a !== void 0 ? _a : {});
        if (!key && !value) {
            return d;
        }
        if (value === undefined) {
            return d[key];
        }
        d[key] = value;
        return dataStorager.set($el, d);
    };
    DomHelper.prototype.on = function (eventName, callback) {
        var action = function (el) {
            if (el) {
                var events = eventName.split(' ');
                $constructor(events).each(function (ev) {
                    el.addEventListener(ev, callback, false);
                });
            }
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.off = function (eventName, callback) {
        var action = function (el) {
            var events = eventName.split(' ');
            $constructor(events).each(function (ev) {
                el.removeEventListener(ev, callback, false);
            });
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.is = function (selector) {
        var $el = this.first();
        if (!$el) {
            return false;
        }
        return $el.matches(selector);
    };
    DomHelper.prototype.find = function (selector) {
        var $el = this.first();
        if ($el && $el.querySelectorAll) {
            var el = $el.querySelectorAll(selector);
            if (el.length) {
                return new DomHelper(el);
            }
        }
        return new DomHelper();
    };
    DomHelper.prototype.hide = function () {
        var action = function (_a) {
            var style = _a.style;
            style.display = 'hide';
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.show = function () {
        var action = function (_a) {
            var style = _a.style;
            style.display = 'block';
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.hasClass = function (c) {
        var $el = this.first();
        return !!($el && $el.className && new RegExp("(\\s|^)".concat(c, "(\\s|$)")).test($el.className));
    };
    DomHelper.prototype.addClass = function (c) {
        var action = function (el) {
            var re = new RegExp("(^|\\s)".concat(c, "(\\s|$)"), 'g');
            if (re.test(el.className)) {
                return;
            }
            el.className = "".concat(el.className, " ").concat(c).replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.removeClass = function (c) {
        var action = function (el) {
            var re = new RegExp("(^|\\s)".concat(c, "(\\s|$)"), 'g');
            el.className = el.className
                .replace(re, '$1')
                .replace(/\s+/g, ' ')
                .replace(/(^ | $)/g, '');
        };
        return this._applyEach(action);
    };
    DomHelper.prototype.val = function (newVal) {
        var $el = this.first();
        var val = null;
        if ($el) {
            if (newVal) {
                $el.value = newVal.toString();
            }
            else {
                val = $el.value;
            }
        }
        return val;
    };
    DomHelper.prototype.first = function () {
        return this.list.length > 0 ? this.list[0] : null;
    };
    DomHelper.prototype.attr = function (key, val) {
        var $el = this.first();
        if (!$el || !$el.getAttribute || !$el.setAttribute) {
            return undefined;
        }
        if (!val) {
            return $el.getAttribute(key);
        }
        else {
            $el.setAttribute(key, val);
            return this;
        }
    };
    DomHelper.prototype.append = function (obj) {
        var $el = this.first();
        if (!$el) {
            return undefined;
        }
        if (typeof obj === 'string') {
            $el.innerHTML += obj.toString();
        }
        else {
            $el.appendChild(obj);
        }
        return this;
    };
    DomHelper.prototype.html = function (html) {
        var $el = this.first();
        if (!$el) {
            return undefined;
        }
        var innerHtml = $el.innerHTML;
        if (!html) {
            return innerHtml;
        }
        else {
            $el.innerHTML = html;
        }
    };
    DomHelper.prototype.outerHtml = function () {
        var $el = this.first();
        if (!$el) {
            return undefined;
        }
        return $el.outerHTML;
    };
    DomHelper.prototype.remove = function () {
        var $el = this.first();
        if (!$el || !$el.parentNode) {
            return undefined;
        }
        $el.parentNode.removeChild($el);
    };
    return DomHelper;
}());
function $constructor(selector) {
    var el;
    if (typeOf(selector) === 'string') {
        try {
            el = document.querySelectorAll(selector.toString());
        }
        catch (err) { }
    }
    else if (typeOf(selector) === 'array') {
        if (typeof selector[0] === 'string') {
            el = selector;
        }
        else {
            el = selector;
        }
    }
    else if (typeOf(selector) === 'object') {
        el = [selector];
    }
    return new DomHelper(el);
}
$constructor.ready = domReady;
$constructor.extend = extend;
$constructor.typeOf = typeOf;
$constructor.loadScript = loadScript;
$constructor.getQueryParameter = getQueryParameter;
$constructor.ajax = function (ajaxData) {
    var url = ajaxData.url;
    var postData = typeOf(ajaxData.type) === 'string' && ajaxData.type.toLowerCase() === 'post' ? ajaxData.data : null;
    return sendRequest(url, ajaxData, postData);
};

export { $constructor };
