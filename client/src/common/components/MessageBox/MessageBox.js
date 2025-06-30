import styles from './MessageBox.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable MessageBox component.
 * @class MessageBox
 */
export default class MessageBox extends BaseComponent {
    constructor({ text = '', type, closeable = false } = {}) {
        super();

        this.text = text;
        this.type = this.#validateType(type);
        this.closeable = closeable;
    }

    #validateType(type) {
        const validTypes = new Set(['success', 'info', 'warning', 'error']);
        if (!validTypes.has(type)) {
            throw new Error(`Invalid messagebox type "${type}". Must be one of: ${Array.from(validTypes).join(', ')}]`);
        }
        return type;
    }

    render() {
        this.element = this.#createMessageBox();
        this.#addIcon(this.element);
        this.#addText(this.element);
        return this.element;
    }

    #createMessageBox() {
        const element = document.createElement('div');
        element.classList.add(styles.messageBox, styles[this.type]);
        return element;
    }

    #addIcon(element) {
        const iconElement = document.createElement('div');
        iconElement.classList.add(styles.icon);
        element.appendChild(iconElement);
    }

    #addText(element) {
        const textSpan = document.createElement('span');
        textSpan.textContent = this.text;
        element.appendChild(textSpan);
    }

    setText(newText) {
        this.text = newText;
        this.element.querySelector('span').textContent = this.text;
        return this;
    }

    setType(newType) {
        this.element.classList.remove(styles[this.type]);
        this.type = newType;
        this.element.classList.add(styles[this.type]);
        return this;
    }
}
