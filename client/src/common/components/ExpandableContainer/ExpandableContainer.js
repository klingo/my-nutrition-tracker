import styles from './ExpandableContainer.module.css';
import BaseComponent from '@core/base/BaseComponent';

/**
 * A component for creating an expandable/collapsible container with transition effects.
 * This class extends the BaseComponent and provides methods to manage a container
 * element that can be expanded or collapsed with animations.
 * @class ExpandableContainer
 * @extends BaseComponent
 * @param {Object} options - Configuration options
 * @param {boolean} [options.initiallyExpanded=false] - Whether the expandable container starts expanded
 */
class ExpandableContainer extends BaseComponent {
    #isTransitioning = false;
    #isExpanded = false;
    #mutationObserver = null;

    constructor(initiallyExpanded = false) {
        super();

        this.initiallyExpanded = !!initiallyExpanded;
    }

    /**
     * Renders the ExpandableContainer and returns the container element
     * @return {HTMLDivElement} The root element of the expandable container component
     */
    render() {
        this.element = document.createElement('div');
        this.element.classList.add(styles.expandableContainer);
        this.element.setAttribute('role', 'region');

        this.#initMutationObserver();

        if (this.initiallyExpanded) this.#initialExpand();

        return this.element;
    }

    /**
     * Special method for initial expansion when initiallyExpanded=true
     * This bypasses the animation and directly sets the expanded state
     * @private
     */
    #initialExpand() {
        this.element.classList.add(styles.expanded);
        this.element.style.height = 'auto';
        this.element.removeAttribute('aria-hidden');
        this.#isExpanded = true;

        this.#notifyChange(true);
    }

    /**
     * Initializes a MutationObserver to watch for changes in the container's content
     * that might affect its height
     * @private
     */
    #initMutationObserver() {
        // Disconnect any existing observer
        if (this.#mutationObserver) {
            this.#mutationObserver.disconnect();
        }

        // Create a new observer that watches for changes to subtree and attributes
        this.#mutationObserver = new MutationObserver(() => {
            // Only recalculate height if the container is expanded
            if (this.#isExpanded && !this.#isTransitioning) {
                this.recalculateHeight();
            }
        });

        // Start observing once the element is available
        if (this.element) {
            this.#mutationObserver.observe(this.element, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
            });
        }
    }

    /**
     * Handles transition end event
     */
    #handleTransitionEnd(isExpanded) {
        if (isExpanded) {
            // When expanded, set height to auto to allow dynamic content changes
            this.element.style.height = 'auto';
            this.element.style.display = '';
        } else {
            // When collapsed, keep display visible but height at 0
            this.element.style.height = '0';
        }
        this.#isTransitioning = false;
        this.#isExpanded = isExpanded;
    }

    /**
     * Forces a reflow of the DOM for the associated element. A reflow is triggered
     * by accessing the `offsetHeight` property of the element, which ensures that any
     * pending DOM changes are applied and rendered.
     */
    #forceReflow() {
        this.element.offsetHeight;
    }

    /**
     * Recalculates and updates the height of the container based on its content
     * This can be called externally when content changes dynamically
     * @return {ExpandableContainer}
     */
    recalculateHeight() {
        if (!this.#isExpanded || this.#isTransitioning || !this.element) return this;

        // Temporarily set height to auto to get the actual content height
        const currentHeight = this.element.style.height;
        this.element.style.height = 'auto';
        const contentHeight = this.element.scrollHeight;

        // Only update if there's a difference to avoid unnecessary reflows
        if (currentHeight !== 'auto' && parseInt(currentHeight) !== contentHeight) {
            // Set back to the current height before animating to the new height
            this.element.style.height = currentHeight;

            // Force reflow
            this.#forceReflow();

            // Update to the new height
            this.element.style.height = `${contentHeight}px`;

            // After transition completes, set back to auto
            const onTransitionEnd = () => {
                this.element.style.height = 'auto';
                this.element.removeEventListener('transitionend', onTransitionEnd);
            };

            this.element.addEventListener('transitionend', onTransitionEnd, { once: true });
        }

        return this;
    }

    /**
     * Collapses the container
     * @return {ExpandableContainer}
     */
    collapse() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;

        // First set a specific height (instead of auto) to enable transitions
        this.element.style.height = `${this.element.scrollHeight}px`;

        this.#forceReflow();

        this.#notifyChange(false);

        // Now set the height to 0 to trigger the transition
        this.element.style.height = '0';
        this.element.classList.remove(styles.expanded);
        this.element.setAttribute('aria-hidden', 'true');
        this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(false), { once: true });

        return this;
    }

    /**
     * Expands the container
     * @return {ExpandableContainer}
     */
    expand() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;

        // Ensure the element is visible but start with height 0
        this.element.style.display = '';
        this.element.style.height = '0';

        this.#forceReflow();
        this.#notifyChange(true);

        // Get the current scroll height to set as the target height
        const targetHeight = this.element.scrollHeight;
        this.element.style.height = `${targetHeight}px`;
        this.element.classList.add(styles.expanded);
        this.element.removeAttribute('aria-hidden');
        this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(true), { once: true });

        return this;
    }

    /**
     * Toggles the container
     * @return {ExpandableContainer}
     */
    toggle() {
        return this.#isExpanded ? this.collapse() : this.expand();
    }

    /**
     * Returns the current state of the expansion.
     */
    isExpanded() {
        return this.#isExpanded;
    }

    /**
     * Appends children to the container
     * @param children
     * @return {ExpandableContainer}
     */
    append(children) {
        if (!this.element) throw new Error('ExpandableContainer: Cannot append content before render() is called');
        this.element.append(children);
        return this;
    }

    /**
     * Dispatches a custom "expandableContainerChange" event when the expandableContainer state changes
     * @private
     * @param {boolean} isExpanded - A boolean indicating whether the container is expanded.
     */
    #notifyChange(isExpanded) {
        if (this.element) {
            this.element.dispatchEvent(
                new CustomEvent('expandableContainerChange', {
                    detail: { isExpanded },
                    bubbles: true,
                }),
            );
        }
    }

    /**
     * Cleans up resources when the component is destroyed
     * This method should be called when the component is removed from the DOM
     */
    unmount() {
        if (this.#mutationObserver) {
            this.#mutationObserver.disconnect();
            this.#mutationObserver = null;
        }
    }
}

export default ExpandableContainer;
