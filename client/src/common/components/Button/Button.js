import styles from './Button.module.css';
import BaseComponent from '@core/base/BaseComponent';

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
     */
    constructor({ text = '', type = 'secondary', icon = '', onClick = null, disabled = false } = {}) {
        super();

        this.text = text;
        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);
        this.onClick = onClick;
        this.disabled = disabled;
    }

    #validateType(type) {
        const validTypes = new Set(['primary', 'secondary', 'mute']);
        if (!validTypes.has(type)) {
            throw new Error(`Invalid button type "${type}". Must be one of: ${Array.from(validTypes).join(', ')}]`);
        }
        return type;
    }

    #validateIcon(icon) {
        const validIcons = new Set(['add', 'delete', 'home', 'login', 'logout']);
        if (icon && !validIcons.has(icon)) {
            throw new Error(`Invalid button icon "${icon}". Must be one of: ${Array.from(validIcons).join(', ')}`);
        }
        return icon;
    }

    render() {
        this.element = this.#createButton();
        this.#addIcon(this.element);
        this.#addLabel(this.element);
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
            button.appendChild(iconElement);
        }
    }

    #addLabel(button) {
        const labelSpan = document.createElement('span');
        labelSpan.classList.add(styles.label);
        labelSpan.textContent = this.text;
        button.appendChild(labelSpan);
    }

    #configureButton(button) {
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
            button.removeEventListener('click', this.onClick);
        }
    }

    setText(newText) {
        const labelSpan = this.element.querySelector(`.${styles.label}`);
        if (labelSpan) {
            labelSpan.textContent = newText;
        }
    }

    setDisabled(isDisabled) {
        this.disabled = isDisabled;
        this.#configureButton(this.element);
    }
}
