import { describe, expect, it } from 'vitest';
import Input from '@common/components/Input';
import styles from '@common/components/Input/Input.module.css';
import iconStyles from '@styles/icons.module.css';

describe('Input', () => {
    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            const input = new Input();
            let renderCalled = false;
            input.render = () => (renderCalled = true);
            input.mount(document.createElement('div'));
            expect(renderCalled).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            const input = new Input();
            input.render = () => (input.element = document.createElement('div'));
            const parent = document.createElement('div');
            input.mount(parent);
            expect(parent.contains(input.element)).toBe(true);
        });
    });

    describe('type', () => {
        it('should create an input with default type', () => {
            const input = new Input().render();
            expect(input.querySelector('input').type).toBe('text');
        });

        it('should create an input with password type if provided', () => {
            const input = new Input({ type: 'password' });
            expect(input.type).toBe('password');
        });

        it('should throw error for invalid type', () => {
            expect(() => new Input({ type: 'invalid' })).toThrow(/Invalid input type "invalid"/);
        });
    });

    describe('label', () => {
        it('should create an input with label if provided', () => {
            const input = new Input({ label: 'Enter text' }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.placeholder).toBe('');
            const floatingElement = input.querySelector(`.${styles.floatingLabel}`);
            expect(floatingElement.textContent).toBe('Enter text');
        });

        it('should create an input without label if not provided', () => {
            const input = new Input({}).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.placeholder).toBe('');
            const floatingElement = input.querySelector(`.${styles.floatingLabel}`);
            expect(floatingElement).toBeNull();
        });
    });

    describe('name', () => {
        it('should set name correctly if provided', () => {
            const input = new Input({ name: 'Input name' }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.name).toBe('Input name');
        });

        it('should not set name if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.name).toBe('');
        });
    });

    describe('id', () => {
        it('should set id correctly if provided', () => {
            const input = new Input({ id: 'identifier' }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.id).toBe('identifier');
        });

        it('should not set id if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.id).toBe('');
        });
    });

    describe('autocorrect', () => {
        it('should set autocorrect correctly if "false" provided', () => {
            const input = new Input({ autocorrect: false }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autocorrect')).toBe('off');
        });

        it('should set autocorrect to default if "true"" provided', () => {
            const input = new Input({ autocorrect: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autocorrect')).toBeNull();
        });

        it('should set autocorrect to default if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autocorrect')).toBeNull();
        });
    });

    describe('spellcheck', () => {
        it('should set spellcheck correctly if "false" provided', () => {
            const input = new Input({ spellcheck: false }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('spellcheck')).toBe('false');
        });

        it('should set spellcheck to default if "true" provided', () => {
            const input = new Input({ spellcheck: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('spellcheck')).toBeNull();
        });

        it('should set spellcheck to default if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('spellcheck')).toBeNull();
        });
    });

    describe('autocomplete', () => {
        it('should set autocomplete correctly if provided', () => {
            const input = new Input({ autocomplete: 'username' }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autocomplete')).toBe('username');
        });

        it('should not set autocomplete if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autocomplete')).toBeNull();
        });
    });

    describe('autofocus', () => {
        it('should set autofocus correctly if provided', () => {
            const input = new Input({ autofocus: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autofocus')).toBeNull();
        });

        it('should not set autofocus if not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('autofocus')).toBeNull();
        });
    });

    describe('maxLength', () => {
        it('should set maxLength correctly', () => {
            const input = new Input({ maxLength: 100 });
            expect(input.maxLength).toBe(100);
        });
    });

    describe('icon', () => {
        it('should throw error for invalid icon', () => {
            expect(() => new Input({ icon: 'invalid' })).toThrow(/Invalid input icon "invalid"/);
        });

        it('should render leading icon if provided', () => {
            const input = new Input({ icon: 'lock' }).render();
            expect(input.querySelector('.icon.lock')).not.toBeNull();
        });

        it('should throw error for invalid icon', () => {
            expect(() => new Input({ icon: 'invalid-leadingIcon' })).toThrow(
                'Invalid input icon "invalid-leadingIcon". Must be one of: account, person, lock',
            );
        });

        it('should not render leading icon if not provided', () => {
            const input = new Input().render();
            expect(input.querySelectorAll(`.${iconStyles.icon}`).length).toBe(1);
            expect(input.querySelector(`.${iconStyles.icon}`).classList).toContain(styles.trailingIcon);
        });

        it('should add correct icon class when icon is provided', () => {
            const input = new Input({ icon: 'mail' }).render();
            const icon = input.querySelector(`.${iconStyles.icon}`);
            expect(icon).not.toBeNull();
            expect(icon.classList.contains(iconStyles.mail)).toBe(true);
        });
    });

    describe('disabled', () => {
        it('should set disabled attribute when disabled is true', () => {
            const input = new Input({ disabled: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(true);
            expect(inputElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should not set disabled attribute when disabled is false', () => {
            const input = new Input({ disabled: false }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('aria-disabled')).toBeNull();
        });

        it('should not set disabled attribute when disabled is not provided', () => {
            const input = new Input({}).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('aria-disabled')).toBeNull();
        });
    });

    describe('minLength', () => {
        it('should set minLength attribute when provided', () => {
            const input = new Input({ minLength: 5 }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('minlength')).toBe('5');
        });

        it('should not set minLength when not provided', () => {
            const input = new Input().render();
            const inputElement = input.querySelector('input');
            expect(inputElement.getAttribute('minlength')).toBeNull();
        });
    });

    describe('value methods', () => {
        it('should set and get value using setValue and getValue', () => {
            const input = new Input();
            input.render();

            input.setValue('test value');
            expect(input.getValue()).toBe('test value');

            // Verify the DOM is updated
            const inputElement = input.element.querySelector('input');
            expect(inputElement.value).toBe('test value');
        });

        it('should get value from DOM if element exists', () => {
            const input = new Input();
            input.render();

            const inputElement = input.element.querySelector('input');
            inputElement.value = 'dom value';

            expect(input.getValue()).toBe('dom value');
        });
    });

    describe('required', () => {
        it('should set required attribute when required is true', () => {
            const input = new Input({ required: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.required).toBe(true);
            expect(inputElement.getAttribute('aria-required')).toBe('true');
        });

        it('should not set required attribute when required is false', () => {
            const input = new Input({ required: false }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.required).toBe(false);
            expect(inputElement.getAttribute('aria-required')).toBeNull();
        });

        it('should not set required attribute when required is missing', () => {
            const input = new Input({}).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.required).toBe(false);
            expect(inputElement.getAttribute('aria-required')).toBeNull();
        });
    });

    describe('disabled', () => {
        it('should set disabled attribute when disabled is true', () => {
            const input = new Input({ disabled: true }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(true);
            expect(inputElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should not set disabled attribute when disabled is false', () => {
            const input = new Input({ disabled: false }).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('aria-disabled')).toBeNull();
        });

        it('should not set disabled attribute when disabled is missing', () => {
            const input = new Input({}).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('aria-disabled')).toBeNull();
        });
    });

    describe('error element', () => {
        it('should show required error message when input is required and empty', () => {
            const input = new Input({ required: true });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Trigger invalid event
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('This field is required');
            expect(errorElement.style.display).toBe('block');
        });

        it('should show pattern mismatch error when pattern is not matched', () => {
            const input = new Input({
                pattern: '\\d{3}-\\d{3}-\\d{4}',
                patternErrorMessage: 'Please enter a valid phone number',
            });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set an invalid value that doesn't match the pattern
            inputElement.value = 'invalid';

            // Trigger invalid event
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('Please enter a valid phone number');
        });

        it('should clear error message when input becomes valid', () => {
            const input = new Input({ required: true });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // First trigger invalid state
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            inputElement.dispatchEvent(invalidEvent);

            // Then make it valid
            inputElement.value = 'valid input';
            inputElement.dispatchEvent(new Event('input'));

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('');
            expect(errorElement.style.display).toBe('none');
            expect(element.classList.contains(styles.hasError)).toBe(false);
        });
    });

    describe('input validation', () => {
        it('should update character counter when input changes', () => {
            const input = new Input({ maxLength: 10 });
            const element = input.render();
            const inputElement = element.querySelector('input');
            const characterCounter = element.querySelector(`.${styles.characterCounter}`);

            expect(characterCounter.textContent).toBe('0/10');

            // Simulate typing
            inputElement.value = 'test';
            inputElement.dispatchEvent(new Event('input'));

            expect(characterCounter.textContent).toBe('4/10');
        });

        it('should show error when input is too long', () => {
            const input = new Input({ maxLength: 5 });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set a value longer than maxLength
            inputElement.value = 'toolong';

            // Trigger validation
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, tooLong: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toContain('Please enter no more than 5 characters');
        });

        it('should show min length error when input is too short', () => {
            const input = new Input({ minLength: 5 });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set a value shorter than minLength
            inputElement.value = 'abc';

            // Trigger validation with tooShort
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, tooShort: true },
            });
            Object.defineProperty(inputElement, 'minLength', {
                value: 5,
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('Please enter at least 5 characters');
            expect(inputElement.getAttribute('aria-invalid')).toBe('true');
        });
    });

    describe('number input validation', () => {
        it('should enforce max value for number inputs', () => {
            const input = new Input({
                type: 'number',
                numberConfig: { max: 100 },
            });
            const element = input.render();
            const inputElement = element.querySelector('input');

            expect(inputElement.getAttribute('max')).toBe('100');

            // Test that the input is limited to max length
            inputElement.value = '1000'; // More than 3 digits (max is 100)
            inputElement.dispatchEvent(new Event('input'));

            expect(inputElement.value).toBe('100');
        });

        it('should show error when number is out of range', () => {
            const input = new Input({
                type: 'number',
                numberConfig: { min: 10, max: 100 },
            });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set a value below min
            inputElement.value = '5';

            // Trigger validation
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, rangeUnderflow: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toContain('Value must be greater than or equal to');
        });

        it('should show range overflow error for number input', () => {
            const input = new Input({
                type: 'number',
                numberConfig: { max: 100 },
            });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set a value above max
            inputElement.value = '150';

            // Trigger validation with rangeOverflow
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, rangeOverflow: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toContain('Value must be less than or equal to');
        });

        it('should show step mismatch error for invalid step', () => {
            const input = new Input({
                type: 'number',
                numberConfig: { step: 2 },
            });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set a value that doesn't match the step
            inputElement.value = '3';

            // Trigger validation with stepMismatch
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, stepMismatch: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('Please enter a valid value');
        });

        it('should show bad input error for invalid input', () => {
            const input = new Input({ type: 'number' });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set an invalid value for number input
            inputElement.value = 'abc';

            // Trigger validation with badInput
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, badInput: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('Please enter a valid value');
        });
    });

    describe('email input validation', () => {
        it('should show type mismatch error for invalid email', () => {
            const input = new Input({ type: 'email' });
            const element = input.render();
            const inputElement = element.querySelector('input');

            // Set an invalid email
            inputElement.value = 'not-an-email';

            // Trigger validation with typeMismatch
            const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
            Object.defineProperty(inputElement, 'validity', {
                value: { valid: false, typeMismatch: true },
            });
            inputElement.dispatchEvent(invalidEvent);

            const errorElement = element.querySelector(`.${styles.errorText}`);
            expect(errorElement.textContent).toBe('Please enter a valid value');
        });
    });
});
