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

        // Clean up any mutation observers
        if (expandableContainer && expandableContainer.unmount) {
            expandableContainer.unmount();
        }
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

            // Act
            container.render();

            // Assert
            expect(container.isExpanded()).toBe(true);
            expect(container.element.classList.contains('expanded')).toBe(true);
            expect(container.element.style.height).toBe('auto');
        });

        it('should be able to collapse after initial expansion', () => {
            // Arrange
            const container = new ExpandableContainer(true);
            container.render();

            // Mock scrollHeight for consistent testing
            Object.defineProperty(container.element, 'scrollHeight', {
                configurable: true,
                value: 100,
            });

            // Act
            container.toggle();

            // Assert
            expect(container.element.style.height).toBe('0px');
            expect(container.element.classList.contains('expanded')).toBe(false);
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
            expect(expandableContainer.element.style.display).toBe('');
            expect(expandableContainer.element.style.height).toBe('auto');
        });

        it('should not do anything if already transitioning', () => {
            // Arrange
            // Set up a spy on addEventListener to check if it's called
            const addEventListenerSpy = vi.spyOn(expandableContainer.element, 'addEventListener');

            // Act
            expandableContainer.expand(); // Start transition
            addEventListenerSpy.mockClear(); // Clear the spy after first call

            expandableContainer.expand(); // Try to expand again

            // Assert
            // If the method returned early due to isTransitioning, addEventListener shouldn't be called
            expect(addEventListenerSpy).not.toHaveBeenCalled();
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
            // In the updated implementation, we keep the element visible with height 0
            // instead of setting display:none to allow for re-expansion
            expect(expandableContainer.element.style.height).toBe('0px');
        });

        it('should not do anything if already transitioning', () => {
            // Arrange
            // Set up a spy on addEventListener to check if it's called
            const addEventListenerSpy = vi.spyOn(expandableContainer.element, 'addEventListener');

            // Act
            expandableContainer.collapse(); // Start transition
            addEventListenerSpy.mockClear(); // Clear the spy after first call

            expandableContainer.collapse(); // Try to collapse again

            // Assert
            // If the method returned early due to isTransitioning, addEventListener shouldn't be called
            expect(addEventListenerSpy).not.toHaveBeenCalled();
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

    describe('initiallyExpanded functionality', () => {
        it('should dispatch expandableContainerChange event when initiallyExpanded=true', () => {
            // Arrange
            const container = new ExpandableContainer(true);

            // Create a spy on dispatchEvent before rendering
            const dispatchEventSpy = vi.spyOn(HTMLElement.prototype, 'dispatchEvent');

            // Render the container
            container.render();

            // Assert - The event should have been dispatched during render
            expect(dispatchEventSpy).toHaveBeenCalled();

            // Find the expandableContainerChange event in the calls
            const expandEvent = dispatchEventSpy.mock.calls.find(
                (call) => call[0] && call[0].type === 'expandableContainerChange',
            );

            expect(expandEvent).toBeDefined();
            expect(expandEvent[0].detail).toEqual({ isExpanded: true });

            // Clean up the spy
            dispatchEventSpy.mockRestore();
        });

        it('should be able to toggle (collapse and expand) after initial expansion', async () => {
            // Arrange
            const container = new ExpandableContainer(true);
            container.render();

            // Mock scrollHeight for consistent testing
            Object.defineProperty(container.element, 'scrollHeight', {
                configurable: true,
                value: 100,
            });

            // Act - First collapse
            container.toggle();
            await vi.runAllTimersAsync();
            container.element.dispatchEvent(new Event('transitionend'));

            // Assert - Should be collapsed
            expect(container.isExpanded()).toBe(false);
            expect(container.element.classList.contains('expanded')).toBe(false);
            expect(container.element.style.height).toBe('0px');

            // Act - Then expand again
            container.toggle();
            await vi.runAllTimersAsync();
            container.element.dispatchEvent(new Event('transitionend'));

            // Assert - Should be expanded again
            expect(container.isExpanded()).toBe(true);
            expect(container.element.classList.contains('expanded')).toBe(true);
            expect(container.element.style.height).toBe('auto');
        });

        it('should properly handle content being added after initial expansion', async () => {
            // Arrange
            const container = new ExpandableContainer(true);
            container.render();

            // Mock initial scrollHeight
            Object.defineProperty(container.element, 'scrollHeight', {
                configurable: true,
                value: 50,
            });

            // Act - Add content
            const content = document.createElement('div');
            content.style.height = '100px';
            container.append(content);

            // Update scrollHeight to simulate content being added
            Object.defineProperty(container.element, 'scrollHeight', {
                configurable: true,
                value: 150,
            });

            // Trigger mutation observer manually (since we're in a test environment)
            container.recalculateHeight();
            await vi.runAllTimersAsync();
            container.element.dispatchEvent(new Event('transitionend'));

            // Assert - Height should adjust to new content
            expect(container.isExpanded()).toBe(true);
            expect(container.element.style.height).toBe('auto');
        });
    });
});
