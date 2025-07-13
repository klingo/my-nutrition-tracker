import styles from './Input.module.css';
import BaseComponent from '@core/base/BaseComponent';
import setAttributes from '@common/utils/setAttributes.js';

/**
 * Represents a customizable Input component.
 * @class Input
 */
export default class Input extends BaseComponent {
    /**
     * @param {'text'|'password'|´email'|'number'} [type='text'] - Input type
     * @param {string} name
     * @param {string} id
     * @param {string} label
     * @param {string} value
     * @param {boolean} autocorrect
     * @param {boolean} spellcheck
     * @param {boolean} autocomplete
     * @param {boolean} autofocus
     * @param {number} minLength
     * @param {number} maxLength
     * @param {boolean} required
     * @param {boolean} disabled
     * @param {string} icon
     * @param {function} onChange
     */
    constructor({
        type = 'text',
        name = '',
        id = '',
        label = '',
        value = '',
        autocorrect = true,
        spellcheck = true,
        autocomplete = '',
        autofocus = false,
        minLength = 0,
        maxLength = 255,
        required = false,
        disabled = false,
        icon = '',
        onChange = null,
    } = {}) {
        super();

        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);
        this.name = name;
        this.id = id;
        this.label = label;
        this.value = value;
        this.required = required;
        this.autocorrect = autocorrect;
        this.spellcheck = spellcheck;
        this.autocomplete = autocomplete;
        this.autofocus = autofocus;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.disabled = disabled;
        this.onChange = onChange;
    }

    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    #validateType(type) {
        const validTypes = new Set(['text', 'password']);
        return this.#validate(type, validTypes, 'input type');
    }

    #validateIcon(icon) {
        const validIcons = new Set(['account', 'person', 'lock']);
        return icon && this.#validate(icon, validIcons, 'input icon');
    }

    render() {
        const div = document.createElement('div');
        div.classList.add(styles.input);

        const label = this.#createLabel();
        div.appendChild(label);

        this.#addIcon(label);

        const input = this.#createInput();
        label.appendChild(input);

        const outline = document.createElement('div');
        outline.classList.add(styles.outline);
        label.appendChild(outline);

        if (this.label) {
            const floatingLabel = this.#createFloatingLabel(this.label);
            outline.appendChild(floatingLabel);
        }

        this.element = div;
        return this.element;
    }

    #createLabel() {
        const label = document.createElement('label');
        label.classList.add(styles.label);
        return label;
    }

    #createInput() {
        const input = document.createElement('input');
        input.type = this.type;
        input.placeholder = ''; // Required for custom placeholder styling
        input.value = this.value || '';

        // usernameInput.setAttribute('aria-describedby', 'username-help');
        // usernameInput.setAttribute('aria-invalid', 'false');
        // usernameInput.setAttribute('aria-required', 'true');
        // usernameInput.setAttribute('aria-label', 'Username');
        setAttributes(input, [
            { name: 'name', value: this.name },
            { name: 'id', value: this.id },
            { name: 'autocorrect', value: !this.autocorrect ? 'off' : undefined },
            { name: 'spellcheck', value: !this.spellcheck ? 'false' : undefined },
            { name: 'autocomplete', value: this.autocomplete || undefined },
            { name: 'autofocus', value: this.autofocus ? '' : undefined },
            { name: 'minlength', value: this.minLength.toString() },
            { name: 'maxlength', value: this.maxLength.toString() },
        ]);

        if (this.required) {
            input.required = true;
            input.setAttribute('aria-required', 'true');
            // TODO: add required styling
        }

        if (this.disabled) {
            input.disabled = true;
            input.setAttribute('aria-disabled', 'true');
            // TODO: add disabled styling
        }

        if (this.onChange && typeof this.onChange === 'function') {
            input.addEventListener('change', (e) => {
                this.value = e.target.value;
                this.onChange(e);
            });
        }

        return input;
    }

    /**
     * Sets the value of the component and updates the corresponding input element's value.
     * @param {string} newValue - The new value to set for the component.
     * @return {Input} - Returns the current instance of the component for method chaining.
     */
    setValue(newValue) {
        this.value = newValue;
        if (this.element) {
            const input = this.element.querySelector('input');
            if (input) {
                input.value = newValue;
            }
        }
        return this;
    }

    /**
     * Retrieves the value from the input element within the current element context.
     * If no input element is found or the current element is not set, it returns the value property of the instance,
     * defaulting to an empty string if that property is also undefined.
     * @return {string} The value of the input element or the value property, defaulting to an empty string.
     */
    getValue() {
        if (this.element) {
            const input = this.element.querySelector('input');
            if (input) {
                return input.value;
            }
        }
        return this.value || '';
    }

    #addIcon(label) {
        if (this.icon) {
            const iconClasses = {
                account: styles.account,
                person: styles.person,
                lock: styles.lock,
            };

            const icon = document.createElement('div');
            icon.classList.add(styles.icon, iconClasses[this.icon]);
            icon.setAttribute('alt', '');
            icon.setAttribute('aria-hidden', 'true');
            label.appendChild(icon);
        }
    }

    #createFloatingLabel(textContent) {
        const floatingLabel = document.createElement('span');
        floatingLabel.classList.add(styles.floatingLabel);
        floatingLabel.textContent = textContent;
        return floatingLabel;
    }
}
