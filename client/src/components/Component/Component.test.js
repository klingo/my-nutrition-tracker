import { describe, expect, it } from 'vitest';
import Component from '@/components/Component/Component.js';

describe('Component mount method', () => {
    it('should call render if element is not already rendered', () => {
        const component = new Component();
        let renderCalled = false;
        component.render = () => (renderCalled = true);
        component.mount(document.createElement('div'));
        expect(renderCalled).toBe(true, 'The render method should be called if the element is not already rendered');
    });

    it('should append the rendered element to the parent', () => {
        const component = new Component();
        component.render = () => (component.element = document.createElement('div'));
        const parent = document.createElement('div');
        component.mount(parent);
        expect(parent.contains(component.element)).toBe(true, 'The component should be appended to the parent');
    });
});
