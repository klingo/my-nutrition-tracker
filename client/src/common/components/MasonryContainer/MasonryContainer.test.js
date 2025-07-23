import { describe, expect, it, beforeEach } from 'vitest';
import MasonryContainer from '@common/components/MasonryContainer';
import BaseComponent from '@core/base/BaseComponent';
import styles from './MasonryContainer.module.css';

describe('MasonryContainer', () => {
    let masonryContainer;

    beforeEach(() => {
        masonryContainer = new MasonryContainer();
    });

    describe('constructor', () => {
        it('initializes with default gutter value if none is provided', () => {
            expect(masonryContainer.gutter).toBe('g-3');
        });

        it('initializes with custom gutter value when provided', () => {
            const customGutter = 'g-2';
            masonryContainer = new MasonryContainer({ gutter: customGutter });
            expect(masonryContainer.gutter).toBe(customGutter);
        });

        it('initializes with default layoutMode if none is provided', () => {
            expect(masonryContainer.layoutMode).toBe('colSpan');
        });

        it('initializes with custom layoutMode when provided', () => {
            masonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });
            expect(masonryContainer.layoutMode).toBe('fixedWidth');
        });

        it('initializes with an empty children array', () => {
            expect(masonryContainer.children).toEqual([]);
        });
    });

    describe('render', () => {
        it('renders a container with the correct classes', () => {
            const element = masonryContainer.render();
            expect(element.classList.contains(styles.masonryContainer)).toBe(true);
        });

        it('includes a sizer element for Masonry', () => {
            const element = masonryContainer.render();
            const sizers = element.querySelectorAll(`.${styles.col1}`);
            expect(sizers.length).toBe(1);
        });

        it('applies gutter class if specified', () => {
            masonryContainer.gutter = 'g-4';
            const element = masonryContainer.render();
            expect(element.classList.contains(styles['g-4'])).toBe(true);
        });

        it('initializes with colSpan mode by default', () => {
            // Create a container with default options
            masonryContainer = new MasonryContainer();
            expect(masonryContainer.layoutMode).toBe('colSpan');
        });

        it('can be initialized with fixedWidth mode', () => {
            // Create a container with fixedWidth mode
            masonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });
            expect(masonryContainer.layoutMode).toBe('fixedWidth');
        });
    });

    describe('add', () => {
        it('adds an HTMLElement to the container', () => {
            const childElement = document.createElement('div');
            masonryContainer.add(childElement);
            expect(masonryContainer.children).toContain(childElement);
        });

        it('adds a BaseComponent to the container', () => {
            const childElement = new BaseComponent();
            childElement.element = document.createElement('div');
            masonryContainer.add(childElement);
            expect(masonryContainer.children).toContain(childElement.element);
        });

        it('throws an error when adding a non-HTMLElement or BaseComponent', () => {
            const invalidChild = 'not-an-element';
            expect(() => masonryContainer.add(invalidChild)).toThrow('Child must be an HTMLElement or BaseComponent');
        });

        it('sets the colSpan class for added elements in colSpan mode', () => {
            // Create container with colSpan mode (default)
            masonryContainer = new MasonryContainer({ layoutMode: 'colSpan' });
            const childElement = document.createElement('div');
            masonryContainer.add(childElement, { colSpan: 8 });
            expect(childElement.classList.contains(styles['col8'])).toBe(true);
        });

        it('handles async appending and layout in Masonry instance', async () => {
            const childElement = document.createElement('div');
            masonryContainer.render();

            // Mocking Masonry methods for testing purposes
            const originalAppendMethod = masonryContainer.masonryInstance.appended;
            const originalLayoutMethod = masonryContainer.masonryInstance.layout;

            let appendedCalled = false;
            let layoutCalled = false;

            masonryContainer.masonryInstance.appended = () => {
                appendedCalled = true;
            };
            masonryContainer.masonryInstance.layout = () => {
                layoutCalled = true;
            };

            masonryContainer.add(childElement);
            await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for the timeout to resolve

            expect(appendedCalled).toBe(true);
            expect(layoutCalled).toBe(true);

            // Restore original methods
            masonryContainer.masonryInstance.appended = originalAppendMethod;
            masonryContainer.masonryInstance.layout = originalLayoutMethod;
        });

        it('handles invalid colSpan values gracefully', () => {
            const childElement = document.createElement('div');
            expect(() => masonryContainer.add(childElement, { colSpan: 13 })).toThrow(
                'colSpan value must be between 1-12',
            );
        });

        it('sets colSpan class in colSpan mode', () => {
            // Create container with colSpan mode (default)
            masonryContainer = new MasonryContainer();
            const childElement = document.createElement('div');

            // Add element with colSpan
            masonryContainer.add(childElement, { colSpan: 6 });

            // Check that colSpan class is applied
            expect(childElement.classList.contains(styles['col6'])).toBe(true);
            expect(childElement.style.width).toBe('');
        });

        it('sets fixed width in fixedWidth mode', () => {
            // Create container with fixedWidth mode
            masonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });
            const childElement = document.createElement('div');

            // Add element with fixedWidth
            masonryContainer.add(childElement, { fixedWidth: 300 });

            // Check that width is set directly on the element
            expect(childElement.style.width).toBe('300px');
        });

        it('uses colSpan to calculate percentage width in fixedWidth mode when no fixedWidth is provided', () => {
            // Create container with fixedWidth mode
            masonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });
            const childElement = document.createElement('div');

            // Add element with only colSpan
            masonryContainer.add(childElement, { colSpan: 6 });

            // Check that width is set as a percentage based on colSpan
            expect(childElement.style.width).toBe('50%');
        });

        it('ignores fixedWidth parameter in colSpan mode', () => {
            // Create container with colSpan mode
            masonryContainer = new MasonryContainer();
            const childElement = document.createElement('div');

            // Mock console.warn to capture warnings
            const originalWarn = console.warn;
            let warningCalled = false;
            console.warn = () => {
                warningCalled = true;
            };

            // Add element with both colSpan and fixedWidth
            masonryContainer.add(childElement, { colSpan: 6, fixedWidth: 300 });

            // Restore console.warn
            console.warn = originalWarn;

            // Check that colSpan class is applied and fixedWidth is ignored
            expect(childElement.classList.contains(styles['col6'])).toBe(true);
            expect(childElement.style.width).toBe('');
            expect(warningCalled).toBe(true);
        });
    });

    describe('remove', () => {
        it('removes an HTMLElement from the container', () => {
            const childElement = document.createElement('div');
            masonryContainer.render();

            // Mock Masonry methods to prevent setTimeout issues
            const originalAppended = masonryContainer.masonryInstance.appended;
            const originalLayout = masonryContainer.masonryInstance.layout;
            const originalRemove = masonryContainer.masonryInstance.remove;

            masonryContainer.masonryInstance.appended = () => {};
            masonryContainer.masonryInstance.layout = () => {};
            let removeCalled = false;
            masonryContainer.masonryInstance.remove = () => {
                removeCalled = true;
            };

            masonryContainer.add(childElement);
            masonryContainer.remove(childElement);

            // Check that the element was removed from the children array
            expect(masonryContainer.children).not.toContain(childElement);
            expect(removeCalled).toBe(true);

            // Restore original methods
            masonryContainer.masonryInstance.appended = originalAppended;
            masonryContainer.masonryInstance.layout = originalLayout;
            masonryContainer.masonryInstance.remove = originalRemove;
        });

        it('removes a BaseComponent from the container', () => {
            const childElement = new BaseComponent();
            childElement.element = document.createElement('div');
            masonryContainer.render();

            // Mock Masonry methods to prevent setTimeout issues
            const originalAppended = masonryContainer.masonryInstance.appended;
            const originalLayout = masonryContainer.masonryInstance.layout;
            const originalRemove = masonryContainer.masonryInstance.remove;

            masonryContainer.masonryInstance.appended = () => {};
            masonryContainer.masonryInstance.layout = () => {};
            let removeCalled = false;
            masonryContainer.masonryInstance.remove = () => {
                removeCalled = true;
            };

            masonryContainer.add(childElement);
            masonryContainer.remove(childElement);

            // Check that the element was removed from the children array
            expect(masonryContainer.children).not.toContain(childElement.element);
            expect(removeCalled).toBe(true);

            // Restore original methods
            masonryContainer.masonryInstance.appended = originalAppended;
            masonryContainer.masonryInstance.layout = originalLayout;
            masonryContainer.masonryInstance.remove = originalRemove;
        });
    });

    describe('destroy', () => {
        it('cleans up all resources', () => {
            masonryContainer.render();

            // Add some elements with fixed width
            const childElement1 = document.createElement('div');
            const childElement2 = document.createElement('div');

            // Mock getComputedStyle to return a fixed gutter size
            const originalGetComputedStyle = window.getComputedStyle;
            window.getComputedStyle = () => ({
                getPropertyValue: () => '16px',
            });

            // Save original methods before mocking
            const originalAppended = masonryContainer.masonryInstance.appended;
            const originalLayout = masonryContainer.masonryInstance.layout;
            const originalDestroy = masonryContainer.masonryInstance.destroy;

            // Mock Masonry methods
            let destroyCalled = false;
            masonryContainer.masonryInstance.appended = () => {};
            masonryContainer.masonryInstance.layout = () => {};
            masonryContainer.masonryInstance.destroy = () => {
                destroyCalled = true;
            };

            // Add elements with fixed width
            masonryContainer.add(childElement1, { fixedWidth: 300 });
            masonryContainer.add(childElement2, { fixedWidth: 400 });

            // Destroy the container
            masonryContainer.destroy();

            // Check that all resources were cleaned up
            expect(masonryContainer.children.length).toBe(0);
            expect(masonryContainer.element).toBe(null);
            expect(destroyCalled).toBe(true);

            // Restore original methods if masonryInstance still exists
            if (masonryContainer.masonryInstance) {
                masonryContainer.masonryInstance.appended = originalAppended;
                masonryContainer.masonryInstance.layout = originalLayout;
                masonryContainer.masonryInstance.destroy = originalDestroy;
            }

            // Restore original getComputedStyle
            window.getComputedStyle = originalGetComputedStyle;
        });
    });
});
