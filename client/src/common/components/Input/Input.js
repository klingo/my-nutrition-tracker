import styles from './Input.module.css';
import iconStyles from '@styles/icons.module.css';
import BaseComponent from '@core/base/BaseComponent';
import setAttributes from '@common/utils/setAttributes';

// Predefined validation sets to avoid recreating them on each validation call
const VALID_TYPES = new Set(['text', 'password', 'number', 'email', 'date']);

const VALID_ICONS = new Set([
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
     * @param {string} width
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
     * @param {string} numberConfig.inputmode='numeric'
     * @param {string} numberConfig.suffix=''
     * @param {boolean} compact
     */
    constructor({
        type = 'text',
        name = '',
        id = '',
        label = '',
        value = '',
        width = undefined,
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
            inputmode: 'numeric',
            suffix: '',
        },
        compact = false,
    } = {}) {
        super();

        // Validate inputs early
        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);

        // Assign simple properties
        this.name = name;
        this.id = id;
        this.label = label;
        this.value = value;
        this.width = width;
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
        this.compact = compact;

        // Deep clone numberConfig to prevent external mutations
        this.numberConfig = {
            min: numberConfig.min,
            max: numberConfig.max,
            step: numberConfig.step,
            inputmode: numberConfig.inputmode,
            suffix: numberConfig.suffix,
        };

        // Initialize internal state
        this.errorMessage = '';
        this.errorElement = null;
    }

    /**
     * Validates a value against a set of valid values
     * @param {*} value - The value to validate
     * @param {Set} validValues - Set of valid values
     * @param {string} name - Name of the property being validated
     * @returns {*} The validated value
     * @throws {Error} If the value is not in the set of valid values
     */
    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    /**
     * Validates the input type
     * @param {string} type - The input type to validate
     * @returns {string} The validated type
     */
    #validateType(type) {
        return this.#validate(type, VALID_TYPES, 'input type');
    }

    /**
     * Validates the input icon
     * @param {string} icon - The icon to validate
     * @returns {string|undefined} The validated icon or undefined
     */
    #validateIcon(icon) {
        return icon && this.#validate(icon, VALID_ICONS, 'input icon');
    }

    /**
     * Renders the input component
     * @returns {HTMLElement} The rendered input element
     */
    render() {
        const container = this.#createContainer();
        const label = this.#createLabel();

        container.appendChild(label);
        this.#addIcon(label);

        const input = this.#createInput();
        label.appendChild(input);

        this.#addOutline(label);
        this.#addSuffix(label);
        this.#addErrorIcon(label);
        container.append(this.#createHelperLine(input));

        this.element = container;
        return this.element;
    }

    /**
     * Creates the container element
     * @returns {HTMLElement} The container element
     */
    #createContainer() {
        const div = document.createElement('div');
        div.classList.add(styles.input);
        if (this.width) div.style.width = this.width;
        return div;
    }

    /**
     * Creates the label element
     * @returns {HTMLElement} The label element
     */
    #createLabel() {
        const label = document.createElement('label');
        label.classList.add(styles.label);
        if (this.compact) label.classList.add(styles.compact);
        return label;
    }

    /**
     * Creates the input element
     * @returns {HTMLInputElement} The input element
     */
    #createInput() {
        const input = document.createElement('input');
        input.type = this.type;
        input.placeholder = ''; // Required for custom placeholder styling
        input.value = this.value || '';

        // Set attributes using the utility function
        setAttributes(input, [
            { name: 'name', value: this.name || undefined },
            { name: 'id', value: this.id || undefined },
            { name: 'autocorrect', value: !this.autocorrect ? 'off' : undefined },
            { name: 'spellcheck', value: !this.spellcheck ? 'false' : undefined },
            { name: 'autocomplete', value: this.autocomplete || undefined },
            { name: 'autofocus', value: this.autofocus ? '' : undefined },
            { name: 'aria-invalid', value: 'false' },
            { name: 'aria-required', value: this.required ? 'true' : undefined },
        ]);

        // Add type-specific attributes
        this.#addTypeSpecificAttributes(input);

        // Add validation attributes
        if (this.required) {
            input.required = true;
        }

        if (this.disabled) {
            input.disabled = true;
            input.setAttribute('aria-disabled', 'true');
            // TODO: add disabled styling
        }

        // Add event listeners
        input.addEventListener('invalid', (event) => this.#handleInvalid(event));
        input.addEventListener('input', (event) => this.#handleInput(event));

        return input;
    }

    /**
     * Adds type-specific attributes to the input element
     * @param {HTMLInputElement} input - The input element
     */
    #addTypeSpecificAttributes(input) {
        if (['text', 'email', 'search', 'password', 'tel', 'url'].includes(this.type)) {
            if (this.minLength !== undefined) input.setAttribute('minlength', this.minLength.toString());
            if (this.maxLength !== undefined) input.setAttribute('maxlength', this.maxLength.toString());
            if (this.pattern) input.setAttribute('pattern', this.pattern);
        }

        if (this.numberConfig && (this.type === 'number' || this.type === 'date')) {
            if (this.numberConfig.min !== undefined && this.numberConfig.min !== null)
                input.setAttribute('min', this.numberConfig.min.toString());
            if (this.numberConfig.max !== undefined && this.numberConfig.max !== null) {
                const maxLength = (this.numberConfig.max + (this.numberConfig.step || 1)).toString().length;
                input.setAttribute('max', this.numberConfig.max.toString());
                input.addEventListener('input', () => {
                    if (input.value.length > maxLength) input.value = input.value.slice(0, maxLength);
                });
            }
            if (this.numberConfig.step !== undefined && this.numberConfig.step !== null)
                input.setAttribute('step', this.numberConfig.step.toString());
            if (this.numberConfig.inputmode) input.setAttribute('inputmode', this.numberConfig.inputmode);
        }
    }

    /**
     * Adds an icon to the label if specified
     * @param {HTMLElement} label - The label element
     */
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

    /**
     * Adds a suffix to the input if specified
     * @param {HTMLInputElement} input - The input element
     */
    #addSuffix(label) {
        if (this.numberConfig?.suffix) {
            const suffixElement = document.createElement('span');
            suffixElement.textContent = this.numberConfig.suffix;
            suffixElement.classList.add(styles.suffixText);
            label.append(suffixElement);
        }
    }

    /**
     * Adds the outline element to the label
     * @param {HTMLElement} label - The label element
     */
    #addOutline(label) {
        const outline = document.createElement('div');
        outline.classList.add(styles.outline);
        label.appendChild(outline);

        if (this.label) {
            const floatingLabel = this.#createFloatingLabel(this.label);
            outline.appendChild(floatingLabel);
        }
    }

    /**
     * Creates a floating label element
     * @param {string} textContent - The text content for the label
     * @returns {HTMLElement} The floating label element
     */
    #createFloatingLabel(textContent) {
        const floatingLabel = document.createElement('span');
        floatingLabel.classList.add(styles.floatingLabel);
        floatingLabel.textContent = textContent;
        return floatingLabel;
    }

    /**
     * Adds an error icon to the label
     * @param {HTMLElement} label - The label element
     */
    #addErrorIcon(label) {
        const icon = document.createElement('div');
        icon.classList.add(iconStyles.icon, iconStyles.error, styles.trailingIcon);
        icon.setAttribute('alt', '');
        icon.setAttribute('aria-hidden', 'true');
        label.appendChild(icon);
    }

    /**
     * Creates the helper line element
     * @param {HTMLInputElement} input - The input element
     * @returns {HTMLElement} The helper line element
     */
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
            characterCounter.textContent = `${input.value.length}/${this.maxLength}`;
            helperLine.appendChild(characterCounter);

            input.addEventListener('input', () => {
                characterCounter.textContent = `${input.value.length}/${this.maxLength}`;
            });
        }

        return helperLine;
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

    /**
     * Handles invalid input events
     * @param {Event} event - The invalid event
     */
    #handleInvalid(event) {
        event.preventDefault();
        const input = event.target;
        input.setAttribute('aria-invalid', 'true');

        // Map validity states to error messages
        const validityMap = {
            valueMissing: 'This field is required',
            typeMismatch: 'Please enter a valid value',
            patternMismatch: this.patternErrorMessage || 'Please match the requested format',
            tooShort: `Please enter at least ${input.minLength} characters`,
            tooLong: `Please enter no more than ${input.maxLength} characters`,
            rangeUnderflow:
                this.type === 'date'
                    ? `Date must be after ${input.min}`
                    : `Value must be greater than or equal to ${input.min}`,
            rangeOverflow:
                this.type === 'date'
                    ? 'Date must not be in the future'
                    : `Value must be less than or equal to ${input.max}`,
            stepMismatch: 'Please enter a valid value',
            badInput: this.type === 'date' ? 'Please enter a valid date' : 'Please enter a valid value',
        };

        // Find the first validity issue and set the error message
        for (const [validityKey, message] of Object.entries(validityMap)) {
            if (input.validity[validityKey]) {
                this.errorMessage = message;
                break;
            }
        }

        this.#updateErrorMessage();
    }

    /**
     * Handles input events
     * @param {Event} event - The input event
     */
    #handleInput(event) {
        const input = event.target;
        if (input.validity.valid) {
            input.setAttribute('aria-invalid', 'false');
            this.errorMessage = '';
            this.#updateErrorMessage();
        } else if (this.errorMessage) {
            // Re-validate if there was a previous error
            this.#handleInvalid(event);
        }
    }

    /**
     * Updates the error message display
     */
    #updateErrorMessage() {
        // Lazy initialize errorElement if needed
        if (!this.errorElement) {
            this.errorElement = this.element?.querySelector(`.${styles.errorText}`);
            if (!this.errorElement) return;
        }

        if (this.errorMessage) {
            this.errorElement.textContent = this.errorMessage;
            this.errorElement.style.display = 'block';
            this.element?.classList.add(styles.hasError);
        } else {
            this.errorElement.textContent = '';
            this.errorElement.style.display = 'none';
            this.element?.classList.remove(styles.hasError);
        }
    }
}
