import styles from './Input.module.css';
import Component from '@/components/Component';

export const TYPES = {
    TEXT: 'text',
    PASSWORD: 'password',
    EMAIL: 'email',
    NUMBER: 'number',
};

export const INPUT_ICONS = {
    ACCOUNT: styles.account,
    LOCK: styles.lock,
};

/**
 * Represents a customizable Input component.
 * @class Input
 */
export default class Input extends Component {
    /**
     * @param {'text'|'password'|´email'|'number'} [type='text'] - Input type
     * @param {string} placeholder
     * @param {number} maxLength
     * @param {boolean} disabled
     */
    constructor({
        type = TYPES.TEXT,
        name = '',
        id = '',
        label = '',
        placeholder = '',
        required = false,
        autocomplete = 'off',
        autofocus = false,
        minLength = 0,
        maxLength = 255,
        disabled = false,
        leadingIcon = null,
    } = {}) {
        super();

        this.type = this.#validateType(type);
        this.leadingIcon = this.#validateLeadingIcon(leadingIcon);
        this.name = name;
        this.id = id;
        this.label = label;
        this.placeholder = placeholder;
        this.required = required;
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
        label.appendChild(input);

        input.type = this.type;
        // this.disabled ? input.classList.add(styles.disabled) : '';

        if (this.name) input.setAttribute('name', this.name);
        if (this.id) input.setAttribute('id', this.id);
        if (this.required) {
            input.setAttribute('required', '');
            input.setAttribute('aria-required', 'true');
        }
        if (this.autocomplete) input.setAttribute('autocomplete', this.autocomplete);
        if (this.autofocus) input.setAttribute('autofocus', '');
        input.setAttribute('minlength', this.minLength.toString());
        input.setAttribute('maxlength', this.maxLength.toString());

        input.placeholder = '';
        // input.placeholder = this.placeholder;
        input.maxLength = this.maxLength;

        // usernameInput.setAttribute('aria-describedby', 'username-help');
        // usernameInput.setAttribute('aria-invalid', 'false');
        // usernameInput.setAttribute('aria-required', 'true');
        // usernameInput.setAttribute('aria-label', 'Username');

        if (this.disabled) {
            input.setAttribute('disabled', '');
            input.setAttribute('aria-disabled', 'true');
        }

        const outline = document.createElement('div');
        outline.classList.add(styles.outline);
        label.appendChild(outline);

        if (this.placeholder) {
            const floatingLabel = document.createElement('span');
            floatingLabel.classList.add(styles.floatinglabel);
            floatingLabel.textContent = this.placeholder;
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

    mount(parent) {
        if (!this.element) {
            this.render();
        }
        parent.appendChild(this.element);
        return this;
    }
}
