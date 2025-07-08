import styles from './ContentBlock.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable ContentBlock component.
 * @class ContentBlock
 */
export default class ContentBlock extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.element = this.#createDivElement();
        return this.element;
    }

    #createDivElement() {
        const contentBlock = document.createElement('div');
        contentBlock.classList.add(styles.contentBlock);
        return contentBlock;
    }

    append(children) {
        if (!this.element) this.render();
        this.element.append(children);
        return this;
    }
}
