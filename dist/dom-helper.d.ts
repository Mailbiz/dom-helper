type CallbackFunction = (item?: any, i?: number) => void;
interface IDomHelper {
    list: NodeList | Node[] | string[];
    length: number;
    // constructor (list?: NodeList | Node[] | string[]) : IDomHelper;
    _applyEach(action: CallbackFunction): IDomHelper;
    each(callback: CallbackFunction): IDomHelper;
    closest(selector: string): IDomHelper;
    data(key: string, value?: any): any | void;
    on(eventName: string, callback: Function): IDomHelper;
    off(eventName: string, callback: Function): IDomHelper;
    is(selector: string): boolean;
    find(selector: string): IDomHelper;
    hide(): IDomHelper;
    show(): IDomHelper;
    hasClass(c: string): boolean;
    addClass(c: string): IDomHelper;
    removeClass(c: string): IDomHelper;
    val(c: string | number): string | undefined | null;
    first(): any | undefined | null;
    attr(key: string, val?: string): any;
    append(obj: Node | string): any;
    html(html?: string): string | void;
    outerHtml(): string | void;
    remove(): void;
}
interface IDomHelperInitializer {
    (selector?: any | any[]): IDomHelper;
    ready(callBack: Function): void;
    extend(first: object, second: object): object;
    typeOf(value: any): string;
    loadScript(u: string, async?: boolean): void;
    getQueryParameter(name: string, url?: string): string | null;
    ajax(ajaxData: Record<string, any>): void;
}
declare global {
    interface Window {
        [key: string]: unknown;
        _mbz_: {
            $: IDomHelperInitializer;
        };
    }
    interface Node {
        myCustomDataTag: any;
        closest(selectors: string): NodeList;
        matches(selector: string): boolean;
    }
}
declare function domReady(callBack: any): void;
declare class DomHelper implements IDomHelper {
    list: NodeList | Node[] | string[];
    length: number;
    constructor(list?: NodeList | Node[] | string[]);
    _applyEach(action: CallbackFunction): DomHelper;
    each(callback: CallbackFunction): DomHelper;
    closest(selector: string): DomHelper;
    data(key: string, value?: any): unknown;
    on(eventName: string, callback: Function): DomHelper;
    off(eventName: string, callback: Function): DomHelper;
    is(selector: string): boolean;
    find(selector: string): DomHelper;
    hide(): DomHelper;
    show(): DomHelper;
    hasClass(c: string): boolean;
    addClass(c: string): DomHelper;
    removeClass(c: string): DomHelper;
    val(newVal: string | number): any;
    first(): string | Node;
    attr(key: string, val?: string): string | this;
    append(obj: Node | string): this;
    html(html?: string): string | void;
    outerHtml(): string;
    remove(): any;
}
declare function $constructor(selector?: any | any[]): DomHelper;
declare namespace $constructor {
    var ready: typeof domReady;
    var extend: (first: {
        [x: string]: any;
    }, second: {
        [x: string]: any;
    }) => {
        [x: string]: any;
    };
    var typeOf: (value: any) => string;
    var loadScript: (u: string, async?: boolean) => void;
    var getQueryParameter: (name: string, url?: string) => string;
    var ajax: (ajaxData: Record<string, any>) => void;
}
export { IDomHelperInitializer, IDomHelper, CallbackFunction, $constructor };
