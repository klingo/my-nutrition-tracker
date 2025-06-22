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

    // Helper method to create DOM elements
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    }
}

export default BasePage;
