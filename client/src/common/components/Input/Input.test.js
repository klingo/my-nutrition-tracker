import { describe, expect, it } from 'vitest';
import Input from '@common/components/Input';

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
            const floatingElement = input.querySelector('span');
            expect(floatingElement.textContent).toBe('Enter text');
        });

        it('should create an input without label if not provided', () => {
            const input = new Input({}).render();
            const inputElement = input.querySelector('input');
            expect(inputElement.placeholder).toBe('');
            const floatingElement = input.querySelector('span');
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
            expect(inputElement.getAttribute('autofocus')).toBe('');
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
            expect(input.querySelector('.icon')).toBeNull();
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
});
