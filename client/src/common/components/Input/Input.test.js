import { describe, expect, it, beforeEach, vi } from 'vitest';
import Input from './Input';
import styles from './Input.module.css';
import iconStyles from '@styles/icons.module.css';

describe('Input', () => {
    // Define top-level test variables here
    let input;

    beforeEach(() => {
        // Logic that must be started before every test _if required_
        input = new Input();
    });

    describe('constructor', () => {
        it('should create an input with default values', () => {
            expect(input.type).toBe('text');
            expect(input.name).toBe('');
            expect(input.id).toBe('');
            expect(input.label).toBe('');
            expect(input.value).toBe('');
            expect(input.required).toBe(false);
            expect(input.disabled).toBe(false);
            expect(input.autocorrect).toBe(true);
            expect(input.spellcheck).toBe(true);
            expect(input.autocomplete).toBeUndefined();
            expect(input.autofocus).toBe(false);
            expect(input.minLength).toBeUndefined();
            expect(input.maxLength).toBeUndefined();
            expect(input.pattern).toBe('');
            expect(input.patternErrorMessage).toBe('');
            expect(input.icon).toBe('');
            expect(input.compact).toBe(false);
            expect(input.errorMessage).toBe('');
            expect(input.errorElement).toBeNull();
        });

        it('should create an input with custom values', () => {
            const customInput = new Input({
                type: 'email',
                name: 'email',
                id: 'email-id',
                label: 'Email Address',
                value: 'test@example.com',
                required: true,
                disabled: true,
                autocorrect: false,
                spellcheck: false,
                autocomplete: 'email',
                autofocus: true,
                minLength: 5,
                maxLength: 50,
                pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
                patternErrorMessage: 'Invalid email format',
                icon: 'mail',
                compact: true,
            });

            expect(customInput.type).toBe('email');
            expect(customInput.name).toBe('email');
            expect(customInput.id).toBe('email-id');
            expect(customInput.label).toBe('Email Address');
            expect(customInput.value).toBe('test@example.com');
            expect(customInput.required).toBe(true);
            expect(customInput.disabled).toBe(true);
            expect(customInput.autocorrect).toBe(false);
            expect(customInput.spellcheck).toBe(false);
            expect(customInput.autocomplete).toBe('email');
            expect(customInput.autofocus).toBe(true);
            expect(customInput.minLength).toBe(5);
            expect(customInput.maxLength).toBe(50);
            expect(customInput.pattern).toBe('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
            expect(customInput.patternErrorMessage).toBe('Invalid email format');
            expect(customInput.icon).toBe('mail');
            expect(customInput.compact).toBe(true);
        });

        it('should throw error for invalid type', () => {
            expect(() => new Input({ type: 'invalid' })).toThrow(/Invalid input type "invalid"/);
        });

        it('should create input with numberConfig', () => {
            const numberInput = new Input({
                type: 'number',
                numberConfig: {
                    min: 0,
                    max: 100,
                    step: 5,
                    inputmode: 'decimal',
                    suffix: 'kg',
                },
            });

            expect(numberInput.type).toBe('number');
            expect(numberInput.numberConfig.min).toBe(0);
            expect(numberInput.numberConfig.max).toBe(100);
            expect(numberInput.numberConfig.step).toBe(5);
            expect(numberInput.numberConfig.inputmode).toBe('decimal');
            expect(numberInput.numberConfig.suffix).toBe('kg');
        });
    });

    describe('render', () => {
        it('should render the input element with default settings', () => {
            const element = input.render();

            expect(element).toBeDefined();
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains(styles.input)).toBe(true);

            const inputElement = element.querySelector('input');
            expect(inputElement).toBeDefined();
            expect(inputElement.type).toBe('text');
            expect(inputElement.name).toBe('');
            expect(inputElement.id).toBe('');
            expect(inputElement.value).toBe('');
            expect(inputElement.required).toBe(false);
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('autocorrect')).toBeNull();
            expect(inputElement.getAttribute('spellcheck')).toBeNull();
        });

        it('should render the input with label when provided', () => {
            const labeledInput = new Input({ label: 'Username' });
            const element = labeledInput.render();

            const labelElement = element.querySelector('label');
            expect(labelElement).toBeDefined();

            const floatingLabel = element.querySelector(`.${styles.floatingLabel}`);
            expect(floatingLabel).toBeDefined();
            expect(floatingLabel.textContent).toBe('Username');
        });

        it('should render the input with icon when provided', () => {
            const iconInput = new Input({ icon: 'mail' });
            const element = iconInput.render();

            const iconElement = element.querySelector(`.${iconStyles.icon}`);
            expect(iconElement).toBeDefined();
            expect(iconElement.classList.contains(iconStyles.mail)).toBe(true);
        });

        it('should render compact input when compact is true', () => {
            const compactInput = new Input({ compact: true });
            const element = compactInput.render();

            const labelElement = element.querySelector('label');
            expect(labelElement.classList.contains(styles.compact)).toBe(true);
        });

        it('should render input with error element', () => {
            const element = input.render();

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement).toBeDefined();
            expect(errorElement.style.display).toBe('none');
        });

        it('should render input with character counter when maxLength is set', () => {
            const inputWithCounter = new Input({ maxLength: 100 });
            const element = inputWithCounter.render();

            const counterElement = element.querySelector(`.${styles.characterCounter}`);
            expect(counterElement).toBeDefined();
            expect(counterElement.textContent).toBe('0/100');
        });

        it('should render number input with suffix when provided', () => {
            const numberInput = new Input({
                type: 'number',
                numberConfig: { suffix: 'kg' },
            });
            const element = numberInput.render();

            const suffixElement = element.querySelector(`.${styles.suffixText}`);
            expect(suffixElement).toBeDefined();
            expect(suffixElement.textContent).toBe('kg');
        });
    });

    describe('setValue', () => {
        it('should set the value and update the input element', () => {
            const element = input.render();
            const inputElement = element.querySelector('input');

            input.setValue('new value');

            expect(input.value).toBe('new value');
            expect(inputElement.value).toBe('new value');
        });

        it('should return the input instance for method chaining', () => {
            const result = input.setValue('test');
            expect(result).toBe(input);
        });

        it('should update character counter when value changes', () => {
            const inputWithCounter = new Input({ maxLength: 10 });
            const element = inputWithCounter.render();
            const counterElement = element.querySelector(`.${styles.characterCounter}`);
            const inputElement = element.querySelector('input');

            inputWithCounter.setValue('12345');
            inputElement.value = '12345';
            inputElement.dispatchEvent(new Event('input'));

            expect(counterElement.textContent).toBe('5/10');
        });
    });

    describe('getValue', () => {
        it('should return the value property when no element is rendered', () => {
            input.value = 'test value';
            expect(input.getValue()).toBe('test value');
        });

        it('should return the input element value when element is rendered', () => {
            const element = input.render();
            const inputElement = element.querySelector('input');
            inputElement.value = 'element value';

            expect(input.getValue()).toBe('element value');
        });

        it('should return empty string when no value is set', () => {
            expect(input.getValue()).toBe('');
        });
    });

    describe('input validation', () => {
        it('should update character counter when input changes', () => {
            const inputWithCounter = new Input({ maxLength: 10 });
            const element = inputWithCounter.render();
            const inputElement = element.querySelector('input');
            const counterElement = element.querySelector(`.${styles.characterCounter}`);

            inputElement.value = '12345';
            inputElement.dispatchEvent(new Event('input'));

            expect(counterElement.textContent).toBe('5/10');
        });
    });

    describe('number input validation', () => {
        it('should enforce min value for number inputs', () => {
            const numberInput = new Input({
                type: 'number',
                numberConfig: { min: 0 },
            });
            const element = numberInput.render();
            const inputElement = element.querySelector('input');

            expect(inputElement.min).toBe('0');
        });

        it('should enforce max value for number inputs', () => {
            const numberInput = new Input({
                type: 'number',
                numberConfig: { max: 100 },
            });
            const element = numberInput.render();
            const inputElement = element.querySelector('input');

            expect(inputElement.max).toBe('100');
        });

        it('should set step attribute for number inputs', () => {
            const numberInput = new Input({
                type: 'number',
                numberConfig: { step: 0.5 },
            });
            const element = numberInput.render();
            const inputElement = element.querySelector('input');

            expect(inputElement.step).toBe('0.5');
        });
    });

    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            let renderCalled = false;
            input.render = vi.fn(() => {
                renderCalled = true;
                const div = document.createElement('div');
                input.element = div;
                return div;
            });

            const parent = document.createElement('div');
            input.mount(parent);

            expect(renderCalled).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            const parent = document.createElement('div');
            const mockElement = document.createElement('div');
            input.element = mockElement;

            input.mount(parent);

            expect(parent.contains(mockElement)).toBe(true);
        });
    });
});
