import styles from './Navigation.module.css';
import BaseComponent from '@core/base/BaseComponent';
import authService from '@common/services/AuthService.js';
import { defaultUnauthenticatedRoute } from '@core/config/routes.js';
import { appInstance } from '@/main.js';

/**
 * The Navigation class extends BaseComponent and is responsible for rendering and managing the navigation menu.
 * It dynamically updates based on the user's authentication status, displaying appropriate links and functionality such as login,
 * logout, profile access, and various sections of the application. The class handles both rendering the initial state and updating
 * the active state of the navigation items as the user navigates through different parts of the app.
 */
class Navigation extends BaseComponent {
    constructor() {
        super();

        this.element = document.getElementById('nav');
    }

    /**
     * Renders the navigation menu based on the authentication status.
     * @return {HTMLElement} - The rendered navigation element.
     */
    async render() {
        const isAuthenticated = await authService.isAuthenticated();
        const currentPath = window.location.pathname || '/';

        this.element.innerHTML = '';
        this.element.classList.add(styles.nav);

        const ul = document.createElement('ul');
        this.element.append(ul);

        if (isAuthenticated) {
            ul.append(this.createNavItem('Overview', '/overview', currentPath));
            ul.append(this.createNavItem('Log Intake', '/log-intake', currentPath));
            ul.append(this.createNavItem('Products', '/products', currentPath));

            ul.append(this.createSpacer());

            ul.append(this.createNavItem('Profile', '/profile', currentPath, styles.profile));
            ul.append(this.createLogoutButton());
        } else {
            ul.append(this.createNavItem('Login', '/login', currentPath));
            ul.append(this.createNavItem('Register', '/register', currentPath));
        }

        return this.element;
    }

    /**
     * Creates a navigation item for a menu.
     * @param {string} text - The display text of the navigation item.
     * @param {string} path - The path associated with the navigation item, used for navigation purposes.
     * @param {string} currentPath - The current active path to determine if this item should be marked as active.
     * @param {string} [iconStyle=''] - Optional CSS class for styling an icon within the navigation item.
     * @return {HTMLLIElement} A list item element representing the navigation item.
     */
    createNavItem(text, path, currentPath, iconStyle = '') {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        if (iconStyle) {
            a.title = text;
            const icon = document.createElement('div');
            icon.classList.add(styles.icon, iconStyle);
            a.append(icon);
        } else {
            a.textContent = text;
        }
        a.setAttribute('data-navigate', path);

        if (currentPath && (currentPath === path || (path !== '/' && currentPath.startsWith(`${path}/`)))) {
            li.classList.add(styles.active);
        }

        li.append(a);
        return li;
    }

    /**
     * Creates a spacer element with the class 'spacer'.
     * @return {HTMLDivElement} A new div element styled as a spacer.
     */
    createSpacer() {
        const element = document.createElement('div');
        element.classList.add(styles.spacer);
        return element;
    }

    /**
     * Creates a logout button element wrapped in an <li> tag.
     * The button includes an icon and triggers the logout process when clicked.
     * After logging out, it re-renders the navigation and navigates to the default unauthenticated route.
     * @return {HTMLLIElement} A list item element containing the configured logout button.
     */
    createLogoutButton() {
        const li = document.createElement('li');
        const button = document.createElement('button');
        const icon = document.createElement('div');

        icon.classList.add(styles.icon, styles.logout);

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Logout');
        button.setAttribute('title', 'Logout');
        button.append(icon);
        button.addEventListener('click', async () => {
            await authService.logout();
            if (appInstance) {
                await appInstance.renderNavigation();
            }
            if (appInstance?.router) {
                appInstance.router.navigate(defaultUnauthenticatedRoute);
            }
        });

        li.append(button);
        return li;
    }

    /**
     * Updates the active state of navigation items based on the current path.
     * @param {string} currentPath - The current URL path used to determine which navigation item should be marked as active.
     */
    updateActiveState(currentPath) {
        // Remove active class from all items first
        this.element.querySelectorAll(`.${styles.active}`).forEach((item) => {
            item.classList.remove(styles.active);
        });

        // Find and activate the matching nav item
        const navItems = Array.from(this.element.querySelectorAll('[data-navigate]'));
        navItems.forEach((link) => {
            const navPath = link.getAttribute('data-navigate');
            if (navPath && (currentPath === navPath || (navPath !== '/' && currentPath.startsWith(`${navPath}/`)))) {
                link.parentElement.classList.add(styles.active);
            }
        });
    }
}

export default Navigation;
