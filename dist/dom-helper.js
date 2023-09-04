"use strict";!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).domHelper={})}(this,(function(t){function e(t){var e=typeof t;return"object"===e&&(t?t instanceof Array&&(e="array"):e="null"),e}function n(){}function r(t,e,r){var i=e.error||n,c=e.success||n,a=e.complete||n,u=function(){for(var t=null,e=0;e<s.length;e++){try{t=s[e]()}catch(t){continue}break}return t}();if(u){if(u.open(r?"POST":"GET",t,!0),r&&(u.setRequestHeader("Content-type","application/x-www-form-urlencoded"),"object"==typeof r))try{r=Object.keys(r).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(r[t])})).join("&")}catch(t){}u.onreadystatechange=function(){4==u.readyState&&(a(),200!=u.status&&201!=u.status&&304!=u.status?i(o(u)):c(o(u)))},4!=u.readyState&&u.send(r)}}function o(t){try{return JSON.parse(t.responseText)}catch(e){return t.responseText}}function i(t){if("string"===e(t))try{var n=document.querySelectorAll(t.toString())}catch(t){}else"array"===e(t)?n=t:"object"===e(t)&&(n=[t]);return new p(n)}var c,a,s=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Msxml2.XMLHTTP.6.0")},function(){return new ActiveXObject("Msxml2.XMLHTTP.3.0")},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],u=(c=0,a={},{set:function(t,e){var n=0;void 0===t.myCustomDataTag&&(n=c++,t.myCustomDataTag=n),a[n]=e},get:function(t){return a[t.myCustomDataTag]}}),p=function(){function t(t){var n,r;this.list=[],"object"==typeof t&&(this.list="array"===e(t)||t instanceof NodeList||t.length?t:[t]),this.length=null!==(r=null===(n=this.list)||void 0===n?void 0:n.length)&&void 0!==r?r:0}return t.prototype._applyEach=function(t){for(var e=this.list.length,n=0;n<e;++n){var r=this.list[n];try{t.call(r,r,n)}catch(t){console.error(t)}}return this},t.prototype.each=function(t){return this._applyEach(t)},t.prototype.closest=function(e){var n=this.first();return n?new t([e=n.closest(e)]):new t},t.prototype.data=function(t,e){var n,r=this.first(),o=null!==(n=u.get(r))&&void 0!==n?n:{};return t||e?void 0===e?o[t]:(o[t]=e,u.set(r,o)):o},t.prototype.on=function(t,e){return this._applyEach((function(n){n&&i(t.split(" ")).each((function(t){n.addEventListener(t,e,!1)}))}))},t.prototype.off=function(t,e){return this._applyEach((function(n){i(t.split(" ")).each((function(t){n.removeEventListener(t,e,!1)}))}))},t.prototype.is=function(t){var e=this.first();return!!e&&e.matches(t)},t.prototype.find=function(e){var n=this.first();return n&&n.querySelectorAll&&(e=n.querySelectorAll(e)).length?new t(e):new t},t.prototype.hide=function(){return this._applyEach((function(t){t.style.display="hide"}))},t.prototype.show=function(){return this._applyEach((function(t){t.style.display="block"}))},t.prototype.hasClass=function(t){var e=this.first();return!!(e&&e.className&&new RegExp("(\\s|^)".concat(t,"(\\s|$)")).test(e.className))},t.prototype.addClass=function(t){return this._applyEach((function(e){new RegExp("(^|\\s)".concat(t,"(\\s|$)"),"g").test(e.className)||(e.className="".concat(e.className," ").concat(t).replace(/\s+/g," ").replace(/(^ | $)/g,""))}))},t.prototype.removeClass=function(t){return this._applyEach((function(e){var n=new RegExp("(^|\\s)".concat(t,"(\\s|$)"),"g");e.className=e.className.replace(n,"$1").replace(/\s+/g," ").replace(/(^ | $)/g,"")}))},t.prototype.val=function(t){var e=this.first(),n=null;return e&&(t?e.value=t.toString():n=e.value),n},t.prototype.first=function(){return 0<this.list.length?this.list[0]:null},t.prototype.attr=function(t,e){var n=this.first();if(n&&n.getAttribute&&n.setAttribute)return e?(n.setAttribute(t,e),this):n.getAttribute(t)},t.prototype.append=function(t){var e=this.first();if(e)return"string"==typeof t?e.innerHTML+=t.toString():e.appendChild(t),this},t.prototype.html=function(t){var e=this.first();if(e){var n=e.innerHTML;if(!t)return n;e.innerHTML=t}},t.prototype.outerHtml=function(){var t=this.first();if(t)return t.outerHTML},t.prototype.remove=function(){var t=this.first();t&&t.parentNode&&t.parentNode.removeChild(t)},t}();i.ready=function(t){if("loading"===document.readyState)return document.addEventListener("DOMContentLoaded",t);t()},i.extend=function t(e,n){for(var r in n){var o=n[r];o&&"[object Object]"===Object.prototype.toString.call(o)?(e[r]=e[r]||{},t(e[r],o)):e[r]=o}return e},i.typeOf=e,i.loadScript=function(t,e,n){var r=document,o=r.createElement("script");r=r.getElementsByTagName("script")[0],o.src=t,o.async=null==e||e,n&&(o.nonce=n),r.parentNode.insertBefore(o,r)},i.getQueryParameter=function(t,e){return e||(e=window.location.href),t=t.replace(/[\[\]]/g,"\\$&"),(t=new RegExp("[?&]"+t+"(=([^&#]*)|&|#|$)").exec(e))?t[2]?decodeURIComponent(t[2].replace(/\+/g," ")):"":null},i.ajax=function(t){var n=t.url,o="string"===e(t.type)&&"post"===t.type.toLowerCase()?t.data:null;return r(n,t,o)},t.$constructor=i,Object.defineProperty(t,"__esModule",{value:!0})}));
