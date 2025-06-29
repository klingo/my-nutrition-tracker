import styles from './BasePage.module.css';

class BasePage {
    constructor(router = null) {
        this.router = router;
        this.element = null;
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

    // Helper method to create the page DOM element
    createPageElement(className = '') {
        const element = document.createElement('div');
        element.classList.add(styles.page);
        if (className) element.classList.add(className);
        return element;
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
