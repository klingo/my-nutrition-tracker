import styles from './ContentBlock.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable ContentBlock component.
 * A basic building block for content that can be used in various layouts.
 * @class ContentBlock
 */
export default class ContentBlock extends BaseComponent {
    /**
     * Creates a new ContentBlock instance.
     * @param {Object} [options={}] - Optional parameters for the content block.
     * @param {string} [options.className] - Additional CSS class names to apply.
     */
    constructor({ className = '' } = {}) {
        super();
        this.className = className;
    }

    render() {
        this.element = this.#createDivElement();
        return this.element;
    }

    #createDivElement() {
        const contentBlock = document.createElement('div');
        contentBlock.classList.add(styles.contentBlock);

        // Add additional class names if specified
        if (this.className) {
            this.className.split(' ').forEach((cls) => {
                if (cls) contentBlock.classList.add(cls);
            });
        }

        return contentBlock;
    }

    append(children) {
        if (!this.element) this.render();
        this.element.append(children);
        return this;
    }
}
