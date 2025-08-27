import { describe, expect, it } from 'vitest';
import RadioButtons from './RadioButtons';

describe('RadioButtons', () => {
    describe('constructor', () => {
        it('should create a RadioButtons instance with default values', () => {
            const radioButtons = new RadioButtons();

            expect(radioButtons.name).toBe('');
            expect(radioButtons.id).toBe('');
            expect(radioButtons.label).toBe('');
            expect(radioButtons.value).toBe('');
            expect(radioButtons.width).toBeUndefined();
            expect(radioButtons.required).toBe(false);
            expect(radioButtons.disabled).toBe(false);
            expect(radioButtons.compact).toBe(false);
            expect(radioButtons.options).toEqual([]);
        });

        it('should create a RadioButtons instance with provided values', () => {
            const options = [
                { value: 'option1', text: 'Option 1' },
                { value: 'option2', text: 'Option 2' },
            ];

            const radioButtons = new RadioButtons({
                name: 'testName',
                id: 'testId',
                label: 'Test Label',
                value: 'option1',
                width: '200px',
                required: true,
                disabled: true,
                options,
                compact: true,
            });

            expect(radioButtons.name).toBe('testName');
            expect(radioButtons.id).toBe('testId');
            expect(radioButtons.label).toBe('Test Label');
            expect(radioButtons.value).toBe('option1');
            expect(radioButtons.width).toBe('200px');
            expect(radioButtons.required).toBe(true);
            expect(radioButtons.disabled).toBe(true);
            expect(radioButtons.compact).toBe(true);
            expect(radioButtons.options).toEqual(options);
        });

        it('should validate options array', () => {
            expect(() => new RadioButtons({ options: 'invalid' })).toThrowError('Options must be an array');
            expect(() => new RadioButtons({ options: [{}] })).toThrowError(
                'Each option must have a string value property',
            );
            expect(() => new RadioButtons({ options: [{ value: 123 }] })).toThrowError(
                'Each option must have a string value property',
            );
            expect(() => new RadioButtons({ options: [{ value: 'valid' }] })).toThrowError(
                'Each option must have a string text property',
            );
            expect(() => new RadioButtons({ options: [{ value: 'valid', text: 123 }] })).toThrowError(
                'Each option must have a string text property',
            );
            expect(() => new RadioButtons({ options: [{ value: 'valid', text: 'Valid Text' }] })).not.toThrow();
        });
    });

    describe('render', () => {
        it('should render an empty radio button group when no options are provided', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
            });

            const element = radioButtons.render();

            expect(element).toBeDefined();
            expect(element.tagName).toBe('DIV');
            expect(element.children.length).toBe(0);
            expect(radioButtons.element).toBe(element);
        });

        it('should render radio buttons with provided options', () => {
            const options = [
                { value: 'option1', text: 'Option 1' },
                { value: 'option2', text: 'Option 2' },
            ];

            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
                options,
            });

            const element = radioButtons.render();

            expect(element).toBeDefined();
            expect(element.children.length).toBe(2);

            const firstLabel = element.children[0];
            const firstInput = firstLabel.querySelector('input');
            expect(firstLabel.tagName).toBe('LABEL');
            expect(firstInput.type).toBe('radio');
            expect(firstInput.name).toBe('test');
            expect(firstInput.value).toBe('option1');
            expect(firstLabel.textContent).toBe('Option 1');

            const secondLabel = element.children[1];
            const secondInput = secondLabel.querySelector('input');
            expect(secondLabel.tagName).toBe('LABEL');
            expect(secondInput.type).toBe('radio');
            expect(secondInput.name).toBe('test');
            expect(secondInput.value).toBe('option2');
            expect(secondLabel.textContent).toBe('Option 2');
        });

        it('should render radio buttons with selected value', () => {
            const options = [
                { value: 'option1', text: 'Option 1' },
                { value: 'option2', text: 'Option 2' },
            ];

            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
                value: 'option2',
                options,
            });

            const element = radioButtons.render();

            const firstInput = element.children[0].querySelector('input');
            const secondInput = element.children[1].querySelector('input');

            expect(firstInput.checked).toBe(false);
            expect(secondInput.checked).toBe(true);
        });

        it('should apply width style when width is provided', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
                width: '300px',
            });

            const element = radioButtons.render();

            expect(element.style.width).toBe('300px');
        });

        it('should not apply width style when width is not provided', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
            });

            const element = radioButtons.render();

            expect(element.style.width).toBe('');
        });
    });

    describe('mount', () => {
        it('should mount the component to a parent element', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
            });

            const parent = document.createElement('div');
            const mountedComponent = radioButtons.mount(parent);

            expect(parent.contains(radioButtons.element)).toBe(true);
            expect(mountedComponent).toBe(radioButtons);
        });
    });

    describe('unmount', () => {
        it('should unmount the component from its parent', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
            });

            const parent = document.createElement('div');
            radioButtons.mount(parent);

            expect(parent.contains(radioButtons.element)).toBe(true);

            radioButtons.unmount();

            expect(parent.contains(radioButtons.element)).toBe(false);
        });

        it('should do nothing when unmounting an unmounted component', () => {
            const radioButtons = new RadioButtons({
                name: 'test',
                id: 'test-id',
            });

            expect(() => radioButtons.unmount()).not.toThrow();
        });
    });
});
