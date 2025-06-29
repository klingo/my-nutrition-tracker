import styles from './Loader.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * Represents a customizable Loader component.
 * @class Loader
 */
export default class Loader extends BaseComponent {
    constructor({ size = 'normal' } = {}) {
        super();

        this.size = this.#validateSize(size);
    }

    #validateSize(size) {
        const validSizes = new Set(['small', 'normal', 'medium', 'large']);
        if (!validSizes.has(size)) {
            throw new Error(`Invalid size "${size}". Must be one of: ${Array.from(validSizes).join(', ')}`);
        }
        return size;
    }

    render() {
        const div = document.createElement('div');
        div.classList.add(styles.loader, styles[this.size]);
        this.element = div;
        return this.element;
    }
}
