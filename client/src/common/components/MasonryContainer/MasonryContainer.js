import styles from './MasonryContainer.module.css';
import BaseComponent from '@core/base/BaseComponent';
import Masonry from 'masonry-layout';

/**
 * Represents a masonry container for content blocks.
 * Provides a flexible layout where blocks can flow naturally to the next row.
 * @class MasonryContainer
 */
export default class MasonryContainer extends BaseComponent {
    /**
     * Creates a new MasonryContainer instance.
     * @param {Object} [options={}] - Optional parameters for the masonry container.
     * @param {string} [options.gutter='g-3'] - The gutter size between blocks (g-0 to g-5).
     */
    constructor({ gutter = 'g-3' } = {}) {
        super();
        this.gutter = gutter;
        this.children = [];
    }

    /**
     * Renders the masonry layout container with specified styles and gutter.
     * Initializes a Masonry instance on the created container.
     * @return {HTMLElement} The rendered HTML element containing the masonry layout.
     */
    render() {
        const container = document.createElement('div');
        container.classList.add(styles.masonryContainer);

        // Required for Masonry to know the width of one column
        const sizer = document.createElement('div');
        sizer.classList.add(styles.col1);
        container.appendChild(sizer);
        this.children.push(sizer);

        // Add gutter class if specified
        if (this.gutter && styles[this.gutter]) {
            container.classList.add(styles[this.gutter]);
        }

        // Instantiate Masonry
        this.masonryInstance = new Masonry(container, {
            itemSelector: `.${styles.masonryItem}`,
            columnWidth: `.${styles.col1}`,
            percentPosition: true,
            transitionDuration: 0,
        });

        this.element = container;
        return this.element;
    }

    /**
     * Adds a child element to the masonry container.
     * @param {HTMLElement|BaseComponent} child - The child element or component to add.
     * @param {Object} [options={}] - Optional parameters for the child.
     * @param {number} [options.colSpan=12] - The number of columns this child should span (1-12).
     * @return {MasonryContainer} - The MasonryContainer instance for chaining.
     */
    add(child, { colSpan = 12 } = {}) {
        if (!this.element) this.render();

        let childElement;
        if (child instanceof BaseComponent) {
            child.mount(this.element);
            childElement = child.element;
        } else if (child instanceof HTMLElement) {
            this.element.append(child);
            childElement = child;
        } else {
            throw new Error('Child must be an HTMLElement or BaseComponent');
        }

        childElement.classList.add(styles.masonryItem);

        if (colSpan) {
            if (colSpan < 1 || colSpan > 12) throw new Error('colSpan value must be between 1-12');
            childElement.classList.add(styles[`col${colSpan}`]);
        }

        this.children.push(childElement);
        setTimeout(() => {
            this.masonryInstance.appended(childElement);
            this.masonryInstance.layout();
        }, 0);

        return this;
    }
}
