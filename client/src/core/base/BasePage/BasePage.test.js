import { describe, expect, it, vi } from 'vitest';
import BasePage from './';

describe('BasePage', () => {
    describe('render', () => {
        it('should throw an error when render method is called', async () => {
            const basePage = new BasePage();
            await expect(basePage.render()).rejects.toThrowError('render() method must be implemented');
        });
    });

    describe('mount', () => {
        it('should not throw an error when mount method is called', () => {
            const basePage = new BasePage();
            expect(() => basePage.mount()).not.toThrow();
        });

        it('should call mount method on instance', () => {
            const basePage = new BasePage();
            basePage.mount = vi.fn(); // Mock the unmount method
            basePage.mount();
            expect(basePage.mount).toHaveBeenCalledTimes(1);
        });
    });

    describe('unmount', () => {
        it('should not throw an error when unmount method is called', () => {
            const basePage = new BasePage();
            expect(() => basePage.unmount()).not.toThrow();
        });

        it('should call unmount method on instance', () => {
            const basePage = new BasePage();
            basePage.unmount = vi.fn(); // Mock the unmount method
            basePage.unmount();
            expect(basePage.unmount).toHaveBeenCalledTimes(1);
        });
    });

    describe('createPageElement', () => {
        it('should create a div element with the correct class', () => {
            const basePage = new BasePage();
            const element = basePage.createPageElement('test-class');
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('page')).toBe(true);
            expect(element.classList.contains('test-class')).toBe(true);
        });
    });

    describe('createElement', () => {
        it('should create an element with the correct tag, class, and styles', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('span', 'custom-class', { color: 'red' });
            expect(element.tagName).toBe('SPAN');
            expect(element.classList.contains('custom-class')).toBe(true);
            expect(element.style.color).toBe('red');
        });
    });
});
