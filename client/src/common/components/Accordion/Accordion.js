import styles from './Accordion.module.css';
import iconStyles from '@styles/icons.module.css';
import BaseComponent from '@core/base/BaseComponent';
import { ExpandableContainer } from '@common/components';

/**
 * The Accordion class represents a collapsible and expandable UI component.
 * It allows appending children content, toggling between expanded and collapsed states,
 * and provides methods to control and manage its behavior programmatically.
 * The class must be rendered before performing any state-changing operations.
 * @class Accordion
 * @extends BaseComponent
 * @param {Object} options - Configuration options
 * @param {string} [options.title=''] - The displayed title text for the accordion
 * @param {boolean} [options.initiallyExpanded=false] - Whether the accordion starts expanded
 */
export default class Accordion extends BaseComponent {
    #header = null;
    #button = null;
    #content = null;

    constructor({ title = '', initiallyExpanded = false }) {
        super();

        this.title = title;
        this.initiallyExpanded = !!initiallyExpanded;
        this.expandableContainer = null;
    }

    /**
     * Renders the accordion component and returns the accordion element
     * @return {HTMLDivElement} The root element of the accordion component.
     */
    render() {
        this.element = document.createElement('div');
        this.element.classList.add(styles.accordion);

        this.#header = this.#createHeader();
        this.#button = this.#createButton();
        this.#header.append(this.#button);
        this.#content = this.#createContent();

        this.element.append(this.#header, this.#content);

        return this.element;
    }

    /**
     * Expands the accordion
     * @return {Accordion}
     */
    expand() {
        if (!this.expandableContainer) throw new Error('Accordion: Cannot expand content before render() is called');
        this.expandableContainer.expand();
        return this;
    }

    /**
     * Collapses the accordion
     * @return {Accordion}
     */
    collapse() {
        if (!this.expandableContainer) throw new Error('Accordion: Cannot collapse content before render() is called');
        this.expandableContainer.collapse();
        return this;
    }

    /**
     * Toggles the accordion
     * @return {Accordion}
     */
    toggle() {
        if (!this.expandableContainer) throw new Error('Accordion: Cannot toggle content before render() is called');
        this.expandableContainer.toggle();
        return this;
    }

    /**
     * Returns the current state of the expansion.
     */
    isExpanded() {
        return this.expandableContainer ? this.expandableContainer.isExpanded() : false;
    }

    /**
     * Appends children to the Accordion's content
     * @param children
     * @return {Accordion}
     */
    append(children) {
        if (!this.expandableContainer) throw new Error('Accordion: Cannot append content before render() is called');
        this.expandableContainer.append(children);
        return this;
    }

    /**
     * Creates and returns a header element with the appropriate styles applied.
     * @private
     * @return {HTMLDivElement} The created header element.
     */
    #createHeader() {
        const header = document.createElement('div');
        header.classList.add(styles.header);
        return header;
    }

    /**
     * Creates and returns a button element with specific attributes, child elements, and event listeners.
     * @private
     * @return {HTMLButtonElement} The constructed button element with associated child elements and click event handling.
     */
    #createButton() {
        const button = document.createElement('button');
        button.setAttribute('aria-expanded', this.initiallyExpanded.toString());

        const titleSpan = document.createElement('span');
        titleSpan.textContent = this.title;
        button.append(titleSpan);

        const icon = document.createElement('div');
        icon.classList.add(iconStyles.icon, iconStyles.chevronDown);
        button.append(icon);

        button.addEventListener('click', (event) => {
            event.preventDefault();
            this.expandableContainer.toggle();
        });
        return button;
    }

    /**
     * Creates and initializes the content of the component, including an expandable container.
     * Adds event listeners for changes within the expandable container to handle UI updates.
     * @private
     * @return {HTMLElement} The generated content element with all necessary configurations and event listeners applied.
     */
    #createContent() {
        const content = document.createElement('div');
        content.classList.add(styles.content);

        // Expandable Container
        this.expandableContainer = new ExpandableContainer(this.initiallyExpanded);
        this.expandableContainer.mount(content);

        this.expandableContainer.element.addEventListener('expandableContainerChange', (event) => {
            const isExpanded = event.detail.isExpanded;

            this.#button.setAttribute('aria-expanded', isExpanded.toString());

            this.#notifyChange(isExpanded);
        });

        return content;
    }

    /**
     * Dispatches a custom "accordionChange" event when the accordion state changes
     * @private
     * @param {boolean} isExpanded - A boolean indicating whether the accordion is expanded.
     */
    #notifyChange(isExpanded) {
        if (this.element) {
            this.element.dispatchEvent(
                new CustomEvent('accordionChange', {
                    detail: { isExpanded },
                    bubbles: true,
                }),
            );
        }
    }
}
