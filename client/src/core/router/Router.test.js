import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import Router from './Router.js';
import authService from '@/common/services/AuthService.js';

// Mock dependencies
vi.mock('@/common/services/AuthService.js', () => ({
    default: {
        isAuthenticated: vi.fn(),
    },
}));

// Mock dynamic imports for page components
const mockLoginPage = vi.fn();
const mockRegisterPage = vi.fn();
const mockOverviewPage = vi.fn();
const mockProductsPage = vi.fn();
const mockProductAddPage = vi.fn();
const mockProfilePage = vi.fn();
const mockNotFoundPage = vi.fn();

// Mock window.location
const mockLocation = {
    pathname: '/',
    search: '',
};

describe('Router', () => {
    let router;
    let mockNavigation;
    let mockMainContainer;
    let originalLocation;
    let originalHistory;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock DOM
        document.body.innerHTML = '<div id="main"></div>';
        mockMainContainer = document.getElementById('main');

        // Mock navigation
        mockNavigation = {
            updateActiveState: vi.fn(),
        };

        // Mock window.location
        originalLocation = { ...window.location };
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });

        // Mock history
        originalHistory = window.history;
        window.history = {
            pushState: vi.fn(),
            replaceState: vi.fn(),
        };

        // Create router instance
        router = new Router(mockNavigation, mockMainContainer);

        // Mock page components
        router.routes = {
            '/login': { pageComponent: mockLoginPage, requiresAuth: false },
            '/register': { pageComponent: mockRegisterPage, requiresAuth: false },
            '/404': { pageComponent: mockNotFoundPage, requiresAuth: false },
            '/overview': { pageComponent: mockOverviewPage, requiresAuth: true },
            '/products': { pageComponent: mockProductsPage, requiresAuth: true },
            '/products/add': { pageComponent: mockProductAddPage, requiresAuth: true },
            '/profile': { pageComponent: mockProfilePage, requiresAuth: true },
        };
    });

    afterEach(() => {
        // Restore original window.location
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: originalLocation,
        });

        // Restore original history
        window.history = originalHistory;
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(router.routes).toBeDefined();
            expect(router.currentRoute).toBeNull();
            expect(router.navigation).toBe(mockNavigation);
            expect(router.mainContainer).toBe(mockMainContainer);
            expect(router.pageInstance).toBeNull();
            expect(router.abortController).toBeNull();
        });

        it('should register routes from config', () => {
            expect(router.routes['/login']).toBeDefined();
            expect(router.routes['/register']).toBeDefined();
            expect(router.routes['/overview']).toBeDefined();
            expect(router.routes['/products']).toBeDefined();
            expect(router.routes['/profile']).toBeDefined();
        });
    });

    describe('addRoute', () => {
        it('should add a new route', () => {
            const mockPageComponent = vi.fn();
            router.addRoute('/test', mockPageComponent, false);

            expect(router.routes['/test']).toEqual({
                pageComponent: mockPageComponent,
                requiresAuth: false,
            });
        });

        it('should default requiresAuth to true', () => {
            const mockPageComponent = vi.fn();
            router.addRoute('/test', mockPageComponent);

            expect(router.routes['/test'].requiresAuth).toBe(true);
        });
    });

    describe('init', () => {
        it('should add popstate event listener and handle initial route', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            const handleRouteSpy = vi.spyOn(router, 'handleRoute');

            router.init();

            expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
            expect(handleRouteSpy).toHaveBeenCalled();
        });
    });

    describe('navigate', () => {
        beforeEach(() => {
            mockLoginPage.mockResolvedValue(
                class LoginPage {
                    render() {
                        return document.createElement('div');
                    }
                    mount() {}
                },
            );
            mockOverviewPage.mockResolvedValue(
                class OverviewPage {
                    render() {
                        return document.createElement('div');
                    }
                    mount() {}
                },
            );
            mockNotFoundPage.mockResolvedValue(
                class NotFoundPage {
                    render() {
                        return document.createElement('div');
                    }
                    mount() {}
                },
            );
        });

        it('should handle root path redirect for authenticated user', async () => {
            authService.isAuthenticated.mockResolvedValue(true);
            window.location.pathname = '/';

            await router.navigate('/');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/overview' }, '', '/overview');
            expect(router.currentRoute).toBe('/overview');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/overview');
            expect(mockOverviewPage).toHaveBeenCalled();
        });

        it('should handle root path redirect for unauthenticated user', async () => {
            authService.isAuthenticated.mockResolvedValue(false);
            window.location.pathname = '/';

            await router.navigate('/');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/login' }, '', '/login');
            expect(router.currentRoute).toBe('/login');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/login');
            expect(mockLoginPage).toHaveBeenCalled();
        });

        it('should redirect authenticated user from login to default authenticated route', async () => {
            authService.isAuthenticated.mockResolvedValue(true);

            await router.navigate('/login');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/overview' }, '', '/overview');
            expect(router.currentRoute).toBe('/overview');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/overview');
            expect(mockOverviewPage).toHaveBeenCalled();
        });

        it('should redirect authenticated user from register to default authenticated route', async () => {
            authService.isAuthenticated.mockResolvedValue(true);

            await router.navigate('/register');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/overview' }, '', '/overview');
            expect(router.currentRoute).toBe('/overview');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/overview');
            expect(mockOverviewPage).toHaveBeenCalled();
        });

        it('should allow unauthenticated user to access login page', async () => {
            authService.isAuthenticated.mockResolvedValue(false);

            await router.navigate('/login');

            expect(window.history.pushState).toHaveBeenCalledWith({ path: '/login' }, '', '/login');
            expect(router.currentRoute).toBe('/login');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/login');
            expect(mockLoginPage).toHaveBeenCalled();
        });

        it('should redirect unauthenticated user trying to access protected route to login', async () => {
            authService.isAuthenticated.mockResolvedValue(false);

            await router.navigate('/overview');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/login' }, '', '/login');
            expect(router.currentRoute).toBe('/login');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/login');
            expect(mockLoginPage).toHaveBeenCalled();
        });

        it('should allow authenticated user to access protected route', async () => {
            authService.isAuthenticated.mockResolvedValue(true);

            await router.navigate('/overview');

            expect(window.history.pushState).toHaveBeenCalledWith({ path: '/overview' }, '', '/overview');
            expect(router.currentRoute).toBe('/overview');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/overview');
            expect(mockOverviewPage).toHaveBeenCalled();
        });

        it('should handle non-existent route with 404 page', async () => {
            await router.navigate('/non-existent');

            expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/404' }, '', '/404');
            expect(router.currentRoute).toBe('/404');
            expect(mockNavigation.updateActiveState).toHaveBeenCalledWith('/404');
            expect(mockNotFoundPage).toHaveBeenCalled();
        });
    });

    describe('handleRoute', () => {
        it('should call navigate with current window location pathname', async () => {
            window.location.pathname = '/test-path';
            const navigateSpy = vi.spyOn(router, 'navigate');

            await router.handleRoute();

            expect(navigateSpy).toHaveBeenCalledWith('/test-path');
        });
    });

    describe('renderPage', () => {
        let mockPageComponent;
        let mockPageInstance;

        beforeEach(() => {
            mockPageInstance = {
                render: vi.fn().mockResolvedValue(document.createElement('div')),
                mount: vi.fn(),
                unmount: vi.fn(),
            };

            mockPageComponent = vi.fn().mockResolvedValue(
                class {
                    constructor() {
                        return mockPageInstance;
                    }
                    render() {
                        return mockPageInstance.render();
                    }
                    mount() {
                        return mockPageInstance.mount();
                    }
                    unmount() {
                        return mockPageInstance.unmount();
                    }
                },
            );
        });

        it('should render a page component successfully', async () => {
            // Mock DOM elements
            mockMainContainer.innerHTML = '<div>previous content</div>';

            await router.renderPage(mockPageComponent);

            // Check that page was instantiated and rendered
            expect(mockPageComponent).toHaveBeenCalled();
            expect(mockPageInstance.render).toHaveBeenCalled();

            // Check that new content was added
            expect(mockMainContainer.children.length).toBeGreaterThan(0);

            // Check that page was mounted
            expect(mockPageInstance.mount).toHaveBeenCalled();
        });

        it('should handle rendering error gracefully', async () => {
            mockPageInstance.render.mockRejectedValue(new Error('Render error'));

            await router.renderPage(mockPageComponent);

            // Check that error message is displayed
            expect(mockMainContainer.innerHTML).toContain('Something went wrong');
        });

        it('should abort previous page loading when navigating to a new page', async () => {
            // Create first abort controller
            const mockAbortController = {
                abort: vi.fn(),
                signal: { aborted: false },
            };
            router.abortController = mockAbortController;

            // Mock previous page instance
            const mockPreviousPageInstance = {
                unmount: vi.fn(),
            };
            router.pageInstance = mockPreviousPageInstance;

            await router.renderPage(mockPageComponent);

            expect(mockPreviousPageInstance.unmount).toHaveBeenCalled();
            expect(mockAbortController.abort).toHaveBeenCalled();
        });
    });

    describe('getQueryParams', () => {
        it('should return an empty object when no query parameters exist', () => {
            window.location.search = '';

            const params = router.getQueryParams();

            expect(params).toEqual({});
        });

        it('should parse query parameters correctly', () => {
            window.location.search = '?param1=value1&param2=value2';

            const params = router.getQueryParams();

            expect(params).toEqual({
                param1: 'value1',
                param2: 'value2',
            });
        });

        it('should handle special characters in query parameters', () => {
            window.location.search = '?name=John%20Doe&city=New%20York';

            const params = router.getQueryParams();

            expect(params).toEqual({
                name: 'John Doe',
                city: 'New York',
            });
        });
    });

    describe('prefetchRoute', () => {
        beforeEach(() => {
            mockOverviewPage.mockImplementation(() => Promise.resolve());
        });

        it('should prefetch an existing route', () => {
            router.prefetchRoute('/overview');

            expect(mockOverviewPage).toHaveBeenCalled();
        });

        it('should handle prefetch error gracefully', () => {
            mockOverviewPage.mockImplementation(() => Promise.reject(new Error('Import error')));

            // Should not throw
            expect(() => router.prefetchRoute('/overview')).not.toThrow();
        });

        it('should warn when trying to prefetch non-existent route', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

            router.prefetchRoute('/non-existent');

            expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot prefetch route: /non-existent - Route not found');

            consoleWarnSpy.mockRestore();
        });
    });
});
