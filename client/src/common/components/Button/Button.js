import styles from './Button.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable Button component.
 * @class Button
 */
export default class Button extends BaseComponent {
    /**
     * @param {string|HTMLElement|[string|HTMLElement]} children
     * @param {'primary'|'secondary'|'mute'} [type='secondary'] - Button type
     * @param {string} icon
     * @param {function} onClick
     * @param {boolean} disabled
     */
    constructor({ children = '', type = 'secondary', icon, onClick = null, disabled = false } = {}) {
        super();

        this.children = children;
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
        const button = this.#createButton();
        this.#addIcon(button);
        this.#addLabel(button);
        this.#configureButton(button);
        this.element = button;
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
        const childrenArray = Array.isArray(this.children) ? this.children : [this.children];
        childrenArray.forEach((child) => this.#addChildToSpan(labelSpan, child));
        button.appendChild(labelSpan);
    }

    #addChildToSpan(span, child) {
        if (typeof child === 'string') {
            span.textContent += child;
        } else if (child instanceof HTMLElement) {
            span.appendChild(child);
        }
    }

    #configureButton(button) {
        if (this.disabled) {
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
        }
        // TODO: implement disabled state
        if (this.onClick && !this.disabled) {
            button.addEventListener('click', this.onClick);
        }
    }
}
