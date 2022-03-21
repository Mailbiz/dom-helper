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
export {};
