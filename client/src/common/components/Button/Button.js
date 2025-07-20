import styles from './Button.module.css';
import BaseComponent from '@core/base/BaseComponent';
import Loader from '@common/components/Loader';

/**
 * Represents a customizable Button component.
 * @class Button
 */
export default class Button extends BaseComponent {
    /**
     * @param {string} text
     * @param {'primary'|'secondary'|'mute'} [type='secondary'] - Button type
     * @param {string} icon
     * @param {function} onClick
     * @param {boolean} disabled
     * @param {'button'|'submit'|'reset'} [buttonType='button']
     */
    constructor({
        text = '',
        type = 'secondary',
        icon = '',
        onClick = null,
        disabled = false,
        buttonType = 'button',
    } = {}) {
        super();

        this.text = text;
        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);
        this.onClick = onClick;
        this.disabled = disabled;
        this.buttonType = this.#validateButtonType(buttonType);
    }

    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    #validateType(type) {
        const validTypes = new Set(['primary', 'secondary', 'mute']);
        return this.#validate(type, validTypes, 'button type');
    }

    #validateButtonType(buttonType) {
        const validButtonTypes = new Set(['button', 'submit', 'reset']);
        return this.#validate(buttonType, validButtonTypes, 'button buttonType');
    }

    #validateIcon(icon) {
        const validIcons = new Set(['add', 'delete', 'home', 'login', 'logout']);
        return this.#validate(icon, validIcons, 'button icon');
    }

    render() {
        this.element = this.#createButton();
        this.#addIcon(this.element);
        this.#addLabel(this.element, this.text);
        this.#configureButton(this.element);
        return this.element;
    }

    #createButton() {
        const button = document.createElement('button');
        button.classList.add(styles.button, styles[this.type]);
        return button;
    }

    #addIcon(button) {
        if (this.icon) {
            const iconElement = document.createElement('div');
            iconElement.classList.add(styles.icon, styles[this.icon]);
            button.append(iconElement);
        }
    }

    #addLabel(button, text) {
        const labelSpan = document.createElement('span');
        labelSpan.classList.add(styles.label);
        labelSpan.textContent = text;
        button.append(labelSpan);
    }

    #configureButton(button) {
        if (this.buttonType) button.setAttribute('type', this.buttonType);
        if (this.disabled) {
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
        } else {
            button.disabled = false;
            button.removeAttribute('aria-disabled');
        }
        if (this.onClick && !this.disabled) {
            button.addEventListener('click', this.onClick);
        } else {
            if (this.onClick) {
                button.removeEventListener('click', this.onClick);
            }
        }
    }

    setText(newText) {
        const labelSpan = this.element.querySelector(`.${styles.label}`);
        if (labelSpan) {
            labelSpan.textContent = newText;
        }
        return this;
    }

    setDisabled(isDisabled) {
        this.disabled = isDisabled;
        this.#configureButton(this.element);
        return this;
    }

    setLoading(isLoading) {
        this.setDisabled(isLoading);
        if (isLoading) {
            this.element.classList.add(styles.loading);
            this.#addLoader();
        } else {
            this.element.classList.remove(styles.loading);
            this.#removeLoader();
        }
        return this;
    }

    #addLoader() {
        const loader = new Loader({ size: 'small' }).render();
        loader.classList.add(styles.loader);
        this.element.prepend(loader);
    }

    #removeLoader() {
        const loaderElement = this.element.querySelector(`.${styles.loader}`);
        if (loaderElement) {
            loaderElement.remove();
        }
    }
}
