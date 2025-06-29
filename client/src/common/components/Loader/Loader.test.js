import { describe, expect, it } from 'vitest';
import Loader from '@common/components/Loader';

describe('Loader', () => {
    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            const loader = new Loader();
            let renderCalled = false;
            loader.render = () => (renderCalled = true);
            loader.mount(document.createElement('div'));
            expect(renderCalled).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            const loader = new Loader();
            loader.render = () => (loader.element = document.createElement('div'));
            const parent = document.createElement('div');
            loader.mount(parent);
            expect(parent.contains(loader.element)).toBe(true);
        });
    });

    it('should create a loader with default size when no size is provided', () => {
        const loader = new Loader();
        expect(loader.size).toBe('normal');
    });

    describe('size', () => {
        it('should create a loader with specified valid size', () => {
            const loader = new Loader({ size: 'small' }).render();
            expect(loader.classList.contains('.small')).not.toBeNull();
        });

        it('should throw an error for invalid size', () => {
            expect(() => new Loader({ size: 'extra-large' })).toThrowError(
                'Invalid size "extra-large". Must be one of: small, normal, medium, large',
            );
        });
    });
});
