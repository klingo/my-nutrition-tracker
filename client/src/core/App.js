import Router from './router/Router.js';
import Navigation from '@/common/components/Navigation';

export class App {
    constructor() {
        this.headerContainer = document.getElementById('header');
        this.navContainer = document.getElementById('nav');
        this.mainContainer = document.getElementById('main');
        this.footerContainer = document.getElementById('footer');
        this.navigation = new Navigation();
        this.router = new Router(this.navigation, this.mainContainer);
    }

    async init() {
        await this.renderNavigation();
        this.setupNavigation();
        this.router.init();
    }

    async renderNavigation() {
        await this.navigation.render();
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-navigate');
                console.log(`path=${path}`);
                this.router.navigate(path);
            }
        });
    }
}
