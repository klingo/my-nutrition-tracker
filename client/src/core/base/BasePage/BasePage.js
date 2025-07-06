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

    /**
     * Helper method to add a new row to the page.
     * @param {Object} [options={}] - Optional parameters for the row configuration.
     * @param {string} [options.justifyContent] - The justify-content CSS styling (optional).
     * @return {HTMLDivElement}
     */
    addRow({ justifyContent = '' } = {}) {
        const rowElement = document.createElement('div');
        rowElement.classList.add(styles.row);
        if (justifyContent) rowElement.style.justifyContent = justifyContent;
        this.element.append(rowElement);
        return rowElement;
    }

    /**
     * Helper method to add a new column to the row.
     * @param {Object} [options] - Optional parameters for the column configuration.
     * @param {HTMLDivElement} options.rowElement - The row element to which the column will be added
     * @param {number} [options.colSpan] - The span of the column (optional)
     * @param {number} [options.order] - The order of the column in the flex container (optional)
     * @return {HTMLDivElement}
     */
    addCol({ rowElement, colSpan, order }) {
        if (!(rowElement instanceof HTMLDivElement)) throw new Error('"rowElement" must be a valid HTMLDivElement');
        const colElement = document.createElement('div');
        colElement.classList.add(styles.col);
        if (colSpan) colElement.classList.add(styles[`col${colSpan}`]);
        if (order) colElement.style.order = order.toString();
        rowElement.append(colElement);
        return colElement;
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
