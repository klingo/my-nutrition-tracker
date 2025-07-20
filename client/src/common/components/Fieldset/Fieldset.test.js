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
        });
    });
});
