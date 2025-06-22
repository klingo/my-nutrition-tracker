import authService from '@/services/AuthService.js';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Define which routes need authentication
        this.protectedRoutes = ['/', '/overview', '/log-intake', '/profile'];
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
        // Check authentication before navigating
        if (!(await this.canAccess(path))) {
            return; // Access denied, redirect already handled
        }

        // Update browser history and current route
        if (path !== this.currentRoute) {
            window.history.pushState({ path }, '', path);
            this.currentRoute = path;
        }

        // Execute route handler
        const handler = this.routes[path] || this.routes['/404'];
        if (handler) {
            await handler();
        }
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
                const handler = this.routes['/overview'];
                if (handler) await handler();
                return false;
            }

            // Redirect unauthenticated users away from protected routes
            if (!isAuthenticated && this.protectedRoutes.includes(path)) {
                window.history.replaceState({ path: '/login' }, '', '/login');
                this.currentRoute = '/login';
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
