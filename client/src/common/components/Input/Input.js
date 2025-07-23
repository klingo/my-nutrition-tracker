import styles from './Input.module.css';
import iconStyles from '@styles/icons.module.css';
import BaseComponent from '@core/base/BaseComponent';
import setAttributes from '@common/utils/setAttributes';

/**
 * Represents a customizable Input component.
 * @class Input
 */
export default class Input extends BaseComponent {
    /**
     * @param {'text'|'password'|'number'|'email'|'date'} [type='text'] - Input type
     * @param {string} name
     * @param {string} id
     * @param {string} label
     * @param {string} value
     * @param {string} pattern
     * @param {string} patternErrorMessage
     * @param {boolean} autocorrect
     * @param {boolean} spellcheck
     * @param {boolean} autocomplete
     * @param {boolean} autofocus
     * @param {number} minLength
     * @param {number} maxLength
     * @param {boolean} required
     * @param {boolean} disabled
     * @param {string} errorMessage
     * @param {string} icon
     * @param {Object} numberConfig
     * @param {number} numberConfig.min
     * @param {number} numberConfig.max
     * @param {number} numberConfig.step
     */
    constructor({
        type = 'text',
        name = '',
        id = '',
        label = '',
        value = '',
        pattern = '',
        patternErrorMessage = '',
        autocorrect = true,
        spellcheck = true,
        autocomplete = undefined,
        autofocus = false,
        minLength = undefined,
        maxLength = undefined,
        required = false,
        disabled = false,
        icon = '',
        numberConfig = {
            min: undefined,
            max: undefined,
            step: undefined,
        },
    } = {}) {
        super();

        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);
        this.name = name;
        this.id = id;
        this.label = label;
        this.value = value;
        this.pattern = pattern;
        this.patternErrorMessage = patternErrorMessage;
        this.required = required;
        this.autocorrect = autocorrect;
        this.spellcheck = spellcheck;
        this.autocomplete = autocomplete;
        this.autofocus = autofocus;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.disabled = disabled;
        this.numberConfig = numberConfig;

        this.errorMessage = '';
        this.errorElement = null;
    }

    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    #validateType(type) {
        const validTypes = new Set(['text', 'password', 'number', 'email', 'date']);
        return this.#validate(type, validTypes, 'input type');
    }

    #validateIcon(icon) {
        const validIcons = new Set([
            'account',
            'person',
            'lock',
            'mail',
            'height',
            'weight',
            'birthday',
            'barcode',
            'calcium',
            'calories',
            'carbohydrates',
            'fat',
            'fiber',
            'magnesium',
            'monounsaturated-fat',
            'package-size',
            'polyols',
            'polyunsaturated-fat',
            'potassium',
            'protein',
            'salt',
            'saturated-fat',
            'serving-size',
            'sodium',
            'sugars',
        ]);
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

        if (this.required) this.#addErrorIcon(label);

        div.append(this.#createHelperLine(input));

        // TODO: Support "helper-text" on bottom
        // See: https://m2.material.io/components/text-fields

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
            { name: 'aria-invalid', value: 'false' },
        ]);

        if (['text', 'email', 'search', 'password', 'tel', 'url'].includes(this.type)) {
            if (this.minLength) input.setAttribute('minlength', this.minLength.toString());
            if (this.maxLength) input.setAttribute('maxlength', this.maxLength.toString());
            if (this.pattern) input.setAttribute('pattern', this.pattern);
        }

        if (this.numberConfig && (this.type === 'number' || this.type === 'date')) {
            if (this.numberConfig.min !== undefined && this.numberConfig.min !== null)
                input.setAttribute('min', this.numberConfig.min.toString());
            if (this.numberConfig.max !== undefined && this.numberConfig.max !== null) {
                const maxLength = this.numberConfig.max.toString().length;
                input.setAttribute('max', this.numberConfig.max.toString());
                input.addEventListener('input', () => {
                    if (input.value.length > maxLength) input.value = input.value.slice(0, maxLength);
                });
            }
            if (this.numberConfig.step !== undefined && this.numberConfig.step !== null)
                input.setAttribute('step', this.numberConfig.step.toString());
        }

        if (this.required) {
            input.required = true;
            input.setAttribute('aria-required', 'true');
        }

        if (this.disabled) {
            input.disabled = true;
            input.setAttribute('aria-disabled', 'true');
            // TODO: add disabled styling
        }

        input.addEventListener('invalid', (event) => this.#handleInvalid(event));
        input.addEventListener('input', (event) => this.#handleInput(event));

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
            const icon = document.createElement('div');
            icon.classList.add(iconStyles.icon, iconStyles[this.icon]);
            icon.setAttribute('alt', '');
            icon.setAttribute('aria-hidden', 'true');
            label.setAttribute('data-has-icon', 'true');
            label.appendChild(icon);
        }
    }

    #addErrorIcon(label) {
        const icon = document.createElement('div');
        icon.classList.add(iconStyles.icon, iconStyles.error, styles.trailingIcon);
        icon.setAttribute('alt', '');
        icon.setAttribute('aria-hidden', 'true');
        label.appendChild(icon);
    }

    #createFloatingLabel(textContent) {
        const floatingLabel = document.createElement('span');
        floatingLabel.classList.add(styles.floatingLabel);
        floatingLabel.textContent = textContent;
        return floatingLabel;
    }

    #createHelperLine(input) {
        const helperLine = document.createElement('div');
        helperLine.classList.add(styles.helperLine);

        this.errorElement = document.createElement('span');
        this.errorElement.classList.add(styles.errorText);
        this.errorElement.style.display = 'none';
        helperLine.appendChild(this.errorElement);

        if (this.maxLength) {
            const characterCounter = document.createElement('span');
            characterCounter.classList.add(styles.characterCounter);
            characterCounter.textContent = `${this.value.length}/${this.maxLength}`;
            helperLine.appendChild(characterCounter);

            input.addEventListener('input', () => {
                characterCounter.textContent = `${input.value.length}/${this.maxLength}`;
            });
        }

        return helperLine;
    }

    #handleInvalid(event) {
        event.preventDefault();
        const input = event.target;
        input.setAttribute('aria-invalid', 'true');

        if (input.validity.valueMissing) {
            this.errorMessage = 'This field is required';
        } else if (input.validity.typeMismatch) {
            this.errorMessage = 'Please enter a valid value';
        } else if (input.validity.patternMismatch) {
            this.errorMessage = this.patternErrorMessage || 'Please match the requested format';
        } else if (input.validity.tooShort) {
            this.errorMessage = `Please enter at least ${input.minLength} characters`;
        } else if (input.validity.tooLong) {
            this.errorMessage = `Please enter no more than ${input.maxLength} characters`;
        } else if (input.validity.rangeUnderflow) {
            this.errorMessage =
                this.type === 'date'
                    ? `Date must be after ${input.min}`
                    : `Value must be greater than or equal to ${input.min}`;
        } else if (input.validity.rangeOverflow) {
            this.errorMessage =
                this.type === 'date'
                    ? 'Date must not be in the future'
                    : `Value must be less than or equal to ${input.max}`;
        } else if (input.validity.stepMismatch) {
            this.errorMessage = 'Please enter a valid value';
        } else if (input.validity.badInput) {
            this.errorMessage = this.type === 'date' ? 'Please enter a valid date' : 'Please enter a valid value';
        }

        this.#updateErrorMessage();
    }

    #handleInput(event) {
        const input = event.target;
        if (input.validity.valid) {
            input.setAttribute('aria-invalid', 'false');
            this.errorMessage = '';
            this.#updateErrorMessage();
        } else if (this.errorMessage) {
            this.#handleInvalid(event);
        }
    }

    #updateErrorMessage() {
        if (!this.errorElement) {
            this.errorElement = this.element.querySelector(`.${styles.errorText}`);
            if (!this.errorElement) return;
        }

        if (this.errorMessage) {
            this.errorElement.textContent = this.errorMessage;
            this.errorElement.style.display = 'block';
            this.element.classList.add(styles.hasError);
        } else {
            this.errorElement.textContent = '';
            this.errorElement.style.display = 'none';
            this.element.classList.remove(styles.hasError);
        }
    }
}
