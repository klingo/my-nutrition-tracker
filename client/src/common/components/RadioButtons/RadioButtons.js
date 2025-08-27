import styles from './RadioButtons.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable RadioButtons component.
 * @class RadioButtons
 */
export default class RadioButtons extends BaseComponent {
    constructor({
        name = '',
        id = '',
        label = '',
        value = '',
        width = undefined,
        required = false,
        disabled = false,
        options = [],
        compact = false,
    } = {}) {
        super();

        // Validate inputs early
        this.options = this.#validateOptions(options);

        // Assign simple properties
        this.name = name;
        this.id = id;
        this.label = label;
        this.value = value;
        this.width = width;
        this.required = required;
        this.disabled = disabled;
        this.compact = compact;
    }

    #validateOptions(options) {
        if (!options || !Array.isArray(options)) throw new Error('Options must be an array');
        for (const option of options) {
            if (!Object.prototype.hasOwnProperty.call(option, 'value') || typeof option.value !== 'string')
                throw new Error('Each option must have a string value property');
            if (!Object.prototype.hasOwnProperty.call(option, 'text') || typeof option.text !== 'string')
                throw new Error('Each option must have a string text property');
        }
        return options;
    }

    render() {
        const container = this.#createContainer();

        this.options.forEach((option) => {
            const labelElement = document.createElement('label');
            const inputElement = document.createElement('input');
            inputElement.type = 'radio';
            inputElement.name = this.name;
            inputElement.value = option.value;
            if (option.value === this.value) inputElement.checked = true;

            labelElement.append(inputElement, option.text);
            container.append(labelElement);
        });

        this.element = container;
        return this.element;
    }

    /**
     * Creates the container element
     * @returns {HTMLElement} The container element
     */
    #createContainer() {
        const div = document.createElement('div');
        div.classList.add(styles.radioButtons);
        if (this.width) div.style.width = this.width;
        return div;
    }
}
