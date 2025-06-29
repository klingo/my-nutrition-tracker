import { describe, expect, it } from 'vitest';
import BaseComponent from '@/core/base/BaseComponent/index.js';

describe('Component', () => {
    describe('render', () => {
        it('should throw an error when render method is called', () => {
            const component = new BaseComponent();
            expect(() => component.render()).toThrowError('render() method must be implemented');
        });
    });

    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            const component = new BaseComponent();
            let renderCalled = false;
            component.render = () => (renderCalled = true);
            component.mount(document.createElement('div'));
            expect(renderCalled).toBe(
                true,
                'The render method should be called if the element is not already rendered',
            );
        });

        it('should append the rendered element to the parent', () => {
            const component = new BaseComponent();
            component.render = () => (component.element = document.createElement('div'));
            const parent = document.createElement('div');
            component.mount(parent);
            expect(parent.contains(component.element)).toBe(true, 'The component should be appended to the parent');
        });
    });

    describe('unmount', () => {
        it('should remove the element from its parent if mounted', () => {
            const component = new BaseComponent();
            component.render = () => (component.element = document.createElement('div'));
            const parent = document.createElement('div');
            component.mount(parent);
            component.unmount();
            expect(parent.contains(component.element)).toBe(
                false,
                'The element should be removed from its parent after unmounting',
            );
        });

        it('should do nothing if the element is not mounted', () => {
            const component = new BaseComponent();
            component.unmount();
            expect(component.element).toBe(
                null,
                'Unmounting an unmounted component should have no effect on the element',
            );
        });
    });
});
