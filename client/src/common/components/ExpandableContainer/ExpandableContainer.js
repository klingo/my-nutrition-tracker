import styles from './ExpandableContainer.module.css';
import BaseComponent from '@core/base/BaseComponent';

class ExpandableContainer extends BaseComponent {
    #slideInCallback = null;
    #isTransitioning = false;

    constructor(initiallyExpanded = false) {
        super();

        this.initiallyExpanded = initiallyExpanded;
    }

    /**
     * Renders the ExpandableContainer and returns the container element
     * @return {HTMLDivElement}
     */
    render() {
        const container = document.createElement('div');
        container.classList.add(styles.expandableContainer);
        container.setAttribute('role', 'region');

        if (this.initiallyExpanded) {
            container.classList.add(styles.expanded);
            container.style.height = 'auto';
        } else {
            container.setAttribute('aria-hidden', 'true');
            container.style.display = 'none';
        }

        this.element = container;
        return this.element;
    }

    /**
     * Handles transition end event
     */
    #handleTransitionEnd() {
        if (this.element.getAttribute('aria-hidden') === 'true') {
            this.element.style.display = 'none';
        } else {
            this.element.style.height = 'auto';
        }
        this.#isTransitioning = false;
    }

    /**
     * Forces reflow
     * @param element
     * @return {number|number|number|*}
     */
    #forceReflow(element) {
        return element.offsetHeight;
    }

    /**
     * Slides out the container
     * @return {ExpandableContainer}
     */
    slideOut() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;

        this.element.style.height = `${this.element.scrollHeight}px`;
        this.#forceReflow(this.element);

        requestAnimationFrame(() => {
            this.element.style.height = '0';
            this.element.classList.remove(styles.expanded);
            this.element.setAttribute('aria-hidden', 'true');
            this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(), { once: true });
        });

        return this;
    }

    /**
     * Slides in the container
     * @return {ExpandableContainer}
     */
    slideIn() {
        if (this.#isTransitioning) return this;
        this.#isTransitioning = true;

        this.element.style.display = '';
        this.element.style.height = '0';

        requestAnimationFrame(() => {
            this.element.style.height = `${this.element.scrollHeight}px`;
            this.element.classList.add(styles.expanded);
            this.element.removeAttribute('aria-hidden');

            this.element.addEventListener('transitionend', () => this.#handleTransitionEnd(), { once: true });
            if (this.#slideInCallback) this.#slideInCallback();
        });

        return this;
    }

    /**
     * Toggles the container
     * @return {ExpandableContainer}
     */
    toggle() {
        const isCollapsed = this.element.getAttribute('aria-hidden') === 'true';
        return isCollapsed ? this.slideIn() : this.slideOut();
    }

    /**
     * Appends children to the container
     * @param children
     * @return {ExpandableContainer}
     */
    append(...children) {
        this.element.append(...children);
        return this;
    }

    /**
     * Adds a callback to be called when the container slides in
     * @param callback
     * @return {ExpandableContainer}
     */
    addSlideInCallback(callback) {
        if (typeof callback === 'function') {
            this.#slideInCallback = callback;
        }
        return this;
    }

    /**
     * Removes the slide-in callback
     * @return {ExpandableContainer}
     */
    removeSlideInCallback() {
        this.#slideInCallback = null;
        return this;
    }
}

export default ExpandableContainer;
