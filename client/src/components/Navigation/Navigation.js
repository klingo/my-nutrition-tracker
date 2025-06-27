import styles from './Navigation.module.css';
import authService from '@/services/AuthService.js';
import { spaInstance } from '@/core/Spa.js';

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

            ul.append(this.createLogoutBtn());
        } else {
            ul.append(this.createNavItem('Login', '/login', currentPath));
        }

        return this.element;
    }

    createNavItem(text, path, currentPath) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        a.setAttribute('data-navigate', path);

        if (currentPath === path) li.classList.add(styles.active);

        li.append(a);
        return li;
    }

    createLogoutBtn() {
        const li = document.createElement('li');
        const button = document.createElement('button');
        const icon = document.createElement('div');

        li.classList.add(styles.logout);

        icon.classList.add(styles.logoutIcon);

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Logout');
        button.setAttribute('title', 'Logout');
        button.append(icon);
        button.addEventListener('click', async () => {
            authService.logout();
            if (spaInstance) {
                await spaInstance.renderNavigation();
            }
            if (spaInstance?.router) {
                spaInstance.router.navigate('/login');
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
