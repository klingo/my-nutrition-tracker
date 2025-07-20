// Link.test.js
import { describe, expect, it, beforeEach, vi } from 'vitest';
import Link from './Link';
import styles from './Link.module.css';
import { appInstance } from '@/main.js';

// Mock the appInstance and router
vi.mock('@/main.js', () => ({
    appInstance: {
        router: {
            navigate: vi.fn(),
        },
    },
}));

// Mock routes
vi.mock('@core/config/routes.js', () => ({
    routes: [
        { path: '/test', component: {} },
        { path: '/invalid', component: {} },
    ],
}));

describe('Link', () => {
    let link;
    const validProps = {
        text: 'Test Link',
        routePath: '/test',
    };

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create Link instance with valid props', () => {
            link = new Link(validProps);
            expect(link).toBeDefined();
            expect(link.text).toBe(validProps.text);
            expect(link.routePath).toBe(validProps.routePath);
            // The navigation should work with the valid route
            const element = link.render();
            const clickEvent = new Event('click');
            element.dispatchEvent(clickEvent);
            expect(appInstance.router.navigate).toHaveBeenCalledWith(validProps.routePath);
        });

        it('should throw error for invalid route path', () => {
            expect(() => {
                new Link({
                    text: 'Invalid Link',
                    routePath: '/nonexistent',
                });
            }).toThrow('Invalid route path: /nonexistent');
        });
    });

    describe('render', () => {
        beforeEach(() => {
            link = new Link(validProps);
        });

        it('should create anchor element with correct attributes', () => {
            const element = link.render();

            expect(element.tagName).toBe('A');
            expect(element.textContent).toBe(validProps.text);
            expect(element.getAttribute('href')).toBe(validProps.routePath);
            expect(element.classList.contains(styles.link)).toBe(true);
        });

        it('should save rendered element to instance', () => {
            const element = link.render();
            expect(link.element).toBe(element);
        });

        it('should prevent default behavior and navigate on click', () => {
            const element = link.render();
            const clickEvent = new Event('click');
            const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

            element.dispatchEvent(clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(appInstance.router.navigate).toHaveBeenCalledWith(validProps.routePath);
        });
    });
});
