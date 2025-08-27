import { describe, expect, it, beforeEach } from 'vitest';
import Fieldset from './Fieldset';
import styles from './Fieldset.module.css';

describe('Fieldset', () => {
    let fieldset;
    const mockLabel = 'Test Label';

    beforeEach(() => {
        fieldset = new Fieldset({ label: mockLabel });
    });

    describe('constructor', () => {
        it('should create instance with default values', () => {
            const defaultFieldset = new Fieldset();
            expect(defaultFieldset).toBeDefined();
            expect(defaultFieldset.label).toBe('');
            expect(defaultFieldset.icon).toBe('');
            expect(defaultFieldset.required).toBe(false);
        });

        it('should create instance with provided values', () => {
            const customFieldset = new Fieldset({
                label: 'Custom Label',
                icon: 'gender',
                required: true,
            });
            expect(customFieldset.label).toBe('Custom Label');
            expect(customFieldset.icon).toBe('gender');
            expect(customFieldset.required).toBe(true);
        });

        it('should throw error for invalid icon', () => {
            expect(() => new Fieldset({ icon: 'invalid-icon' })).toThrow(
                'Invalid fieldset icon "invalid-icon". Must be one of: gender, birthday',
            );
        });

        it('should handle empty string values correctly', () => {
            const emptyFieldset = new Fieldset({
                label: '',
                icon: '',
                required: false,
            });
            expect(emptyFieldset.label).toBe('');
            expect(emptyFieldset.icon).toBe('');
            expect(emptyFieldset.required).toBe(false);
        });
    });

    describe('render', () => {
        it('should create fieldset element with correct structure', () => {
            const element = fieldset.render();

            expect(element.tagName).toBe('FIELDSET');
            expect(element.classList.contains(styles.fieldset)).toBe(true);

            const legend = element.querySelector('legend');
            expect(legend).toBeDefined();
            expect(legend.textContent).toBe(mockLabel);
            expect(legend.classList.contains(styles.legend)).toBe(true);

            const content = element.querySelector(`.${styles.content}`);
            expect(content).toBeDefined();
        });

        it('should add required class when required is true', () => {
            fieldset = new Fieldset({ required: true });
            const element = fieldset.render();
            expect(element.classList.contains(styles.required)).toBe(true);
        });

        it('should add gender icon when specified', () => {
            fieldset = new Fieldset({ icon: 'gender' });
            const element = fieldset.render();
            const icon = element.querySelector(`.${styles.icon}`);

            expect(icon).toBeDefined();
            expect(icon.classList.contains(styles.gender)).toBe(true);
            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(icon.getAttribute('alt')).toBe('');
        });

        it('should add birthday icon when specified', () => {
            fieldset = new Fieldset({ icon: 'birthday' });
            const element = fieldset.render();
            const icon = element.querySelector(`.${styles.icon}`);

            expect(icon).toBeDefined();
            expect(icon.classList.contains(styles.birthday)).toBe(true);
            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(icon.getAttribute('alt')).toBe('');
        });

        it('should create fieldset without legend when label is empty', () => {
            fieldset = new Fieldset({ label: '' });
            const element = fieldset.render();
            const legend = element.querySelector('legend');
            expect(legend).toBeNull();
        });

        it('should create fieldset with empty string label', () => {
            fieldset = new Fieldset({ label: '' });
            const element = fieldset.render();
            // Should not have a legend when label is empty
            const legend = element.querySelector('legend');
            expect(legend).toBeNull();
        });

        it('should not add icon when icon is empty', () => {
            fieldset = new Fieldset({ icon: '' });
            const element = fieldset.render();
            const icon = element.querySelector(`.${styles.icon}`);
            expect(icon).toBeNull();
        });
    });

    describe('append', () => {
        it('should append children to content element', () => {
            const child = document.createElement('div');
            child.textContent = 'Test Child';

            fieldset.render();
            fieldset.append(child);

            const content = fieldset.element.querySelector(`.${styles.content}`);
            expect(content.contains(child)).toBe(true);
            expect(content.textContent).toBe('Test Child');
        });

        it('should render fieldset if not already rendered when appending', () => {
            const child = document.createElement('div');
            expect(fieldset.element).toBeNull();
            fieldset.append(child);
            expect(fieldset.element).toBeDefined();

            const content = fieldset.element.querySelector(`.${styles.content}`);
            expect(content.contains(child)).toBe(true);
        });

        it('should return this for chaining', () => {
            const child = document.createElement('div');
            const result = fieldset.append(child);
            expect(result).toBe(fieldset);
        });

        it('should append multiple children to content element', () => {
            const child1 = document.createElement('div');
            child1.textContent = 'Child 1';
            const child2 = document.createElement('span');
            child2.textContent = 'Child 2';

            fieldset.render();
            fieldset.append(child1);
            fieldset.append(child2);

            const content = fieldset.element.querySelector(`.${styles.content}`);
            expect(content.contains(child1)).toBe(true);
            expect(content.contains(child2)).toBe(true);
            expect(content.children.length).toBe(2);
        });
    });

    describe('private methods', () => {
        describe('#validate', () => {
            it('should validate icon through observable effects', () => {
                // Testing private method through its observable effects
                expect(() => new Fieldset({ icon: 'invalid' })).toThrow(
                    'Invalid fieldset icon "invalid". Must be one of: gender, birthday',
                );

                expect(() => new Fieldset({ icon: 'gender' })).not.toThrow();
                expect(() => new Fieldset({ icon: 'birthday' })).not.toThrow();
            });

            it('should not throw error when icon is empty', () => {
                expect(() => new Fieldset({ icon: '' })).not.toThrow();
            });
        });
    });

    describe('inherited methods', () => {
        it('should mount to parent element', () => {
            const parent = document.createElement('div');
            const element = fieldset.render();

            fieldset.mount(parent);
            expect(parent.contains(element)).toBe(true);
        });

        it('should unmount from parent element', () => {
            const parent = document.createElement('div');
            const element = fieldset.render();
            parent.appendChild(element);

            expect(parent.contains(element)).toBe(true);
            fieldset.unmount();
            expect(parent.contains(element)).toBe(false);
        });

        it('should render when mounting if not already rendered', () => {
            const parent = document.createElement('div');
            expect(fieldset.element).toBeNull();

            fieldset.mount(parent);
            expect(fieldset.element).toBeDefined();
            expect(parent.contains(fieldset.element)).toBe(true);
        });
    });
});
