interface Element {
	matchesSelector(selectors: string): boolean;
	mozMatchesSelector(selectors: string): boolean;
	msMatchesSelector(selectors: string): boolean;
	oMatchesSelector(selectors: string): boolean;
	attachEvent(name: string, ev: any): void;
	detachEvent(name: string, ev: any): void;
	fireEvent(name: string, ev: any): void;
}

/*eslint-disable */
if (window.Element && !Element.prototype.closest) {
	Element.prototype.closest = function (s: string) {
		const matches = (document || this.ownerDocument).querySelectorAll(s);
		let i;
		let el = this;
		do {
			i = matches.length;
			while (--i >= 0 && matches.item(i) !== el) {} //eshint ignore: line
		} while (i < 0 && (el = el.parentElement as Element));
		return el;
	};
}

// if (!window.addEventListener) {
//     (function (WindowPrototype, DocumentPrototype: DocumentPrototype, ElementPrototype, registry) {
//         WindowPrototype.addEventListener = DocumentPrototype.addEventListener = ElementPrototype.addEventListener = function (type, listener) {
//             var target = this;

//             registry.unshift([target, type, listener, function (event) {
//                 event.currentTarget = target;
//                 event.preventDefault = function () {
//                     event.returnValue = false;
//                 };
//                 event.stopPropagation = function () {
//                     event.cancelBubble = true;
//                 };
//                 event.target = event.srcElement || target;

//                 listener.call(target, event);
//             }]);

//             this.attachEvent('on' + type, registry[0][3]);
//         };

//         WindowPrototype.removeEventListener = DocumentPrototype.removeEventListener = ElementPrototype.removeEventListener = function (type, listener) {
//             for (var index = 0, register; register = registry[index]; ++index) {
//                 if (register[0] === this && register[1] === type && register[2] === listener) {
//                     return this.detachEvent('on' + type, registry.splice(index, 1)[0][3]);
//                 }
//             }
//         };

//         WindowPrototype.dispatchEvent = DocumentPrototype.dispatchEvent = ElementPrototype.dispatchEvent = function (eventObject) {
//             this.fireEvent('on' + eventObject.type, eventObject);

//             return true;
//         };
//     })(Window.prototype, Document.prototype, Element.prototype, []);
// }

if (!Element.prototype.matches) {
	Element.prototype.matches =
		Element.prototype.matchesSelector ??
		Element.prototype.mozMatchesSelector ??
		Element.prototype.msMatchesSelector ??
		Element.prototype.oMatchesSelector;

	if (!Element.prototype.matches) {
		Element.prototype.matches = function (s: string) {
			const matches = (document || this.ownerDocument).querySelectorAll(s);
			let i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {}
			return i > -1;
		};
	}
}
