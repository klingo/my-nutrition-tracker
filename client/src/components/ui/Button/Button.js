import styles from './Button.module.css';

export const BUTTON_TYPES = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    MUTE: 'mute',
};

/**
 * Represents a customizable Button component.
 * @class Button
 */
export default class Button {
    /**
     *
     * @param children
     * @param {'primary'|'secondary'|´mute'} [type='secondary'] - Button type
     * @param size
     * @param onClick
     * @param disabled
     */
    constructor({ children = '', type = BUTTON_TYPES.SECONDARY, size = 'medium', onClick, disabled = false } = {}) {
        if (!Object.values(BUTTON_TYPES).includes(type)) {
            throw new Error(`Invalid button type "${type}". Must be one of: ${Object.values(BUTTON_TYPES).join(', ')}`);
        } else {
            this.type = type;
        }

        this.children = children;
        this.size = size;
        this.onClick = onClick;
        this.disabled = disabled;

        this.element = null;
    }

    render() {
        const button = document.createElement('button');

        button.classList.add(styles.button);
        button.classList.add(styles[this.type]);
        // this.disabled ? button.classList.add(styles.disabled) : '';

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
        button.disabled = this.disabled;

        if (this.onClick) {
            button.addEventListener('click', this.onClick);
        }

        this.element = button;
        return button;
    }

    mount(parent) {
        if (!this.element) {
            this.render();
        }
        parent.appendChild(this.element);
        return this;
    }
}
