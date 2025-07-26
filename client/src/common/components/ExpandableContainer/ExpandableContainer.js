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

        if (this.initiallyExpanded) this.expand();

        return this.element;
    }

    /**
     * Handles transition end event
     */
    #handleTransitionEnd(isExpanded) {
        this.element.style.display = isExpanded ? 'auto' : 'none';
        this.#isTransitioning = false;
        this.#isExpanded = isExpanded;
    }

    /**
     * Collapses the container
     * @return {ExpandableContainer}
     */
    collapse() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;
        this.element.style.height = `${this.element.scrollHeight}px`;

        this.#notifyChange(false);
        requestAnimationFrame(() => {
            this.element.style.height = '0';
            this.element.classList.remove(styles.expanded);
            this.element.setAttribute('aria-hidden', 'true');
            this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(false), { once: true });
        });

        return this;
    }

    /**
     * Expands the container
     * @return {ExpandableContainer}
     */
    expand() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;

        this.element.style.display = '';
        this.element.style.height = '0';

        this.#notifyChange(true);
        requestAnimationFrame(() => {
            this.element.style.height = `${this.element.scrollHeight}px`;
            this.element.classList.add(styles.expanded);
            this.element.removeAttribute('aria-hidden');
            this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(true), { once: true });
        });

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
}

export default ExpandableContainer;
