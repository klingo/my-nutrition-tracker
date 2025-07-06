import styles from './Navigation.module.css';
import authService from '@common/services/AuthService.js';
import { defaultUnauthenticatedRoute } from '@core/config/routes.js';
import { appInstance } from '@/main.js';

class Navigation {
    constructor() {
        this.element = document.getElementById('nav');
    }

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
        }

        return this.element;
    }

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

        if (currentPath === path) li.classList.add(styles.active);

        li.append(a);
        return li;
    }

    createSpacer() {
        const element = document.createElement('div');
        element.classList.add(styles.spacer);
        return element;
    }

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

    updateActiveState(currentPath) {
        this.element.querySelectorAll(`.${styles.active}`).forEach((item) => {
            item.classList.remove(styles.active);
        });
        const activeItem = this.element.querySelector(`[data-navigate="${currentPath}"]`);
        if (activeItem) activeItem.parentElement.classList.add(styles.active);
    }
}

export default Navigation;
