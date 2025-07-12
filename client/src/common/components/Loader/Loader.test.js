import { beforeEach, describe, expect, it, vi } from 'vitest';
import Loader from './Loader.js';
import styles from './Loader.module.css';

describe('Loader', () => {
    let loader;

    beforeEach(() => {
        // Create a new instance of Loader for each test
        loader = new Loader();
    });

    describe('constructor', () => {
        it('should create a loader with default size when no size is provided', () => {
            expect(loader.size).toBe('normal');
            expect(loader.centered).toBe(false);
        });

        it('should create a loader with specified size when provided', () => {
            const customLoader = new Loader({ size: 'large' });
            expect(customLoader.size).toBe('large');
        });

        it('should create a centered loader when centered is true', () => {
            const centeredLoader = new Loader({ centered: true });
            expect(centeredLoader.centered).toBe(true);
        });

        it('should throw an error for invalid size', () => {
            expect(() => new Loader({ size: 'extra-large' })).toThrowError(
                'Invalid size "extra-large". Must be one of: small, normal, medium, large',
            );
        });
    });

    describe('render', () => {
        it('should create a loader element with the correct default classes', () => {
            // Act
            const element = loader.render();

            // Assert
            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.classList.contains(styles.loader)).toBe(true);
            expect(element.classList.contains(styles.normal)).toBe(true);
            expect(element.classList.contains(styles.centered)).toBe(false);
        });

        it('should create a centered loader when centered is true', () => {
            // Arrange
            const centeredLoader = new Loader({ centered: true });

            // Act
            const element = centeredLoader.render();

            // Assert
            expect(element.classList.contains(styles.centered)).toBe(true);
        });

        it('should create a loader with the correct size class', () => {
            // Arrange
            const sizes = ['small', 'normal', 'medium', 'large'];

            sizes.forEach((size) => {
                // Act
                const customLoader = new Loader({ size });
                const element = customLoader.render();

                // Assert
                expect(element.classList.contains(styles[size])).toBe(true);
            });
        });

        it('should return the same element on subsequent calls', () => {
            // Act
            const firstRender = loader.render();
            const secondRender = loader.render();

            // Assert
            expect(firstRender).toStrictEqual(secondRender);
        });
    });

    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            // Arrange
            const renderSpy = vi.spyOn(loader, 'render').mockImplementation(() => {
                loader.element = document.createElement('div');
                return loader.element;
            });
            const parent = document.createElement('div');

            // Act
            loader.mount(parent);

            // Assert
            expect(renderSpy).toHaveBeenCalled();
            expect(parent.contains(loader.element)).toBe(true);
        });

        it('should not call render if element is already rendered', () => {
            // Arrange
            loader.element = document.createElement('div');
            const renderSpy = vi.spyOn(loader, 'render');
            const parent = document.createElement('div');

            // Act
            loader.mount(parent);

            // Assert
            expect(renderSpy).not.toHaveBeenCalled();
            expect(parent.contains(loader.element)).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            // Arrange
            const parent = document.createElement('div');

            // Act
            loader.mount(parent);

            // Assert
            expect(parent.firstChild).toBe(loader.element);
        });

        it('should return the loader instance for method chaining', () => {
            // Arrange
            const parent = document.createElement('div');

            // Act
            const result = loader.mount(parent);

            // Assert
            expect(result).toBe(loader);
        });
    });
});
