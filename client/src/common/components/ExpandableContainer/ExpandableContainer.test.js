import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import ExpandableContainer from './ExpandableContainer';

// Mocking CSS modules
vi.mock('./ExpandableContainer.module.css', () => ({
    default: {
        expandableContainer: 'expandableContainer',
        expanded: 'expanded',
    },
}));

// Mocking BaseComponent
vi.mock('@core/base/BaseComponent', () => {
    class BaseComponent {
        constructor() {
            this.element = null;
        }

        render() {}

        append() {}
    }
    return { default: BaseComponent };
});

describe('ExpandableContainer', () => {
    let expandableContainer;

    beforeEach(() => {
        vi.useFakeTimers();
        expandableContainer = new ExpandableContainer();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('constructor', () => {
        it('should initialize with initiallyExpanded as false by default', () => {
            // Assert
            expect(expandableContainer.initiallyExpanded).toBe(false);
        });

        it('should initialize with initiallyExpanded as true if provided', () => {
            // Arrange
            const container = new ExpandableContainer(true);
            // Assert
            expect(container.initiallyExpanded).toBe(true);
        });

        it('should initialize with initiallyExpanded as false for falsy values other than undefined', () => {
            // Arrange
            const container = new ExpandableContainer(null);
            // Assert
            expect(container.initiallyExpanded).toBe(false);
        });
    });

    describe('render', () => {
        it('should create a div element with the correct class and role', () => {
            // Act
            const element = expandableContainer.render();

            // Assert
            expect(element.tagName).toBe('DIV');
            expect(element.classList.contains('expandableContainer')).toBe(true);
            expect(element.getAttribute('role')).toBe('region');
        });

        it('should not be expanded initially by default', () => {
            // Act
            expandableContainer.render();

            // Assert
            expect(expandableContainer.isExpanded()).toBe(false);
            expect(expandableContainer.element.classList.contains('expanded')).toBe(false);
        });

        it('should be expanded initially if initiallyExpanded is true', () => {
            // Arrange
            const container = new ExpandableContainer(true);
            const expandSpy = vi.spyOn(container, 'expand');

            // Act
            container.render();

            // Assert
            expect(expandSpy).toHaveBeenCalled();
        });
    });

    describe('expand', () => {
        beforeEach(() => {
            expandableContainer.render();
            // Mock scrollHeight for consistent testing
            Object.defineProperty(expandableContainer.element, 'scrollHeight', {
                configurable: true,
                value: 100,
            });
        });

        it('should expand the container', async () => {
            // Arrange
            const eventListener = vi.fn();
            expandableContainer.element.addEventListener('expandableContainerChange', eventListener);

            // Act
            expandableContainer.expand();
            await vi.runAllTimersAsync();

            // Assert
            expect(eventListener).toHaveBeenCalled();
            const event = eventListener.mock.calls[0][0];
            expect(event.detail).toEqual({ isExpanded: true });
            expect(expandableContainer.element.style.height).toBe('100px');
            expect(expandableContainer.element.classList.contains('expanded')).toBe(true);
            expect(expandableContainer.element.hasAttribute('aria-hidden')).toBe(false);
        });

        it('should handle transition end correctly', async () => {
            // Act
            expandableContainer.expand();
            await vi.runAllTimersAsync();
            expandableContainer.element.dispatchEvent(new Event('transitionend'));

            // Assert
            expect(expandableContainer.isExpanded()).toBe(true);
            expect(expandableContainer.element.style.display).toBe('auto');
        });

        it('should not do anything if already transitioning', () => {
            // Arrange
            const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
            expandableContainer.expand(); // Start transition
            expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

            // Act
            expandableContainer.expand(); // Try to expand again

            // Assert
            expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1); // Should not be called again
        });
    });

    describe('collapse', () => {
        beforeEach(() => {
            expandableContainer.render();
            // Expand it first to test collapse
            expandableContainer.expand();
            vi.runAllTimers();
            expandableContainer.element.dispatchEvent(new Event('transitionend'));

            // Mock scrollHeight for consistent testing
            Object.defineProperty(expandableContainer.element, 'scrollHeight', {
                configurable: true,
                value: 100,
            });
        });

        it('should collapse the container', async () => {
            // Arrange
            const eventListener = vi.fn();
            expandableContainer.element.addEventListener('expandableContainerChange', eventListener);

            // Act
            expandableContainer.collapse();
            await vi.runAllTimersAsync();

            // Assert
            expect(eventListener).toHaveBeenCalled();
            const event = eventListener.mock.calls[0][0];
            expect(event.detail).toEqual({ isExpanded: false });
            expect(expandableContainer.element.style.height).toBe('0px');
            expect(expandableContainer.element.classList.contains('expanded')).toBe(false);
            expect(expandableContainer.element.getAttribute('aria-hidden')).toBe('true');
        });

        it('should handle transition end correctly', async () => {
            // Act
            expandableContainer.collapse();
            await vi.runAllTimersAsync();
            expandableContainer.element.dispatchEvent(new Event('transitionend'));

            // Assert
            expect(expandableContainer.isExpanded()).toBe(false);
            expect(expandableContainer.element.style.display).toBe('none');
        });

        it('should not do anything if already transitioning', () => {
            // Arrange
            const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
            expandableContainer.collapse(); // Start transition
            expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

            // Act
            expandableContainer.collapse(); // Try to expand again

            // Assert
            expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1); // Should not be called again
        });
    });

    describe('toggle', () => {
        beforeEach(() => {
            expandableContainer.render();
        });

        it('should expand if collapsed', () => {
            // Arrange
            const expandSpy = vi.spyOn(expandableContainer, 'expand');

            // Act
            expandableContainer.toggle();

            // Assert
            expect(expandSpy).toHaveBeenCalled();
        });

        it('should collapse if expanded', () => {
            // Arrange
            expandableContainer.expand();
            vi.runAllTimers();
            expandableContainer.element.dispatchEvent(new Event('transitionend'));
            const collapseSpy = vi.spyOn(expandableContainer, 'collapse');

            // Act
            expandableContainer.toggle();

            // Assert
            expect(collapseSpy).toHaveBeenCalled();
        });
    });

    describe('append', () => {
        it('should throw an error if called before render', () => {
            // Assert
            expect(() => expandableContainer.append(document.createElement('div'))).toThrow(
                'ExpandableContainer: Cannot append content before render() is called',
            );
        });

        it('should append children to the element after render', () => {
            // Arrange
            expandableContainer.render();
            const child = document.createElement('p');
            child.textContent = 'Test';

            // Act
            expandableContainer.append(child);

            // Assert
            expect(expandableContainer.element.contains(child)).toBe(true);
            expect(expandableContainer.element.textContent).toBe('Test');
        });
    });
});
