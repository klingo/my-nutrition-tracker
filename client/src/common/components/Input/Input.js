import styles from './Input.module.css';
import BaseComponent from '@core/base/BaseComponent';

export const TYPES = {
    TEXT: 'text',
    PASSWORD: 'password',
    EMAIL: 'email',
    NUMBER: 'number',
};

export const INPUT_ICONS = {
    ACCOUNT: styles.account,
    PERSON: styles.person,
    LOCK: styles.lock,
};

/**
 * Represents a customizable Input component.
 * @class Input
 */
export default class Input extends BaseComponent {
    /**
     * @param {'text'|'password'|´email'|'number'} [type='text'] - Input type
     * @param {string} label
     * @param {number} maxLength
     * @param {boolean} required
     * @param {boolean} disabled
     * @param {string} leadingIcon
     */
    constructor({
        type = TYPES.TEXT,
        name = '',
        id = '',
        label = '',
        autocorrect = 'off',
        spellcheck = 'false',
        autocomplete,
        autofocus = false,
        minLength = 0,
        maxLength = 255,
        required = false,
        disabled = false,
        leadingIcon = '',
    } = {}) {
        super();

        this.type = this.#validateType(type);
        this.leadingIcon = this.#validateLeadingIcon(leadingIcon);
        this.name = name;
        this.id = id;
        this.label = label;
        this.required = required;
        this.autocorrect = autocorrect;
        this.spellcheck = spellcheck;
        this.autocomplete = autocomplete;
        this.autofocus = autofocus;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.disabled = disabled;
    }

    #validateType(type) {
        if (!Object.values(TYPES).includes(type)) {
            throw new Error(`Invalid input type "${type}". Must be one of: ${Object.values(TYPES).join(', ')}`);
        }
        return type;
    }

    #validateLeadingIcon(leadingIcon) {
        if (leadingIcon && !Object.values(INPUT_ICONS).includes(leadingIcon)) {
            throw new Error(
                `Invalid leadingIcon "${leadingIcon}". Must be one of: ${Object.values(INPUT_ICONS).join(', ')}`,
            );
        }
        return leadingIcon;
    }

    render() {
        const div = document.createElement('div');
        div.classList.add(styles.input);

        const label = document.createElement('label');
        label.classList.add(styles.label);
        div.appendChild(label);

        this.#addLeadingIcon(label);

        const input = document.createElement('input');
        input.placeholder = '';
        label.appendChild(input);

        input.type = this.type;
        // this.disabled ? input.classList.add(styles.disabled) : '';

        if (this.name) input.setAttribute('name', this.name);
        if (this.id) input.setAttribute('id', this.id);
        if (this.autocorrect) input.setAttribute('autocorrect', this.autocorrect);
        if (this.spellcheck) input.setAttribute('spellcheck', this.spellcheck);
        if (this.autocomplete) input.setAttribute('autocomplete', this.autocomplete);
        if (this.autofocus) input.setAttribute('autofocus', '');

        input.setAttribute('minlength', this.minLength.toString());
        input.setAttribute('maxlength', this.maxLength.toString());
        input.maxLength = this.maxLength;

        // usernameInput.setAttribute('aria-describedby', 'username-help');
        // usernameInput.setAttribute('aria-invalid', 'false');
        // usernameInput.setAttribute('aria-required', 'true');
        // usernameInput.setAttribute('aria-label', 'Username');

        if (this.required) {
            input.required = true;
            input.setAttribute('aria-required', 'true');
        }

        if (this.disabled) {
            input.disabled = true;
            input.setAttribute('aria-disabled', 'true');
        }

        const outline = document.createElement('div');
        outline.classList.add(styles.outline);
        label.appendChild(outline);

        if (this.label) {
            const floatingLabel = document.createElement('span');
            floatingLabel.classList.add(styles.floatingLabel);
            floatingLabel.textContent = this.label;
            outline.appendChild(floatingLabel);
        }

        this.element = div;
        return this.element;
    }

    #addLeadingIcon(label) {
        if (this.leadingIcon) {
            const icon = document.createElement('div');
            icon.classList.add(styles.icon);
            icon.classList.add(this.leadingIcon);
            icon.setAttribute('alt', '');
            icon.setAttribute('aria-hidden', 'true');
            label.appendChild(icon);
        }
    }
}
