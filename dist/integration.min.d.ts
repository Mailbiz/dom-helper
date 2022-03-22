interface Integration {
    debug: any;
    log?: any;
    id: string;
    api?: any;
    ready: boolean;
    active: boolean;
    integrationStatus: string;
    useFormAction: boolean;
    _id: string;
    name: string;
    url: string;
    platform: Platform;
    listId: string;
    sendUrl: string;
    timeout: number;
    formSelector: string;
    emailSelector: string;
    nameCustomId: string;
    nameCustomSelector: string;
    radioCustomId?: string;
    radioCustomSelector?: string;
    submitSelector: string;
    extraFields?: ExtraField[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
    modifiedBy?: string;
    jqVersion?: string;
    popups?: Popups;
    formAction: FormAction;
    onReady?: (integration?: Integration) => void;
}
interface ExtraField {
    multiple: boolean;
    active: boolean;
    _id: string;
    name: string;
    selector: string;
    customId: string;
}
interface FormAction {
    isDefault: boolean;
    _id: string;
    name: string;
    url: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}
interface Platform {
    _id: string;
    name: string;
    formSelector: string;
    emailSelector: string;
    nameSelector: string;
    radioSelector: string;
    submitSelector: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}
interface Popups {
    leaveTimeout: number;
    initTimeout: number;
    active: boolean;
    initPopup?: Popup;
    leavePopup?: Popup;
    buttonPopup?: Popup;
}
interface Popup {
    _id: string;
    lifecycle: string;
    devices: string[];
    shell: string;
    confirmation: string;
}
export { Integration, ExtraField, FormAction, Platform, Popups, Popup };
