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

        it('sets the colSpan class for added elements', () => {
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
    });
});
