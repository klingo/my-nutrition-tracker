import styles from './MasonryContainer.module.css';
import BaseComponent from '@core/base/BaseComponent';
import Masonry from 'masonry-layout';

/**
 * Represents a masonry container for content blocks.
 * Provides a flexible layout where blocks can flow naturally to the next row.
 * Supports both fixed-width elements and column-span based layouts.
 *
 * Usage examples:
 *
 * 1. Using column spans:
 * ```javascript
 * const container = new MasonryContainer();
 * container.add(element, { colSpan: 3 }); // Element will span 3 columns (25% width)
 * ```
 *
 * 2. Using fixed-width elements:
 * ```javascript
 * const container = new MasonryContainer({ layoutMode: 'fixedWidth' });
 * container.add(element, { fixedWidth: 300 }); // Element will have a fixed width of 300px
 * ```
 *
 * The masonry-layout library automatically handles the layout of fixed-width elements,
 * placing them optimally based on available space.
 *
 * @class MasonryContainer
 */
export default class MasonryContainer extends BaseComponent {
    /**
     * Creates a new MasonryContainer instance.
     * @param {Object} [options={}] - Optional parameters for the masonry container.
     * @param {string} [options.gutter='g-3'] - The gutter size between blocks (g-0 to g-5).
     * @param {string} [options.layoutMode='colSpan'] - The layout mode to use ('colSpan' or 'fixedWidth').
     */
    constructor({ gutter = 'g-3', layoutMode = 'colSpan' } = {}) {
        super();
        this.gutter = gutter;
        this.layoutMode = layoutMode;
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

        // Get the gutter size from CSS
        const gutterSize = parseInt(getComputedStyle(container).getPropertyValue('--grid-gutter') || '16', 10);

        // Configure Masonry options
        let masonryOptions;

        if (this.layoutMode === 'fixedWidth') {
            // Fixed width mode - use pixel values
            masonryOptions = {
                itemSelector: `.${styles.masonryItem}`,
                // columnWidth: gutterSize,
                percentPosition: false,
                gutter: gutterSize,
                transitionDuration: 200,
            };
        } else {
            // Column span mode (default) - use percentage-based layout
            masonryOptions = {
                itemSelector: `.${styles.masonryItem}`,
                columnWidth: `.${styles.col1}`,
                percentPosition: true,
                transitionDuration: 200,
            };
        }

        // Instantiate Masonry
        this.masonryInstance = new Masonry(container, masonryOptions);

        this.element = container;
        return this.element;
    }

    /**
     * Adds a child element to the masonry container.
     * @param {HTMLElement|BaseComponent} child - The child element or component to add.
     * @param {Object} [options={}] - Optional parameters for the child.
     * @param {number} [options.colSpan=12] - The number of columns this child should span (1-12).
     * @param {number} [options.fixedWidth] - Fixed width in pixels. Only used in fixedWidth layout mode.
     * @return {MasonryContainer} - The MasonryContainer instance for chaining.
     */
    add(child, { colSpan = 12, fixedWidth } = {}) {
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

        // Validate colSpan
        if (colSpan < 1 || colSpan > 12) {
            throw new Error('colSpan value must be between 1-12');
        }

        if (this.layoutMode === 'fixedWidth') {
            // In fixed width mode
            if (fixedWidth) {
                // Use fixed width if provided
                childElement.style.width = `${fixedWidth}px`;
            } else {
                // Otherwise use colSpan to calculate percentage width
                const percentage = (colSpan / 12) * 100;
                childElement.style.width = `${percentage}%`;
            }
        } else {
            // In colSpan mode (default)
            childElement.classList.add(styles[`col${colSpan}`]);

            // Ignore fixedWidth in colSpan mode
            if (fixedWidth) {
                console.warn('fixedWidth parameter is ignored in colSpan layout mode');
            }
        }

        this.children.push(childElement);
        setTimeout(() => {
            // Check if masonryInstance still exists before accessing its methods
            if (this.masonryInstance) {
                this.masonryInstance.appended(childElement);
                this.masonryInstance.layout();
            }
        }, 0);

        return this;
    }

    /**
     * Triggers the layout mechanism of the masonry instance, if it exists.
     * This ensures that the items are properly arranged according to the
     * Masonry layout algorithm.
     */
    layout() {
        if (this.masonryInstance) {
            this.masonryInstance.layout();
        }
    }

    /**
     * Removes a child element from the masonry container.
     * @param {HTMLElement|BaseComponent} child - The child element or component to remove.
     * @return {MasonryContainer} - The MasonryContainer instance for chaining.
     */
    remove(child) {
        if (!this.element) return this;

        let childElement;
        if (child instanceof BaseComponent) {
            childElement = child.element;
        } else if (child instanceof HTMLElement) {
            childElement = child;
        } else {
            throw new Error('Child must be an HTMLElement or BaseComponent');
        }

        // Remove the element from the children array
        const index = this.children.indexOf(childElement);
        if (index !== -1) {
            this.children.splice(index, 1);
        }

        // Remove the element from the DOM and from Masonry
        if (childElement.parentNode === this.element) {
            this.masonryInstance.remove(childElement);
            this.element.removeChild(childElement);
            this.masonryInstance.layout();
        }

        return this;
    }

    /**
     * Cleans up all resources used by the MasonryContainer.
     * Destroys the Masonry instance and removes the element from the DOM.
     */
    destroy() {
        // Destroy the Masonry instance if it exists
        if (this.masonryInstance) {
            this.masonryInstance.destroy();
            this.masonryInstance = null;
        }

        // Clear the children array
        this.children = [];

        // Remove the element from the DOM if it exists
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
