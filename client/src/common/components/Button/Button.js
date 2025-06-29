import styles from './Button.module.css';
import BaseComponent from '@core/base/BaseComponent';

export const BUTTON_TYPES = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    MUTE: 'mute',
};

export const BUTTON_ICONS = {
    ADD: styles.add,
    DELETE: styles.delete,
    HOME: styles.home,
    LOGIN: styles.login,
    LOGOUT: styles.logout,
};

/**
 * Represents a customizable Button component.
 * @class Button
 */
export default class Button extends BaseComponent {
    /**
     * @param {string|HTMLElement|[string|HTMLElement]} children
     * @param {'primary'|'secondary'|'mute'} [type='secondary'] - Button type
     * @param icon
     * @param onClick
     * @param disabled
     */
    constructor({ children = '', type = BUTTON_TYPES.SECONDARY, icon = null, onClick, disabled = false } = {}) {
        super();

        this.type = this.#validateType(type);
        this.icon = this.#validateIcon(icon);
        this.children = children;
        this.onClick = onClick;
        this.disabled = disabled;
    }

    #validateType(type) {
        if (!Object.values(BUTTON_TYPES).includes(type)) {
            throw new Error(`Invalid button type "${type}". Must be one of: ${Object.values(BUTTON_TYPES).join(', ')}`);
        }
        return type;
    }

    #validateIcon(icon) {
        if (icon && !Object.values(BUTTON_ICONS).includes(icon)) {
            throw new Error(`Invalid button icon "${icon}". Must be one of: ${Object.values(BUTTON_ICONS).join(', ')}`);
        }
        return icon;
    }

    render() {
        const button = this.#createButton();
        this.#addIcon(button);
        this.#addLabel(button);
        this.#configureButton(button);
        this.element = button;
        return button;
    }

    #createButton() {
        const button = document.createElement('button');
        button.classList.add(styles.button);
        button.classList.add(styles[this.type]);
        return button;
    }

    #addIcon(button) {
        if (this.icon) {
            const icon = document.createElement('div');
            icon.classList.add(styles.icon);
            icon.classList.add(this.icon);
            button.appendChild(icon);
        }
    }

    #addLabel(button) {
        const span = document.createElement('span');
        span.classList.add(styles.label);
        if (typeof this.children === 'string') {
            span.textContent = this.children;
        } else if (this.children instanceof HTMLElement) {
            span.appendChild(this.children);
        } else if (Array.isArray(this.children)) {
            this.children.forEach((child) => {
                if (typeof child === 'string') {
                    span.textContent += child;
                } else if (child instanceof HTMLElement) {
                    span.appendChild(child);
                }
            });
        }
        button.appendChild(span);
    }

    #configureButton(button) {
        button.disabled = this.disabled;
        // TODO: implement disabled state
        if (this.onClick && !this.disabled) {
            button.addEventListener('click', this.onClick);
        }
    }
}
