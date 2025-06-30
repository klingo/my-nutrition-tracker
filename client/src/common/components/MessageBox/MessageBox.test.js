import { beforeEach, describe, expect, it } from 'vitest';
import MessageBox from '@/common/components/MessageBox';

describe('MessageBox', () => {
    let messageBox;

    beforeEach(() => {
        messageBox = new MessageBox({ text: 'Test Message', type: 'info', closeable: true });
        messageBox.render();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const mb = new MessageBox();
            expect(mb.text).toBe('');
            expect(mb.type).toBe(undefined);
            expect(mb.closeable).toBe(false);
        });

        it('should initialize with provided text, type, and closeable', () => {
            expect(messageBox.text).toBe('Test Message');
            expect(messageBox.type).toBe('info');
            expect(messageBox.closeable).toBe(true);
        });

        it('should throw error for invalid type', () => {
            expect(() => new MessageBox({ type: 'invalid-type' })).toThrow(
                'Invalid messagebox type "invalid-type". Must be one of: success, info, warning, error',
            );
        });
    });

    describe('render', () => {
        it('should create a message box element with correct class', () => {
            expect(messageBox.element.classList.contains('message-box')).toBe(true);
            expect(messageBox.element.classList.contains('info')).toBe(true);
        });

        it('should add an icon element', () => {
            const iconElement = messageBox.element.querySelector('.icon');
            expect(iconElement).not.toBeNull();
        });

        it('should add a text span with correct content', () => {
            const textSpan = messageBox.element.querySelector('span');
            expect(textSpan.textContent).toBe('Test Message');
        });
    });

    describe('setText', () => {
        it('should update the text and reflect in the element', () => {
            messageBox.setText('Updated Text');
            expect(messageBox.text).toBe('Updated Text');
            const textSpan = messageBox.element.querySelector('span');
            expect(textSpan.textContent).toBe('Updated Text');
        });
    });

    describe('setType', () => {
        it('should update the type and reflect in the element class', () => {
            messageBox.setType('warning');
            expect(messageBox.type).toBe('warning');
            expect(messageBox.element.classList.contains('info')).toBe(false);
            expect(messageBox.element.classList.contains('warning')).toBe(true);
        });

        it('should throw error for invalid type', () => {
            expect(() => messageBox.setType('invalid-type')).toThrow(
                'Invalid messagebox type "invalid-type". Must be one of: success, info, warning, error',
            );
        });
    });
});
