import './index';

export interface Integration {
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

export interface ExtraField {
	multiple: boolean;
	active: boolean;
	_id: string;
	name: string;
	selector: string;
	customId: string;
}

export interface FormAction {
	isDefault: boolean;
	_id: string;
	name: string;
	url: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export interface Platform {
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

export interface Popups {
	leaveTimeout: number;
	initTimeout: number;
	active: boolean;
	initPopup?: Popup;
	leavePopup?: Popup;
	buttonPopup?: Popup;
}

export interface Popup {
	_id: string;
	lifecycle: string;
	devices: string[];
	shell: string;
	confirmation: string;
}

const devMode = window.__mbzdev__ === true;
const LOCALHOST = 'localhost';
const SUBMIT_URL_DEFAULT = 'https://news.mailclick.me/subscribe.php';
const INTEGRATION_STATIC = devMode
	? 'http://' + LOCALHOST + ':5001/api/integration/public/'
	: 'https://integration-hub.mailclick.me/server/api/integration/public/';
const POPUP_STATIC = devMode
	? 'http://' + LOCALHOST + ':3000/static/scripts/popup.js'
	: 'https://integration-hub.mailclick.me/static/scripts/popup.min.js';

const NAMESPACE = 'MailbizIntegration';
const QUEUE_KEY = 'mbz-hub-queue';
const QUERY_PARAMS = {
	popupHomolog: 'mbz-popup',
};

const SELECTORS_DEFAULT = {
	form: 'form',
	email: '[type="email"], [name$="mail"]',
	name: '[placeholder*="ome"], [placeholder*="ame"], [name^="name"], [name^="Name"], [name^="nome"], [name^="Name"]',
	radio: '[type="checkbox"], [type="radio"]',
};

const $ = window._mbz_ && window._mbz_.$ ? window._mbz_.$ : null;

let sending = false;
let popupHomolog = false;
const helper: Record<string, Function> = {};
let integration: Integration = {
	active: false,
	integrationStatus: '',
	useFormAction: false,
	_id: '',
	name: '',
	url: '',
	platform: undefined,
	listId: '',
	sendUrl: '',
	timeout: 0,
	formSelector: '',
	emailSelector: '',
	nameCustomId: '',
	nameCustomSelector: '',
	radioCustomId: null,
	radioCustomSelector: null,
	submitSelector: '',
	extraFields: null,
	createdBy: '',
	createdAt: undefined,
	updatedAt: undefined,
	__v: 0,
	modifiedBy: '',
	jqVersion: '',
	popups: null,
	formAction: undefined,
	debug: undefined,
	log: undefined,
	id: '',
	api: undefined,
	ready: false,
	onReady: () => undefined,
} as Integration;

const settings = {
	timeout: 1500,
	throttle: 150,
};

function log(...args: any[]) {
	if (!integration || !integration.debug) {
		return;
	}

	try {
		console.log.apply(console, args);
	} catch ($er) {}
}

function throttle(callback, limit) {
	let wait = false;
	return function (...args: any[]) {
		if (!wait) {
			callback.apply(null, args);
			wait = true;
			setTimeout(function () {
				wait = false;
			}, limit);
		}
	};
}

helper.throttle = throttle;
helper.logEvent = function (eventName, event) {
	if (integration.log && integration.log[eventName]) {
		integration.log[eventName].push(event);
	}
};

helper.getSettingsUrl = function () {
	let popupHlg = '';
	if (popupHomolog) {
		popupHlg = '?popup-homolog=true';
	}

	return INTEGRATION_STATIC + integration.id + popupHlg;
};

helper.getFormSelector = function () {
	return integration.formSelector || integration.platform.formSelector || SELECTORS_DEFAULT.form;
};

helper.getEmailSelector = function () {
	return integration.emailSelector || integration.platform.emailSelector || SELECTORS_DEFAULT.email;
};

helper.getNameSelector = function () {
	return integration.nameCustomSelector || integration.platform.nameSelector || SELECTORS_DEFAULT.name;
};

helper.getRadioSelector = function () {
	return integration.radioCustomSelector || integration.platform.radioSelector || SELECTORS_DEFAULT.radio;
};

helper.getSubmitSelector = function () {
	return integration.submitSelector || integration.platform.submitSelector;
};

helper.getNativeSelector = function () {
	return '[data-mbz-input]';
};

helper.getSendUrl = function () {
	if (
		integration.useFormAction &&
		integration.formAction &&
		typeof integration.formAction === 'object' &&
		integration.formAction.url
	) {
		return integration.formAction.url;
	}

	return integration.sendUrl || SUBMIT_URL_DEFAULT;
};

helper.getTimeout = function () {
	return integration.timeout || settings.timeout;
};

helper.getFormDataQueue = function () {
	try {
		const data = integration.api.getStorage(QUEUE_KEY);
		return data && typeof data === 'object' && data.email ? data : null;
	} catch ($e) {
		log($e);
	}

	return false;
};

helper.setFormDataQueue = function (formData) {
	formData = formData || {};

	try {
		integration.api.setStorage(QUEUE_KEY, formData);
		return true;
	} catch ($e) {
		log($e);
	}

	return false;
};

helper.getActiveFields = function () {
	const actives = [];
	$(integration.extraFields || []).each(function () {
		const field = this || {};
		if (!field || !field.active) {
			return;
		}

		actives.push(field);
	});

	return actives;
};

function processQueue() {
	const queueItem = helper.getFormDataQueue();

	if (!queueItem) {
		return;
	}

	submitData(queueItem);
}

function submitData(formData) {
	if (sending || !formData.email || formData.email.indexOf('@') === -1) {
		return;
	}

	sending = true;

	const postData = {
		FormValue_ListID: formData.listId,
		FormValue_Command: 'Subscriber.Add',
		'FormValue_Fields[UpdateifExists]': true,
		'FormValue_Fields[EmailAddress]': formData.email,
	};

	if (integration.nameCustomId && formData.name) {
		postData['FormValue_Fields[CustomField' + integration.nameCustomId + ']'] = formData.name;
	}

	if (integration.radioCustomId && formData.radio) {
		postData['FormValue_Fields[CustomField' + integration.radioCustomId + ']'] = formData.radio;
	}

	const extraFieldKeys = Object.keys(formData.fields) || [];

	if (extraFieldKeys && extraFieldKeys.length) {
		$(extraFieldKeys).each(function () {
			const customId = this;
			const extraFieldName = 'FormValue_Fields[CustomField' + customId + ']';
			const val = formData.fields[customId];
			if ($.typeOf(val) === 'undefined') {
				return;
			}

			if ($.typeOf(val) === 'array') {
				$(val).each(function (v, index) {
					postData[extraFieldName + '[' + index + ']'] = v;
				});

				return;
			}

			postData[extraFieldName] = val;
		});
	}

	helper.setFormDataQueue(formData);
	helper.logEvent('sentData', postData);

	$.ajax({
		type: 'POST',
		url: helper.getSendUrl(),
		data: postData,
		complete: function () {
			sending = false;
		},
		success: function (data) {
			helper.setFormDataQueue(null);
			log('mlbz enviado', data);
			helper.logEvent('respData', data);
		},
	});
}

function bindElements(settings?: any) {
	settings = settings || {};
	const formSelector = settings.formSelector || helper.getFormSelector();

	const _submitData = throttle(submitData, settings.throttle);

	$(formSelector).each(function () {
		bindElement(this, _submitData);
	});
}

function bindElement(el, _submitData) {
	const $el = $(el);
	const dataName = 'mbzBind' + integration.id;
	const isMbzForm = $el.is('[data-mbz-form]');

	if ($el.data(dataName)) {
		log($el, 'bind já aplicado');
		return;
	}

	$el.data(dataName, true);

	const formData = {
		listId: isMbzForm ? $el.attr('data-listid') || integration.listId : integration.listId,
		email: null,
		name: null,
		radio: null,
		fields: {},
	};

	const inputChangeEvent = 'change input';

	const emailSelector = isMbzForm ? '[data-mbz-input="email"]' : helper.getEmailSelector();
	const nameSelector = isMbzForm ? null : helper.getNameSelector();
	const radioSelector = isMbzForm ? null : helper.getRadioSelector();
	const submitSelector = isMbzForm ? null : helper.getSubmitSelector();
	const nativeSelector = helper.getNativeSelector();

	const fields = isMbzForm ? [] : helper.getActiveFields() || [];

	const registeredFormData = [];

	const ensureFormData = function (formData) {
		$(registeredFormData).each(function () {
			const registeredElement = this;

			if (!registeredElement || typeof registeredElement !== 'object' || !registeredElement.el) {
				return;
			}

			let value = registeredElement.el.val();

			if (registeredElement.isExtra) {
				if (registeredElement.multiple) {
					value = [];
					registeredElement.el.each(function (el) {
						if (typeof el === 'object' && el.checked) {
							value.push(el.value);
						}
					});
				}

				if (!formData.fields[registeredElement.name] && value !== null) {
					formData.fields[registeredElement.name] = value;
				}

				return;
			}

			if (!formData[registeredElement.name]) {
				formData[registeredElement.name] = value;
			}
		});

		return formData;
	};

	const bindExtraField = function (field) {
		if (!field) {
			return;
		}

		const $field = $el.find(field.selector);
		registeredFormData.push({
			name: field.customId,
			el: $field,
			multiple: field.multiple,
			isExtra: true,
		});
		$field.on(inputChangeEvent, function () {
			let value = this.value;

			if (field.multiple) {
				value = [];
				$field.each(function (el) {
					if (typeof el === 'object' && el.checked) {
						value.push(el.value);
					}
				});
			}

			formData.fields[field.customId] = value;
			log(formData);
		});
	};

	if (emailSelector) {
		const $emailField = $el.find(emailSelector);
		registeredFormData.push({
			name: 'email',
			el: $emailField,
		});
		$emailField.on(inputChangeEvent, function () {
			formData.email = this.value;
			log(formData);
		});
	}

	if (integration.nameCustomId && nameSelector) {
		const $nameField = $el.find(nameSelector);
		registeredFormData.push({
			name: 'name',
			el: $nameField,
		});
		$nameField.on(inputChangeEvent, function () {
			const value = this.value;
			if (value == 'true' || value == 'false') {
				return;
			}
			formData.name = value;
			log(formData);
		});
	}

	if (integration.radioCustomId && radioSelector) {
		const $radioField = $el.find(radioSelector);
		registeredFormData.push({
			name: 'radio',
			el: $radioField,
		});
		$radioField.on(inputChangeEvent, function () {
			formData.radio = this.value;
			log(formData);
		});
	}

	if (submitSelector) {
		$el.find(submitSelector).on('click mouseup', function () {
			ensureFormData(formData);
			log('click', formData);
			_submitData(formData);
		});
	}

	$(fields).each(function () {
		const field = this;
		bindExtraField(field);
	});

	// bind nos fields no formato nativo - popup
	const $nativeFields = $el.find(nativeSelector);

	if ($nativeFields.length) {
		$nativeFields.each(function () {
			const $field = $(this);

			const customId = $field.attr('data-mbz-custom-id');
			const type = $field.attr('data-mbz-input');
			const isMultiple = !!$field.attr('multiple') || type === 'checkbox';
			const isEmail = type === 'email';
			const isDate = type === 'date' || (type === 'tel' && $field.attr('data-mbz-mask') === '**/**/****');

			const multipleSelector = '[data-mbz-input][data-mbz-custom-id="' + customId + '"]';

			if (!customId) {
				return;
			}

			registeredFormData.push({
				name: customId,
				el: isMultiple ? $el.find(multipleSelector) : $field,
				multiple: isMultiple,
				isExtra: true,
			});

			$field.on(inputChangeEvent, function () {
				let value = this.value;

				if (isEmail) {
					formData.email = value;
					return;
				}

				if (isDate && value) {
					// ajusta data
					value = (value || '').split('/').reverse().join('-');
				}

				if (isMultiple) {
					value = [];
					$el.find(multipleSelector).each(function (el) {
						if (el && typeof el === 'object' && el.checked) {
							value.push(el.value);
						}
					});
				}

				formData.fields[customId] = value;
				log(formData);
			});
		});
	}

	$el.on('submit', function () {
		ensureFormData(formData);
		log('submit', formData);
		_submitData(formData);
	});
}

function bindPopups() {
	if (!integration.popups || typeof integration.popups !== 'object' || !(integration.popups || {}).active) {
		return;
	}

	$.loadScript(POPUP_STATIC);
}

function buildIntegration(data) {
	const baseIntegration = {
		log: {
			sentData: [],
			respData: [],
		},
		api: new MBZApi(),
		popupHomolog: popupHomolog,
	};

	$.extend(integration, baseIntegration);
	$.extend(integration, data);

	integration.ready = true;
}

function getSettings(cb) {
	return $.ajax({
		url: helper.getSettingsUrl(),
		success: function (data) {
			if (!data) {
				return;
			}

			log('data', data);
			buildIntegration(data);

			if (cb) {
				cb();
			}
		},
	});
}

// classes
function MBZApi() {
	const self = this;

	const mobileCheck = {
		// ios: (function(){
		//   return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		// }),
		// android: (function(){
		//   return navigator.userAgent.match(/Android/i);
		// }),
		// blackBerry: (function(){
		//   return navigator.userAgent.match(/BB10|Tablet|Mobile/i);
		// }),
		// windows: (function(){
		//   return navigator.userAgent.match(/IEMobile/i);
		// }),
		// smartphone: (function(){
		//   return (window.innerWidth <= 384 && window.innerHeight <= 640);
		// }),
		tablet: function () {
			return (
				navigator.userAgent.match(/Tablet|iPad|iPod/i) && window.innerWidth <= 1280 /*&& window.innerHeight >= 800*/
			);
		},
		all: function () {
			return navigator.userAgent.match(/Android|BlackBerry|Tablet|Mobile|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
		},
	};

	self.setDebugMode = function (mode) {
		integration.debug = !!mode;
	};

	self.helper = helper;
	self.log = log;
	self.bindElements = bindElements;

	self.checkIntegration = function () {
		const color = ['#dc679e', '#00ffb5', '#ff006d', '#ff9600', '#7700ff'];

		function paintElement($el, color) {
			if (!$el || !color) {
				return;
			}

			//$el.css('backgroundColor', color);
			$el.each(function ($e) {
				$e.style.background = color;
			});
		}

		function handleform(el) {
			const $el = $(el);

			const emailSelector = helper.getEmailSelector();
			const nameSelector = helper.getNameSelector();
			const radioSelector = helper.getRadioSelector();
			const submitSelector = helper.getSubmitSelector();

			const fields = helper.getActiveFields() || [];

			if (emailSelector) {
				paintElement($el.find(emailSelector), color[0]);
			}

			if (integration.nameCustomId && nameSelector) {
				paintElement($el.find(nameSelector), color[1]);
			}

			if (integration.radioCustomId && radioSelector) {
				paintElement($el.find(radioSelector), color[2]);
			}

			if (submitSelector) {
				paintElement($el.find(submitSelector), color[3]);
			}

			$(fields).each(function () {
				const field = this || {};
				paintElement($el.find(field.selector), color[2]);
			});

			paintElement($el, color[4]);
		}

		const $forms = $(helper.getFormSelector());

		$forms.each(function () {
			handleform(this);
		});

		return {
			elements: $forms,
			hasIntegration: !!$forms.length,
		};
	};

	self._mobileCheck = mobileCheck;
	self.getDevice = function () {
		let device = 'desktop';

		try {
			if (mobileCheck.all()) {
				device = mobileCheck.tablet() ? 'tablet' : 'mobile';
			}
		} catch (e) {}

		return device;
	};

	self.tryParseJSON = function (value) {
		try {
			return JSON.parse(value || '{}');
		} catch (e) {}

		return value;
	};

	self.getStorage = function (name) {
		let value;
		try {
			value = localStorage.getItem(name);

			if (!value) {
				return value;
			}

			const data = self.tryParseJSON(value);

			return data;
		} catch ($e) {
			log($e);
			return value;
		}
	};

	self.setStorage = function (name, value) {
		try {
			value = typeof value === 'object' ? JSON.stringify(value) : value;
			localStorage.setItem(name, value);

			return true;
		} catch ($e) {
			log($e);
		}

		return false;
	};

	self.onlyNumbers = function (str) {
		return parseInt(str.replace(/\D/g, ''));
	};
}

function init() {
	if (!$) {
		return log('Mailbiz - erro ao carregar _mbz_');
	}

	if (typeof window[NAMESPACE] !== 'object') {
		return console.warn('Objeto ' + NAMESPACE + ' não definido');
	}

	integration = window[NAMESPACE] as Integration;

	if (integration.ready) {
		return log('Mailbiz - hub já foi inicializado');
	}

	if (!integration.id) {
		return log('Mailbiz - ID inválido');
	}

	if ($.getQueryParameter(QUERY_PARAMS.popupHomolog) === 'true') {
		popupHomolog = true;
	}

	getSettings(function () {
		if (!integration.active || !integration.ready) {
			return;
		}

		processQueue();
		bindElements();
		bindPopups();

		if (integration.onReady && typeof integration.onReady === 'function') {
			integration.onReady(integration);
		}

		$.ready(function () {
			bindElements();

			const timeout = helper.getTimeout();
			if (timeout) {
				setTimeout(function () {
					bindElements();
				}, timeout);
			}
		});
	});
}

try {
	init();
} catch (err) {}
