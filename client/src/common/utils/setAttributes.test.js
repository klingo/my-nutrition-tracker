import { beforeEach, describe, expect, it } from 'vitest';
import setAttributes from './setAttributes';

describe('setAttributes', () => {
    let element;

    beforeEach(() => {
        element = document.createElement('div');
    });

    it('should sets single attribute correctly', () => {
        const attributes = [{ name: 'data-test', value: 'value1' }];
        setAttributes(element, attributes);
        expect(element.getAttribute('data-test')).toBe('value1');
    });

    it('should set multiple attributes correctly', () => {
        const attributes = [
            { name: 'class', value: 'test-class' },
            { name: 'id', value: 'test-id' },
        ];
        setAttributes(element, attributes);
        expect(element.getAttribute('class')).toBe('test-class');
        expect(element.getAttribute('id')).toBe('test-id');
    });

    it('should ignore attribute with undefined value', () => {
        const attributes = [
            { name: 'data-test1', value: undefined },
            { name: 'data-test2', value: 'value2' },
        ];
        setAttributes(element, attributes);
        expect(element.getAttribute('data-test1')).toBeNull();
        expect(element.getAttribute('data-test2')).toBe('value2');
    });

    it('should handle empty attributes array', () => {
        const attributes = [];
        setAttributes(element, attributes);
        // No attributes should be set
        expect(element.attributes.length).toBe(0);
    });

    it('should throw error if element is not a DOM element', () => {
        const attributes = [{ name: 'data-test', value: 'value1' }];
        expect(() => setAttributes({}, attributes)).toThrow(TypeError);
    });

    it('should throw error if attributes is not an array', () => {
        expect(() => setAttributes(element, {})).toThrow(TypeError);
    });
});
