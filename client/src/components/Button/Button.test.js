import { describe, expect, it } from 'vitest';
import Button from '@/components/Button';

describe('Button', () => {
    it('should render with correct type class', () => {
        const button = new Button({ type: 'primary' }).render();
        expect(button.classList.contains('primary')).toBe(true, 'Button should have primary class');
    });

    it('should throw error for invalid type', () => {
        expect(() => new Button({ type: 'invalid-type' })).toThrow(
            /Invalid button type "invalid-type"/,
            'Should throw error for invalid type',
        );
    });

    it('should render with correct icon', () => {
        const button = new Button({ icon: 'home' }).render();
        expect(button.querySelector('.home')).not.toBeNull('Icon element should be present');
    });

    it('should throw error for invalid icon', () => {
        expect(() => new Button({ icon: 'invalid-icon' })).toThrow(
            /Invalid button icon "invalid-icon"/,
            'Should throw error for invalid icon',
        );
    });

    it('should render with text children', () => {
        const button = new Button({ children: 'Click me' }).render();
        expect(button.textContent).toBe('Click me', 'Button should have correct text content');
    });

    it('should render with HTMLElement as children', () => {
        const span = document.createElement('span');
        span.textContent = 'Click me';
        const button = new Button({ children: span }).render();
        expect(button.querySelector('span')).not.toBeNull('Span element should be present');
    });

    it('should render with array of strings and HTMLElement as children', () => {
        const span = document.createElement('span');
        span.textContent = 'me';
        const button = new Button({ children: ['Click ', span] }).render();
        expect(button.innerHTML).toBe(
            '<span class="label">Click <span>me</span></span>',
            'Button should have correct HTML content',
        );
    });

    it('should render with disabled state', () => {
        const button = new Button({ disabled: true }).render();
        expect(button.disabled).toBe(true, 'Button should be disabled');
    });

    it('should render with click event', () => {
        let clicked = false;
        const onClick = () => (clicked = true);
        const button = new Button({ onClick }).render();
        button.click();
        expect(clicked).toBe(true, 'Button should trigger click');
    });

    it('should not render with click event when disabled', () => {
        let clicked = false;
        const onClick = () => (clicked = true);
        const button = new Button({ onClick, disabled: true }).render();
        button.click();
        expect(clicked).toBe(false, 'Button should not trigger click event when disabled');
    });
});
