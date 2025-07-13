import styles from './BasePage.module.css';
import { Loader, MessageBox } from '@common/components';

class BasePage {
    #state = {};
    #pendingState = null;
    #isMounted = false;
    #updateCallbacks = new Set();
    #updatePromise = null;

    constructor(router = null, signal = null) {
        this.router = router;
        this.element = null;
        this.abortSignal = signal;
        this.pageTitle = this.pageTitle || '';

        // Set default state
        this.setState({
            loading: false,
            error: null,
        });
    }

    /**
     * Applies the pending state update to the component, updates the internal state,
     * and triggers a re-render if the component is mounted.
     * @return {Promise<void>} Resolves once the state has been applied and any necessary rendering is complete.
     */
    async #applyStateUpdate() {
        if (!this.#pendingState) {
            this.#updatePromise = null;
            return;
        }

        // Apply the pending state
        this.#state = this.#pendingState;
        this.#pendingState = null;
        this.#updatePromise = null;

        // Call callbacks in all cases, not just when mounted
        this.#callUpdateCallbacks();

        // Trigger re-render if mounted
        if (this.#isMounted) {
            try {
                await this.render();
            } catch (error) {
                console.error('Error during render after state update:', error);
            }
        }
    }

    /**
     * Calls all registered update callbacks and clears the list.
     */
    #callUpdateCallbacks() {
        const callbacks = Array.from(this.#updateCallbacks);
        this.#updateCallbacks.clear();

        callbacks.forEach((callback) => {
            try {
                callback();
            } catch (error) {
                console.error('Error in state update callback:', error);
            }
        });
    }

    /**
     * Renders the component based on its current state. It creates or clears the element, handles loading and error states,
     * and attempts to render specific page content.
     * @return {HTMLElement} The rendered HTML element representing the component.
     * @protected
     */
    render = async () => {
        const state = this.getState();

        // Create the element if it doesn't exist
        if (!this.element) {
            this.element = this.createPageElement({ pageHeading: this.pageTitle });
        } else {
            this.clearContent();
        }

        // Handle loading state
        if (state.loading) {
            this.renderLoading();
            return this.element;
        }

        // Handle error state
        if (state.error) {
            this.renderError(state.error);
            return this.element;
        }

        // Render page specific content
        try {
            await this.renderContent();
        } catch (error) {
            console.error('Error rendering page content:', error);
            this.renderError(error);
        }

        return this.element;
    };

    /**
     * Updates the component's state with new values and schedules a re-render.
     * @param {Object|Function} update - An object containing state changes or a function that takes the current state as an argument and returns an object of state changes.
     * @param {Function} [callback] - A callback function to be executed after the component has re-rendered with the updated state.
     * @protected
     */
    setState = (update, callback) => {
        // Get current state (either pending or committed)
        const currentState = this.#pendingState || this.#state;

        // Calculate next state
        const nextState =
            typeof update === 'function'
                ? { ...currentState, ...update(currentState) }
                : { ...currentState, ...update };

        // Set as pending state
        this.#pendingState = nextState;

        // Add callback if provided
        if (typeof callback === 'function') this.#updateCallbacks.add(callback);

        // Batch updates
        if (!this.#updatePromise) {
            this.#updatePromise = Promise.resolve().then(() => {
                this.#applyStateUpdate();
            });
        }
    };

    /**
     * Returns a copy of the current state or pending state.
     * @return {Object} A deep copy of the current state or the pending state if it exists.
     * @protected
     */
    getState = () => {
        return { ...(this.#pendingState || this.#state) };
    };

    /**
     * Mounts the component to a specified parent element.
     * @param {HTMLElement} parent - The DOM element to which the component will be appended.
     * @protected
     */
    mount = async (parent) => {
        if (this.element && this.element.parentNode) {
            this.unmount();
        }

        if (!this.element) {
            await this.render();
        }

        parent.appendChild(this.element);
        this.componentDidMount();
    };

    /**
     * Removes the component's element from its parent node in the DOM and calls componentWillUnmount lifecycle method.
     * @protected
     */
    unmount = () => {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.componentWillUnmount();
    };

    /**
     * Sets the title of the page and updates the content of the heading element within the component.
     * @param {string} title - The new title to be set for the page.
     * @return {BasePage} The current instance to allow method chaining.
     * @protected
     */
    setPageTitle = (title) => {
        this.pageTitle = title;
        const heading = this.element?.querySelector(`.${styles.heading}`);
        if (heading) {
            heading.textContent = title;
        } else if (this.element) {
            const newHeading = document.createElement('h1');
            newHeading.textContent = title;
            newHeading.classList.add(styles.heading);
            this.element.prepend(newHeading);
        }
        return this;
    };

    /**
     * Clears the content of the element, retaining only the heading if it exists.
     * @return {BasePage} The current instance to allow method chaining.
     * @protected
     */
    clearContent = () => {
        if (!this.element) return this;

        const heading = this.element.querySelector(`.${styles.heading}`);
        if (heading) {
            while (this.element.lastChild !== heading) {
                this.element.removeChild(this.element.lastChild);
            }
        } else {
            this.element.innerHTML = '';
        }
        return this;
    };

    /**
     * Renders a loading indicator within the element associated with the instance.
     * If no element is set, the method returns the current instance without making any changes.
     * @return {BasePage} The current instance to allow method chaining.
     * @protected
     */
    renderLoading = () => {
        if (!this.element) return this;
        this.clearContent();
        const loader = new Loader({ size: 'large', centered: true });
        loader.mount(this.element);
        return this;
    };

    /**
     * Renders an error message within the component's element.
     * @param {Error|string} error - The error object or string containing the error message to be displayed.
     * @return {BasePage} The current instance to allow method chaining.
     * @protected
     */
    renderError = (error) => {
        if (!this.element) return this;
        this.clearContent();
        const messageBox = new MessageBox({ type: 'error', message: error?.message || 'An error occurred' });
        messageBox.mount(this.element);
        return this;
    };

    /**
     * Helper method to create the page DOM element.
     * @param {Object} [options={}] - Optional parameters for page configuration.
     * @param {string} [options.pageHeading] - The page heading to be added (optional).
     * @param {string} [options.className] - The class name to be added to the page (optional).
     * @return {HTMLDivElement}
     * @protected
     */
    createPageElement = ({ pageHeading = '', className = '' } = {}) => {
        this.element = document.createElement('div');
        this.element.classList.add(styles.page);

        if (pageHeading) {
            const heading = document.createElement('h1');
            heading.textContent = pageHeading;
            heading.classList.add(styles.heading);
            this.element.appendChild(heading);
        }

        if (className) this.element.classList.add(className);

        return this.element;
    };

    /**
     * Lifecycle method invoked immediately after a component is mounted (inserted into the tree).
     * Sets #isMounted to true indicating that the component has been successfully mounted.
     */
    componentDidMount() {
        this.#isMounted = true;
    }

    /**
     * Lifecycle method invoked immediately before a component is removed from the tree.
     * Sets #isMounted to false indicating that the component is about to be unmounted.
     */
    componentWillUnmount() {
        this.#isMounted = false;
        this.#updateCallbacks.clear();
        this.#pendingState = null;
        this.#updatePromise = null;
    }

    /**
     * Renders the content of a component or module. This method is intended to be overridden by child classes to provide specific rendering logic.
     */
    renderContent() {
        throw new Error('renderContent() must be implemented by child class');
    }

    /**
     * Creates a new DOM element with the specified tag and optional configurations.
     * @param {string} tag - The HTML tag name for the new element.
     * @param {Object} [config={}] - An object containing optional configurations for the new element.
     * @param {string} [config.className] - The class name to be added to the element (optional).
     * @param {Object} [config.styles] - The styles to be applied to the element (optional).
     * @param {Object} [config.attributes] - The attributes to be added to the element (optional).
     * @param {string} [config.textContent] - The text content to be added to the element (optional).
     * @return {HTMLElement} - The newly created element with applied configurations.
     */
    createElement(tag, { className = '', styles = {}, attributes = {}, textContent = '' } = {}) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        Object.assign(element.style, styles);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (textContent) element.textContent = textContent;
        return element;
    }
}

export default BasePage;
