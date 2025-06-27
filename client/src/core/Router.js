import authService from '@/services/AuthService.js';

class Router {
    constructor(navigation = null) {
        this.routes = {};
        this.currentRoute = null;
        this.navigation = navigation;

        // Define which routes need authentication
        this.protectedRoutes = ['/overview', '/log-intake', '/products', '/profile'];
        this.publicRoutes = ['/login', '/register'];
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    async navigate(path) {
        // Handle root path redirect FIRST
        if (path === '/') {
            const isAuthenticated = await authService.isAuthenticated();
            const redirectPath = isAuthenticated ? '/overview' : '/login';

            window.history.replaceState({ path: redirectPath }, '', redirectPath);
            this.currentRoute = redirectPath;

            if (this.navigation) this.navigation.updateActiveState(redirectPath);

            const handler = this.routes[redirectPath];
            if (handler) await handler();
            return;
        }

        // Check authentication before navigating
        if (!(await this.canAccess(path))) return; // Access denied, redirect already handled

        if (this.navigation) this.navigation.updateActiveState(path);

        // Update browser history and current route
        if (path !== this.currentRoute) {
            window.history.pushState({ path }, '', path);
            this.currentRoute = path;
        }

        // Execute route handler
        const handler = this.routes[path] || this.routes['/404'];
        if (handler) await handler();
    }

    async handleRoute() {
        const path = window.location.pathname;
        await this.navigate(path);
    }

    async canAccess(path) {
        try {
            const isAuthenticated = await authService.isAuthenticated();

            // Redirect authenticated users away from login/register
            if (isAuthenticated && this.publicRoutes.includes(path)) {
                window.history.replaceState({ path: '/overview' }, '', '/overview');
                this.currentRoute = '/overview';
                if (this.navigation) this.navigation.updateActiveState('/overview');
                const handler = this.routes['/overview'];
                if (handler) await handler();
                return false;
            }

            // Redirect unauthenticated users away from protected routes
            if (!isAuthenticated && this.protectedRoutes.includes(path)) {
                window.history.replaceState({ path: '/login' }, '', '/login');
                this.currentRoute = '/login';
                if (this.navigation) this.navigation.updateActiveState('/login');
                const handler = this.routes['/login'];
                if (handler) await handler();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            // On error, redirect to login for protected routes
            if (this.protectedRoutes.includes(path)) {
                window.history.replaceState({ path: '/login' }, '', '/login');
                this.currentRoute = '/login';
                const handler = this.routes['/login'];
                if (handler) await handler();
                return false;
            }
            return true;
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
