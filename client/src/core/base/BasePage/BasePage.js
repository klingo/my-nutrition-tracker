import styles from './BasePage.module.css';

class BasePage {
    constructor(router = null, signal = null) {
        this.router = router;
        this.element = null;
        this.abortSignal = signal;
    }

    // Override this method in child classes
    async render() {
        throw new Error('render() method must be implemented');
    }

    // Override this method for page-specific initialization
    mount() {
        // Called after the page is added to the DOM
    }

    // Override this method for cleanup
    unmount() {
        // Called before the page is removed from the DOM
    }

    /**
     * Helper method to create the page DOM element.
     * @param {Object} [options={}] - Optional parameters for page configuration.
     * @param {string} [options.pageHeading] - The page heading to be added (optional).
     * @param {string} [options.className] - The class name to be added to the page (optional).
     * @return {HTMLDivElement}
     */
    createPageElement({ pageHeading = '', className = '' } = {}) {
        this.element = document.createElement('div');
        this.element.classList.add(styles.page);
        if (pageHeading) {
            const heading = document.createElement('h1');
            heading.textContent = pageHeading;
            this.element.append(heading);
        }
        if (className) this.element.classList.add(className);
        return this.element;
    }

    // Helper method to create DOM elements with optional classes and styles
    createElement(tag, className = '', styles = {}) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        Object.assign(element.style, styles);
        return element;
    }
}

export default BasePage;
