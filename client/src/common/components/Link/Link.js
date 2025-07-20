import styles from './Link.module.css';
import BaseComponent from '@core/base/BaseComponent';
import { appInstance } from '@/main.js';
import { routes } from '@core/config/routes';

export default class Link extends BaseComponent {
    constructor({ text, routePath }) {
        super();

        this.text = text;
        this.routePath = routePath;
        this.route = this.#validateRoutePath(routePath);
    }

    render() {
        const link = document.createElement('a');
        link.textContent = this.text;
        link.classList.add(styles.link);
        link.setAttribute('href', this.routePath);
        link.addEventListener('click', (event) => {
            event.preventDefault();
            appInstance.router.navigate(this.routePath);
        });
        this.element = link;
        return this.element;
    }

    #validateRoutePath(routePath) {
        const route = routes.find((route) => route.path === routePath);
        if (route) return route;
        throw Error(`Invalid route path: ${routePath}`);
    }
}
