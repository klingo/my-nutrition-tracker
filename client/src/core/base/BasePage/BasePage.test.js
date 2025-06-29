import { describe, expect, it, vi } from 'vitest';
import BasePage from './BasePage.js';

describe('BasePage', () => {
    describe('render', () => {
        it('should throw an error when render method is called', () => {
            const basePage = new BasePage();
            expect(basePage.render()).rejects.toThrowError('render() method must be implemented');
        });
    });

    describe('mount', () => {
        it('should call mount method on instance without throwing any errors', () => {
            const basePage = new BasePage();
            expect(() => basePage.mount()).not.toThrow();
        });

        it('should call mount method on instance', () => {
            const basePage = new BasePage();
            basePage.mount = vi.fn(); // Mock the unmount method
            basePage.mount();
            expect(basePage.mount).toHaveBeenCalledOnce('mount method should be called once');
        });
    });

    describe('unmount', () => {
        it('should call unmount method on instance without throwing any errors', () => {
            const basePage = new BasePage();
            expect(() => basePage.unmount()).not.toThrow();
        });

        it('should call unmount method on instance', () => {
            const basePage = new BasePage();
            basePage.unmount = vi.fn(); // Mock the unmount method
            basePage.unmount();
            expect(basePage.unmount).toHaveBeenCalledOnce('unmount method should be called once');
        });
    });

    describe('createElement', () => {
        it('should create an element with the specified tag and no additional class names', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('div');
            expect(element.tagName).toBe('DIV', 'Element should be a div');
            expect(element.classList.contains('page')).toBe(true, 'Element should have the "page" class');
        });

        it('should create an element with the specified tag and additional class names', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('div', 'custom-class');
            expect(element.tagName).toBe('DIV', 'Element should be a div');
            expect(element.classList.contains('page')).toBe(true, 'Element should have the "page" class');
            expect(element.classList.contains('custom-class')).toBe(
                true,
                'Element should have the "custom-class" class',
            );
        });
    });
});
