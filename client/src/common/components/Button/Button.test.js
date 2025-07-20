import { beforeEach, describe, expect, it } from 'vitest';
import Button from '@/common/components/Button';

describe('Button', () => {
    let button;

    beforeEach(() => {
        button = new Button({ text: 'Test Button' });
        button.render();
    });

    describe('constructor', () => {
        it('should set default values when no parameters are provided', () => {
            const button = new Button();
            expect(button.text).toBe('');
            expect(button.type).toBe('secondary');
            expect(button.icon).toBe('');
            expect(button.onClick).toBeNull();
            expect(button.disabled).toBe(false);
            expect(button.buttonType).toBe('button');
        });
    });

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

    describe('buttonType', () => {
        it('should accept valid buttonType types', () => {
            const buttonButton = new Button({ buttonType: 'button' }).render();
            const submitButton = new Button({ buttonType: 'submit' }).render();
            const resetButton = new Button({ buttonType: 'reset' }).render();

            expect(buttonButton.type).toBe('button');
            expect(submitButton.type).toBe('submit');
            expect(resetButton.type).toBe('reset');
        });

        it('should render with correct default buttonType', () => {
            const button = new Button().render();
            expect(button.type).toBe('button');
        });

        it('should throw error for invalid buttonType', () => {
            expect(() => new Button({ buttonType: 'invalid-buttonType' })).toThrow(
                'Invalid button buttonType "invalid-buttonType"',
            );
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

    describe('text', () => {
        it('should render with text', () => {
            const button = new Button({ text: 'Click me' }).render();
            expect(button.textContent).toBe('Click me');
        });

        it('should render without text', () => {
            const button = new Button().render();
            expect(button.textContent).toBe('');
        });
    });

    describe('disabled', () => {
        it('should render with disabled state', () => {
            const button = new Button({ disabled: true }).render();
            expect(button.disabled).toBe(true);
            expect(button.getAttribute('aria-disabled')).toBe('true');
        });

        it('should render without disabled state by default', () => {
            const button = new Button().render();
            expect(button.disabled).not.toBe(true);
            expect(button.getAttribute('aria-disabled')).toBeNull();
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

    describe('setText', () => {
        it('should update button text correctly', () => {
            const button = new Button({ text: 'Initial Text' });
            const renderedButton = button.render();
            expect(renderedButton.textContent).toBe('Initial Text');
            button.setText('Updated Text');
            expect(renderedButton.textContent).toBe('Updated Text');
        });

        it('should remove button text when updating with an empty string', () => {
            const button = new Button({ text: 'Initial Text' });
            const renderedButton = button.render();
            expect(renderedButton.textContent).toBe('Initial Text');
            button.setText('');
            expect(renderedButton.textContent).toBe('');
        });
    });

    describe('setDisabled', () => {
        it('should set the button to disabled state and add aria-disabled attribute', () => {
            const button = new Button();
            const renderedButton = button.render();
            expect(renderedButton.disabled).toBe(false);
            expect(renderedButton.getAttribute('aria-disabled')).toBeNull();
            button.setDisabled(true);
            expect(renderedButton.disabled).toBe(true);
            expect(renderedButton.getAttribute('aria-disabled')).toBe('true');
        });

        it('should set the button to enabled state and remove aria-disabled attribute', () => {
            const button = new Button({ disabled: true });
            const renderedButton = button.render();
            expect(renderedButton.disabled).toBe(true);
            expect(renderedButton.getAttribute('aria-disabled')).toBe('true');
            button.setDisabled(false);
            expect(renderedButton.disabled).toBe(false);
            expect(renderedButton.getAttribute('aria-disabled')).toBeNull();
        });

        it('should prevent click event when setting the button to disabled state', () => {
            let clicked = false;
            const onClick = () => (clicked = true);
            const button = new Button({ onClick });
            const renderedButton = button.render();
            renderedButton.click();
            expect(clicked).toBe(true);

            clicked = false;
            button.setDisabled(true);
            renderedButton.click();
            expect(clicked).toBe(false);
        });
    });

    describe('setLoading', () => {
        it('should set the button to disabled when isLoading is true', () => {
            button.setLoading(true);
            expect(button.disabled).toBe(true);
            expect(button.element.getAttribute('aria-disabled')).toBe('true');
        });

        it('should add loading class when isLoading is true', () => {
            button.setLoading(true);
            expect(button.element.classList.contains('loading')).toBe(true);
            const loaderElement = button.element.querySelector('.loader');
            expect(loaderElement).not.toBeNull();
        });

        it('should remove the loader when isLoading is false', () => {
            button.setLoading(true); // First set loading to true
            button.setLoading(false); // Then set loading to false
            const loaderElement = button.element.querySelector('.loader');
            expect(loaderElement).toBeNull();
            expect(button.element.classList.contains('loading')).toBe(false);
        });

        it('should not remove the loader if no loader is present', () => {
            button.setLoading(false); // Set loading to false initially
            const loaderElement = button.element.querySelector('.loader');
            expect(loaderElement).toBeNull();
        });

        it('should set the button to enabled when isLoading is false', () => {
            button.setLoading(true);
            button.setLoading(false);
            expect(button.disabled).toBe(false);
            expect(button.element.getAttribute('aria-disabled')).toBe(null);
        });
    });
});
