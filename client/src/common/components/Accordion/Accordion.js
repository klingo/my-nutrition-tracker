import styles from './Accordion.module.css';
import iconStyles from '@styles/icons.module.css';
import BaseComponent from '@core/base/BaseComponent/index.js';
import { ExpandableContainer } from '@common/components/index.js';

export default class Accordion extends BaseComponent {
    constructor({ title = '', initiallyExpanded = false }) {
        super();

        this.title = title;
        this.initiallyExpanded = initiallyExpanded;
        this.expandableContainer = null;
    }

    render() {
        this.element = this.#createAccordion(this.title);
        return this.element;
    }

    append(children) {
        this.expandableContainer.append(children);
    }

    #createAccordion(title) {
        const element = document.createElement('div');
        element.classList.add(styles.accordion);

        // Header
        const header = document.createElement('div');
        header.classList.add(styles.header);

        // Button
        const button = document.createElement('button');
        button.setAttribute('aria-expanded', this.initiallyExpanded ? 'true' : 'false');

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        button.append(titleSpan);

        const icon = document.createElement('div');
        icon.classList.add(iconStyles.icon, iconStyles.chevronDown);
        button.append(icon);

        button.addEventListener('click', (event) => {
            event.preventDefault();

            if (button.getAttribute('aria-expanded') === 'true') {
                button.setAttribute('aria-expanded', 'false');
            } else {
                button.setAttribute('aria-expanded', 'true');
            }
            this.expandableContainer.toggle();
        });
        header.append(button);

        // Content
        const content = document.createElement('div');
        content.classList.add(styles.content);

        // Expandable Container
        this.expandableContainer = new ExpandableContainer(this.initiallyExpanded);
        this.expandableContainer.mount(content);

        // Assemble
        element.append(header, content);
        return element;
    }
}
