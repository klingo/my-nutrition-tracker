import styles from './Fieldset.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable Fieldset component.
 * @class Fieldset
 */
export default class Fieldset extends BaseComponent {
    /**
     * @param {Object} [options={}] - An object containing optional parameters.
     * @param {string} [options.label=''] - The label to be displayed.
     * @param {string} [options.icon=''] - The icon to be validated and used.
     * @param {boolean} [options.required=false] - Indicates whether an input is required.
     */
    constructor({ label = '', icon = '', required = false } = {}) {
        super();

        this.label = label;
        this.icon = this.#validateIcon(icon);
        this.required = required;

        this.contentElement = null;
    }

    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    #validateIcon(icon) {
        const validIcons = new Set(['gender', 'birthday']);
        return icon && this.#validate(icon, validIcons, 'fieldset icon');
    }

    render() {
        this.element = this.#createFieldsetElement(this.required);

        if (this.label) {
            const legend = this.#createLegendElement(this.label);
            this.element.appendChild(legend);
        }

        this.#addIcon(this.contentElement);

        return this.element;
    }

    append(children) {
        if (!this.element) this.render();
        this.contentElement.append(children);
        return this;
    }

    #createFieldsetElement(required) {
        const fieldset = document.createElement('fieldset');
        fieldset.classList.add(styles.fieldset);
        if (required) fieldset.classList.add(styles.required);
        this.contentElement = document.createElement('div');
        this.contentElement.classList.add(styles.content);
        fieldset.appendChild(this.contentElement);
        return fieldset;
    }

    #createLegendElement(label) {
        const legend = document.createElement('legend');
        legend.classList.add(styles.legend);
        legend.textContent = label;
        return legend;
    }

    #addIcon(content) {
        if (this.icon) {
            const iconClasses = {
                gender: styles.gender,
                birthday: styles.birthday,
            };

            const icon = document.createElement('div');
            icon.classList.add(styles.icon, iconClasses[this.icon]);
            icon.setAttribute('alt', '');
            icon.setAttribute('aria-hidden', 'true');
            this.element.insertBefore(icon, content);
        }
    }
}
