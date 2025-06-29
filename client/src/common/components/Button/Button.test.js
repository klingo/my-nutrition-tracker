import { describe, expect, it } from 'vitest';
import Button from '@/common/components/Button';

describe('Button', () => {
    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            const button = new Button();
            let renderCalled = false;
            button.render = () => (renderCalled = true);
            button.mount(document.createElement('div'));
            expect(renderCalled).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            const button = new Button();
            button.render = () => (button.element = document.createElement('div'));
            const parent = document.createElement('div');
            button.mount(parent);
            expect(parent.contains(button.element)).toBe(true);
        });
    });

    describe('type', () => {
        it('should render with correct type class', () => {
            const button = new Button({ type: 'primary' }).render();
            expect(button.classList.contains('primary')).toBe(true);
        });

        it('should throw error for invalid type', () => {
            expect(() => new Button({ type: 'invalid-type' })).toThrow('Invalid button type "invalid-type"');
        });
    });

    describe('icon', () => {
        it('should render with correct icon', () => {
            const button = new Button({ icon: 'home' }).render();
            expect(button.querySelector('.home')).not.toBeNull();
        });

        it('should throw error for invalid icon', () => {
            expect(() => new Button({ icon: 'invalid-icon' })).toThrow('Invalid button icon "invalid-icon"');
        });
    });

    describe('children', () => {
        it('should render with text children', () => {
            const button = new Button({ children: 'Click me' }).render();
            expect(button.textContent).toBe('Click me');
        });

        it('should render with HTMLElement as children', () => {
            const span = document.createElement('span');
            span.textContent = 'Click me';
            const button = new Button({ children: span }).render();
            expect(button.querySelector('span')).not.toBeNull();
        });

        it('should render with array of strings and HTMLElement as children', () => {
            const span = document.createElement('span');
            span.textContent = 'me';
            const button = new Button({ children: ['Click ', span] }).render();
            expect(button.innerHTML).toBe('<span class="label">Click <span>me</span></span>');
        });
    });

    describe('disabled', () => {
        it('should render with disabled state', () => {
            const button = new Button({ disabled: true }).render();
            expect(button.disabled).toBe(true);
            expect(button.getAttribute('aria-disabled')).toBe('true');
        });
    });

    describe('onClick', () => {
        it('should render with click event', () => {
            let clicked = false;
            const onClick = () => (clicked = true);
            const button = new Button({ onClick }).render();
            button.click();
            expect(clicked).toBe(true);
        });

        it('should not render with click event when disabled', () => {
            let clicked = false;
            const onClick = () => (clicked = true);
            const button = new Button({ onClick, disabled: true }).render();
            button.click();
            expect(clicked).toBe(false);
        });
    });
});
