import Router from './Router.js';
import LoginPage from '@pages/LoginPage/LoginPage.js';
import OverviewPage from '@pages/OverviewPage.js';
import NotFoundPage from '@pages/NotFoundPage.js';
import Navigation from '@components/Navigation/Navigation.js';
import ProductsPage from '@pages/ProductsPage.js';

class App {
    constructor() {
        this.headerContainer = document.getElementById('header');
        this.navContainer = document.getElementById('nav');
        this.mainContainer = document.getElementById('main');
        this.footerContainer = document.getElementById('footer');
        this.navigation = new Navigation();
        this.router = new Router(this.navigation);
    }

    async init() {
        await this.renderNavigation();
        this.setupRoutes();
        this.setupNavigation();
        this.router.init();
    }

    async renderNavigation() {
        await this.navigation.render();
    }

    setupRoutes() {
        this.router.addRoute('/login', () => this.renderPage(LoginPage));
        this.router.addRoute('/overview', () => this.renderPage(OverviewPage));
        this.router.addRoute('/products', () => this.renderPage(ProductsPage));
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
            this.mainContainer.innerHTML = '';
            const page = new PageClass(this.router);
            const content = await page.render();
            this.mainContainer.appendChild(content);
            if (page.mount) page.mount();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.mainContainer.innerHTML = '<div class="error">Something went wrong</div>';
        }
    }
}

let spaInstance;

document.addEventListener('DOMContentLoaded', async () => {
    spaInstance = new App();
    await spaInstance.init();
});

export { spaInstance };
