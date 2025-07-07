import styles from './MessageBox.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable MessageBox component.
 * @class MessageBox
 */
export default class MessageBox extends BaseComponent {
    constructor({ message = '', type, closeable = false } = {}) {
        super();

        this.message = message;
        this.type = this.#validateType(type);
        this.closeable = closeable;
    }

    #validate(value, validValues, name) {
        if (value && !validValues.has(value)) {
            throw new Error(`Invalid ${name} "${value}". Must be one of: ${Array.from(validValues).join(', ')}`);
        }
        return value;
    }

    #validateType(type) {
        const validTypes = new Set(['success', 'info', 'warning', 'error']);
        return this.#validate(type, validTypes, 'messagebox type');
    }

    render() {
        this.element = this.#createMessageBox();
        this.#addIcon(this.element);
        this.#addMessage(this.element);
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

    #addMessage(element) {
        const messageSpan = document.createElement('span');
        messageSpan.textContent = this.message;
        element.appendChild(messageSpan);
    }

    setMessage(newMessage) {
        this.message = newMessage;
        this.element.querySelector('span').textContent = this.message;
        return this;
    }

    setType(newType) {
        this.element.classList.remove(styles[this.type]);
        this.type = this.#validateType(newType);
        this.element.classList.add(styles[this.type]);
        return this;
    }
}
