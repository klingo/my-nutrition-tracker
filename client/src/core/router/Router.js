import { routes, defaultAuthenticatedRoute, defaultUnauthenticatedRoute } from '../config/routes.js';
import authService from '@/common/services/AuthService.js';

class Router {
    constructor(navigation = null, mainContainer) {
        this.routes = {};
        this.currentRoute = null;
        this.navigation = navigation;
        this.mainContainer = mainContainer;

        // Register routes from config
        routes.forEach((route) => {
            this.addRoute(route.path, route.pageComponent, route.requiresAuth);
        });
    }

    addRoute(path, pageComponent, requiresAuth = true) {
        this.routes[path] = { pageComponent, requiresAuth };
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    async navigate(path) {
        // Handle root path redirect FIRST
        if (path === '/') {
            const isAuthenticated = await authService.isAuthenticated();
            const redirectPath = isAuthenticated ? defaultAuthenticatedRoute : defaultUnauthenticatedRoute;

            window.history.replaceState({ path: redirectPath }, '', redirectPath);
            this.currentRoute = redirectPath;

            if (this.navigation) this.navigation.updateActiveState(redirectPath);

            const route = this.routes[redirectPath];
            if (route) await this.renderPage(route.pageComponent);
            return;
        }

        // Check if user is authenticated and trying to access /login
        if (path === '/login') {
            const isAuthenticated = await authService.isAuthenticated();
            if (isAuthenticated) {
                window.history.replaceState({ path: defaultAuthenticatedRoute }, '', defaultAuthenticatedRoute);
                this.currentRoute = defaultAuthenticatedRoute;

                if (this.navigation) this.navigation.updateActiveState(defaultAuthenticatedRoute);

                const route = this.routes[defaultAuthenticatedRoute];
                if (route) await this.renderPage(route.pageComponent);
                return;
            }
        }

        const route = this.routes[path];
        if (route) {
            if (route.requiresAuth) {
                const isAuthenticated = await authService.isAuthenticated();
                if (!isAuthenticated) {
                    window.history.replaceState({ path: defaultUnauthenticatedRoute }, '', defaultUnauthenticatedRoute);
                    this.currentRoute = defaultUnauthenticatedRoute;

                    if (this.navigation) this.navigation.updateActiveState(defaultUnauthenticatedRoute);

                    const loginRoute = this.routes[defaultUnauthenticatedRoute];
                    if (loginRoute) await this.renderPage(loginRoute.pageComponent);
                    return;
                }
            }

            window.history.pushState({ path }, '', path);
            this.currentRoute = path;

            if (this.navigation) this.navigation.updateActiveState(path);

            await this.renderPage(route.pageComponent);
        } else {
            window.history.replaceState({ path: '/404' }, '', '/404');
            this.currentRoute = '/404';

            if (this.navigation) this.navigation.updateActiveState('/404');

            const notFoundRoute = this.routes['/404'];
            if (notFoundRoute) await this.renderPage(notFoundRoute.pageComponent);
        }
    }

    async handleRoute() {
        const path = window.location.pathname;
        await this.navigate(path);
    }

    async renderPage(PageComponent) {
        try {
            this.mainContainer.innerHTML = '';
            const page = new PageComponent(this);
            const content = await page.render();
            this.mainContainer.appendChild(content);
            if (page.mount) page.mount();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.mainContainer.innerHTML = '<div class="error">Something went wrong</div>';
        }
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
}

export default Router;
