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
            basePage.mount = vi.fn();
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
            basePage.unmount = vi.fn();
            basePage.unmount();
            expect(basePage.unmount).toHaveBeenCalledTimes(1);
        });
    });

    describe('createPageElement', () => {
        it('should create a div element with the correct class and heading', () => {
            const basePage = new BasePage();
            const element = basePage.createPageElement({ pageHeading: 'test-heading', className: 'test-class' });
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('page')).toBe(true);
            expect(element.classList.contains('test-class')).toBe(true);
            expect(element.querySelector('h1').textContent).toBe('test-heading');
        });

        it('should create a div element without page heading', () => {
            const basePage = new BasePage();
            const element = basePage.createPageElement({ className: 'test-class' });
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('page')).toBe(true);
            expect(element.classList.contains('test-class')).toBe(true);
            expect(element.querySelector('h1')).toBe(null);
        });

        it('should create a div element without class name', () => {
            const basePage = new BasePage();
            const element = basePage.createPageElement({ pageHeading: 'test-heading' });
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('page')).toBe(true);
            expect(element.querySelector('h1').textContent).toBe('test-heading');
        });

        it('should create a div element without both page heading and class name', () => {
            const basePage = new BasePage();
            const element = basePage.createPageElement({});
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('page')).toBe(true);
            expect(element.querySelector('h1')).toBe(null);
        });
    });

    describe('createElement', () => {
        it('should create an element with the correct tag, class, and styles', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('div', 'test-class', { color: 'red' });
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('test-class')).toBe(true);
            expect(element.style.color).toBe('red');
        });

        it('should create an element with no class and styles', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('span', '', { fontSize: '14px' });
            expect(element.tagName).toBe('SPAN');
            expect(element.classList.length).toBe(0);
            expect(element.style.fontSize).toBe('14px');
        });

        it('should create an element with class and no styles', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('p', 'test-class');
            expect(element.tagName).toBe('P');
            expect(element.classList.contains('test-class')).toBe(true);
            expect(Object.keys(element.style).length).toBe(0);
        });

        it('should create an element with no class and no styles', () => {
            const basePage = new BasePage();
            const element = basePage.createElement('a');
            expect(element.tagName).toBe('A');
            expect(element.classList.length).toBe(0);
            expect(Object.keys(element.style).length).toBe(0);
        });
    });
});
