class BaseComponent {
    constructor() {
        this.element = null;
    }

    /**
     * This method should be overridden in child classes to define how the component is rendered.
     * @return {HTMLElement}
     */
    render() {
        throw new Error('render() method must be implemented');
    }

    /**
     * Mounts the component to a parent element. Renders the component if not already done.
     * This method can be overridden in child classes for additional setup.
     * @param {HTMLElement} parent - The parent element to append this component to.
     * @return {BaseComponent}
     */
    mount(parent) {
        if (!this.element) {
            this.render();
        }
        parent.append(this.element);
        return this;
    }

    /**
     * Unmounts the component from its current position in the DOM and performs the necessary cleanup.
     * This method can be overridden in child classes for additional cleanup.
     */
    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        // Additional cleanup logic can be added here
    }
}

export default BaseComponent;
