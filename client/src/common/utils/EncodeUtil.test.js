import { describe, expect, it } from 'vitest';
import { EncodeUtil } from './EncodeUtil';

describe('EncodeUtil', () => {
    describe('encode', () => {
        it('should correctly encode a simple string', () => {
            const text = 'Hello World';
            const encodedText = EncodeUtil.encode(text);
            expect(encodedText).toBe('SGVsbG8gV29ybGQ=');
        });

        it('should correctly encode a Unicode string', () => {
            const text = '😊';
            const encodedText = EncodeUtil.encode(text);
            expect(encodedText).toBe('8J+Yig==');
        });

        it('should handle an empty string', () => {
            const text = '';
            const encodedText = EncodeUtil.encode(text);
            expect(encodedText).toBe('');
        });

        it('should throw a TypeError for null input', () => {
            // Since the method expects a string, passing null is not valid
            expect(() => EncodeUtil.encode(null)).toThrow(TypeError);
        });

        it('should throw a TypeError for undefined input', () => {
            // Since the method expects a string, passing undefined is not valid
            expect(() => EncodeUtil.encode(undefined)).toThrow(TypeError);
        });
    });

    describe('decode', () => {
        it('should correctly decode a simple encoded string', () => {
            const encodedText = 'SGVsbG8gV29ybGQ=';
            const decodedText = EncodeUtil.decode(encodedText);
            expect(decodedText).toBe('Hello World');
        });

        it('should correctly decode a Unicode encoded string', () => {
            const encodedText = '8J+Yig==';
            const decodedText = EncodeUtil.decode(encodedText);
            expect(decodedText).toBe('😊');
        });

        it('should handle an empty string', () => {
            const encodedText = '';
            const decodedText = EncodeUtil.decode(encodedText);
            expect(decodedText).toBe('');
        });

        it('should throw an error for invalid base64 input', () => {
            const invalidEncodedText = 'invalid-base64';
            try {
                EncodeUtil.decode(invalidEncodedText);
            } catch (error) {
                expect(error.message).toBe('Invalid character');
            }
        });

        it('should throw a TypeError for null input', () => {
            // Since the method expects a string, passing null is not valid
            expect(() => EncodeUtil.decode(null)).toThrow(TypeError);
        });

        it('should throw a TypeError for undefined input', () => {
            // Since the method expects a string, passing undefined is not valid
            expect(() => EncodeUtil.decode(undefined)).toThrow(TypeError);
        });
    });
});
