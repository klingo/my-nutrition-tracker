import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navigation from './Navigation.js';
import authService from '@/common/services/AuthService.js';
import { appInstance } from '@/main.js';
import styles from './Navigation.module.css';
import { defaultUnauthenticatedRoute } from '@core/config/routes.js';

// Mock the authService methods for testing
vi.mock('@/common/services/AuthService.js', () => ({
    default: {
        isAuthenticated: vi.fn(),
        logout: vi.fn(),
    },
}));

vi.mock('@/main.js', () => ({
    appInstance: {
        renderNavigation: vi.fn(),
        router: {
            navigate: vi.fn(),
        },
    },
}));

describe('Navigation', () => {
    let navigation;

    beforeEach(() => {
        // Reset mock calls before each test
        authService.isAuthenticated.mockReset();
        // Create a new instance of Navigation for each test
        navigation = new Navigation();
        // Mock the element to avoid DOM manipulation issues in tests
        navigation.element = document.createElement('div');
    });

    describe('render', () => {
        it('renders navigation items correctly when authenticated', async () => {
            // Arrange
            authService.isAuthenticated.mockResolvedValue(true);
            window.location.pathname = '/overview';

            // Act
            const result = await navigation.render();

            // Assert
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result.classList.contains(styles.nav)).toBe(true);
            expect(navigation.element.innerHTML).toContain('Overview');
            expect(navigation.element.innerHTML).toContain('Log Intake');
            expect(navigation.element.innerHTML).toContain('Products');
            expect(navigation.element.innerHTML).toContain('Profile');
            expect(navigation.element.innerHTML).toContain('Logout');
        });

        it('renders navigation items correctly when not authenticated', async () => {
            // Arrange
            authService.isAuthenticated.mockResolvedValue(false);

            // Act
            const result = await navigation.render();

            // Assert
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result.classList.contains(styles.nav)).toBe(true);
            expect(navigation.element.innerHTML).toContain('Login');
            expect(navigation.element.innerHTML).not.toContain('Overview');
            expect(navigation.element.innerHTML).not.toContain('Log Intake');
            expect(navigation.element.innerHTML).not.toContain('Products');
            expect(navigation.element.innerHTML).not.toContain('Profile');
            expect(navigation.element.innerHTML).not.toContain('Logout');
        });

        it('renders navigation items correctly when pathname is falsy', async () => {
            // Arrange
            authService.isAuthenticated.mockResolvedValue(false);
            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: { pathname: '' },
                writable: true,
            });

            // Act
            const result = await navigation.render();

            // Assert
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result.classList.contains(styles.nav)).toBe(true);
            expect(navigation.element.innerHTML).toContain('Login');
            expect(navigation.element.innerHTML).not.toContain('Overview');
            expect(navigation.element.innerHTML).not.toContain('Log Intake');
            expect(navigation.element.innerHTML).not.toContain('Products');
            expect(navigation.element.innerHTML).not.toContain('Profile');
            expect(navigation.element.innerHTML).not.toContain('Logout');

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
            });
        });
    });

    describe('createNavItem', () => {
        it('creates a navigation item with the correct text and path', () => {
            // Arrange
            const text = 'Home';
            const path = '/home';

            // Act
            const navItem = navigation.createNavItem(text, path);

            // Assert
            expect(navItem).toBeInstanceOf(HTMLLIElement);
            expect(navItem.textContent.trim()).toBe(text);
            expect(navItem.querySelector('a').getAttribute('data-navigate')).toBe(path);
        });

        it('sets the active class if currentPath matches the item path', () => {
            // Arrange
            const text = 'Home';
            const path = '/home';
            const currentPath = '/home';

            // Act
            const navItem = navigation.createNavItem(text, path, currentPath);

            // Assert
            expect(navItem.classList.contains(styles.active)).toBe(true);
        });

        it('does not set the active class if currentPath does not match the item path', () => {
            // Arrange
            const text = 'Home';
            const path = '/home';
            const currentPath = '/about';

            // Act
            const navItem = navigation.createNavItem(text, path, currentPath);

            // Assert
            expect(navItem.classList.contains(styles.active)).toBe(false);
        });
    });

    describe('createSpacer', () => {
        it('creates a spacer element with the correct class', () => {
            // Act
            const spacer = navigation.createSpacer();

            // Assert
            expect(spacer).toBeInstanceOf(HTMLDivElement);
            expect(spacer.classList.contains(styles.spacer)).toBe(true);
        });
    });

    describe('createLogoutButton', () => {
        it('creates a logout button with the correct class and text', () => {
            // Act
            const logoutButton = navigation.createLogoutButton();
            const button = logoutButton.querySelector('button');
            const icon = button.querySelector('div');

            // Assert
            expect(logoutButton).toBeInstanceOf(HTMLLIElement);

            expect(button.type).toBe('button');
            expect(button.title).toBe('Logout');
            expect(button.getAttribute('aria-label')).toBe('Logout');

            expect(icon.classList.contains(styles.icon)).toBe(true);
            expect(icon.classList.contains(styles.logout)).toBe(true);
        });

        it('creates a logout button with a click event', async () => {
            // Act
            const logoutButton = navigation.createLogoutButton();
            const button = logoutButton.querySelector('button');
            button.click();

            // Assert
            await vi.waitFor(() => {
                expect(authService.logout).toHaveBeenCalled();
                expect(appInstance.renderNavigation).toHaveBeenCalled();
                expect(appInstance.router.navigate).toHaveBeenCalledWith(defaultUnauthenticatedRoute);
            });
        });
    });

    describe('updateActiveState', () => {
        it('updates the active state of the navigation items correctly', async () => {
            // Arrange
            const currentPath = '/overview';
            authService.isAuthenticated.mockResolvedValue(true);
            window.location.pathname = currentPath;
            await navigation.render();
            navigation.updateActiveState(currentPath);
            const targetPath = '/products';

            // Act
            navigation.updateActiveState(targetPath);

            // Assert
            const navItems = Array.from(navigation.element.querySelectorAll('li a'));
            const activeItem = navItems.find((item) => item.parentElement.classList.contains(styles.active));
            expect(activeItem.getAttribute('data-navigate')).toBe(targetPath);
        });
    });
});
