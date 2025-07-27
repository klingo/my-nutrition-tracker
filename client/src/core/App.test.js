import { describe, expect, it, beforeEach, vi } from 'vitest';
import { App } from './App.js';
import Router from './router/Router.js';
import Navigation from '@/common/components/Navigation';

// Mock the dependencies
vi.mock('./router/Router.js', () => {
    const RouterMock = vi.fn();
    RouterMock.prototype.init = vi.fn();
    RouterMock.prototype.navigate = vi.fn();
    return {
        default: RouterMock,
    };
});

vi.mock('@/common/components/Navigation', () => {
    const NavigationMock = vi.fn();
    NavigationMock.prototype.render = vi.fn();
    return {
        default: NavigationMock,
    };
});

// Mock DOM elements
const mockHeader = document.createElement('div');
mockHeader.id = 'header';

const mockNav = document.createElement('div');
mockNav.id = 'nav';

const mockMain = document.createElement('div');
mockMain.id = 'main';

const mockFooter = document.createElement('div');
mockFooter.id = 'footer';

describe('App', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();

        // Reset DOM
        document.body.innerHTML = '';

        // Add mock elements to DOM
        document.body.appendChild(mockHeader);
        document.body.appendChild(mockNav);
        document.body.appendChild(mockMain);
        document.body.appendChild(mockFooter);
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            const app = new App();

            expect(app.headerContainer).toBe(mockHeader);
            expect(app.navContainer).toBe(mockNav);
            expect(app.mainContainer).toBe(mockMain);
            expect(app.footerContainer).toBe(mockFooter);
            expect(app.navigation).toBeInstanceOf(Navigation);
            expect(app.router).toBeInstanceOf(Router);
        });

        it('should create Navigation and Router instances', () => {
            const app = new App();

            expect(Navigation).toHaveBeenCalled();
            expect(Router).toHaveBeenCalledWith(app.navigation, mockMain);
        });
    });

    describe('init', () => {
        it('should call renderNavigation and setupNavigation, then initialize router', async () => {
            const app = new App();
            app.renderNavigation = vi.fn();
            app.setupNavigation = vi.fn();

            await app.init();

            expect(app.renderNavigation).toHaveBeenCalled();
            expect(app.setupNavigation).toHaveBeenCalled();
            expect(app.router.init).toHaveBeenCalled();
        });
    });

    describe('renderNavigation', () => {
        it('should call render on the navigation instance', async () => {
            const app = new App();
            const mockRender = vi.fn();
            app.navigation.render = mockRender;

            await app.renderNavigation();

            expect(mockRender).toHaveBeenCalled();
        });
    });

    describe('setupNavigation', () => {
        it('should add event listener for click events', () => {
            const app = new App();
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            app.setupNavigation();

            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should navigate to correct path when data-navigate element is clicked', () => {
            const app = new App();
            app.setupNavigation();

            // Create a mock element with data-navigate attribute
            const mockLink = document.createElement('a');
            mockLink.setAttribute('data-navigate', '/test-path');
            mockLink.href = '#';

            // Create a mock event
            const mockEvent = {
                target: mockLink,
                preventDefault: vi.fn(),
            };

            // Find the event listener we added and call it
            const eventListeners = vi.mocked(document.addEventListener).mock.calls;
            const clickListener = eventListeners.find((call) => call[0] === 'click');

            if (clickListener) {
                clickListener[1](mockEvent);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(app.router.navigate).toHaveBeenCalledWith('/test-path');
            }
        });

        it('should not navigate when clicked element does not have data-navigate attribute', () => {
            const app = new App();
            app.setupNavigation();

            // Create a mock element without data-navigate attribute
            const mockLink = document.createElement('a');
            mockLink.href = '#';

            // Create a mock event
            const mockEvent = {
                target: mockLink,
                preventDefault: vi.fn(),
            };

            // Find the event listener we added and call it
            const eventListeners = vi.mocked(document.addEventListener).mock.calls;
            const clickListener = eventListeners.find((call) => call[0] === 'click');

            if (clickListener) {
                clickListener[1](mockEvent);
                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                expect(app.router.navigate).not.toHaveBeenCalled();
            }
        });
    });
});
