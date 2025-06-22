import Router from './Router.js';
import LoginPage from '@/pages/LoginPage.js';
import OverviewPage from '@/pages/OverviewPage.js';
import NotFoundPage from '@/pages/NotFoundPage.js';
import Navigation from '@/components/ui/Navigation/Navigation.js';

class Spa {
    constructor() {
        this.spaContainer = document.getElementById('spa');
        this.navContainer = document.getElementById('nav');
        this.router = new Router();
        this.navigation = new Navigation();
    }

    async init() {
        await this.renderNavigation();
        this.setupRoutes();
        this.setupNavigation();
        this.router.init();
    }

    async renderNavigation() {
        if (this.navContainer) {
            this.navContainer.innerHTML = '';
            const navElement = await this.navigation.render();
            this.navContainer.appendChild(navElement);
        }
    }

    async refreshNavigation() {
        await this.renderNavigation();
    }

    setupRoutes() {
        this.router.addRoute('/', () => this.renderPage(OverviewPage));
        this.router.addRoute('/login', () => this.renderPage(LoginPage));
        this.router.addRoute('/overview', () => this.renderPage(OverviewPage));
        this.router.addRoute('/404', () => this.renderPage(NotFoundPage));
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-navigate');
                this.router.navigate(path);
            }
        });
    }

    async renderPage(PageClass) {
        try {
            this.spaContainer.innerHTML = '';
            const page = new PageClass(this.router);
            const content = await page.render();
            this.spaContainer.appendChild(content);
            if (page.mount) page.mount();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.spaContainer.innerHTML = '<div class="error">Something went wrong</div>';
        }
    }
}

let spaInstance;

document.addEventListener('DOMContentLoaded', async () => {
    spaInstance = new Spa();
    await spaInstance.init();
});

export { spaInstance };
