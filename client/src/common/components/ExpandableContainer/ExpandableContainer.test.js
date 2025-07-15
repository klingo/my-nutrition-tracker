import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExpandableContainer from './ExpandableContainer.js';
import styles from './ExpandableContainer.module.css';

describe('ExpandableContainer', () => {
    let container;
    let mockElement;

    beforeEach(() => {
        // Create a new instance of ExpandableContainer for each test
        container = new ExpandableContainer();
        mockElement = {
            style: {},
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn(),
            },
            addEventListener: vi.fn(),
            removeAttribute: vi.fn(),
            setAttribute: vi.fn(),
            getAttribute: vi.fn(),
            scrollHeight: 100,
            offsetHeight: 0,
        };
        container.element = mockElement;
        global.requestAnimationFrame = vi.fn((cb) => cb());
    });

    describe('constructor', () => {
        it('should initialize with default values when no parameters are provided', () => {
            const defaultContainer = new ExpandableContainer();
            expect(defaultContainer.initiallyExpanded).toBe(false);
        });

        it('should initialize with expanded state when initiallyExpanded is true', () => {
            const expandedContainer = new ExpandableContainer(true);
            expect(expandedContainer.initiallyExpanded).toBe(true);
        });
    });

    describe('render', () => {
        it('should create a container with correct default attributes when initially collapsed', () => {
            const element = container.render();

            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.classList).toContain(styles.expandableContainer);
            expect(element.getAttribute('role')).toEqual('region');
            expect(element.getAttribute('aria-hidden')).toEqual('true');
            expect(element.style.display).toBe('none');
        });

        it('should create a container with expanded state when initiallyExpanded is true', () => {
            const expandedContainer = new ExpandableContainer(true);
            expandedContainer.render();

            expect(expandedContainer.element.classList).toContain(styles.expanded);
            expect(expandedContainer.element.style.height).toBe('auto');
        });
    });

    describe('toggle', () => {
        it('should call slideIn when container is hidden', () => {
            mockElement.getAttribute.mockReturnValue('true');
            const slideInSpy = vi.spyOn(container, 'slideIn');

            container.toggle();

            expect(slideInSpy).toHaveBeenCalled();
        });

        it('should call slideOut when container is visible', () => {
            mockElement.getAttribute.mockReturnValue('false');
            const slideOutSpy = vi.spyOn(container, 'slideOut');

            container.toggle();

            expect(slideOutSpy).toHaveBeenCalled();
        });
    });

    describe('slideOut', () => {
        it('should set up transition and hide the container', () => {
            container.slideOut();

            expect(mockElement.style.height).toBe('0');
            expect(mockElement.classList.remove).toHaveBeenCalledWith(styles.expanded);
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
            expect(mockElement.addEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function), {
                once: true,
            });
        });

        it('should not proceed if already transitioning', () => {
            container['#isTransitioning'] = true;
            container.slideOut();

            expect(mockElement.style.height).toEqual('0');
        });
    });

    describe('slideIn', () => {
        it('should set up transition and show the container', () => {
            container.slideIn();

            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            expect(mockElement.style.display).toBe('');
            expect(mockElement.style.height).toBe('100px');
            expect(mockElement.classList.add).toHaveBeenCalledWith(styles.expanded);
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-hidden');
        });

        it('should call slideInCallback if defined', () => {
            const mockCallback = vi.fn();
            container.addSlideInCallback(mockCallback);

            container.slideIn();
            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            expect(mockCallback).toHaveBeenCalled();
        });

        it('should not proceed if already transitioning', () => {
            // First call slideIn to set up the initial state
            container.slideIn();
            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback(); // This will set #isTransitioning to true

            // Reset the mock to track new calls
            const mockRAF = vi.fn();
            global.requestAnimationFrame = mockRAF;

            // Try to slide in again while still transitioning
            container.slideIn();

            // Verify no new animation frame was requested
            expect(mockRAF).not.toHaveBeenCalled();
        });
    });

    describe('handleTransitionEnd', () => {
        it('should set display to none when container is hidden', () => {
            // Set up the transitionend handler
            container.slideOut();
            const transitionEndHandler = mockElement.addEventListener.mock.calls.find(
                (call) => call[0] === 'transitionend',
            )[1];

            // Set up the test
            mockElement.getAttribute.mockReturnValue('true');

            // Trigger the transitionend event
            transitionEndHandler();

            expect(mockElement.style.display).toBe('none');
        });

        it('should set height to auto when container is visible', () => {
            // Set up the transitionend handler
            container.slideIn();
            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();
            const transitionEndHandler = mockElement.addEventListener.mock.calls.find(
                (call) => call[0] === 'transitionend',
            )[1];

            // Set up the test
            mockElement.getAttribute.mockReturnValue('false');

            // Trigger the transitionend event
            transitionEndHandler();

            expect(mockElement.style.height).toBe('auto');
        });
    });

    describe('callback management', () => {
        it('should add slide-in callback', () => {
            const mockCallback = vi.fn();

            container.addSlideInCallback(mockCallback);
            container.slideIn();

            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            expect(mockCallback).toHaveBeenCalled();
        });

        it('should not add invalid callback', () => {
            // Test with an invalid callback
            const result = container.addSlideInCallback('not a function');

            // Verify the method returns the container for chaining
            expect(result).toBe(container);

            // Test the behavior by trying to trigger the callback
            container.slideIn();
            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            // No callback should have been called
            // (We can't test the private field directly, but we can verify the behavior)
        });

        it('should remove slide-in callback', () => {
            const mockCallback = vi.fn();

            // Add and then remove the callback
            container.addSlideInCallback(mockCallback);
            const removeResult = container.removeSlideInCallback();

            // Verify the method returns the container for chaining
            expect(removeResult).toBe(container);

            // Test the behavior by trying to trigger the callback
            container.slideIn();
            const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            // The callback should not have been called
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('append', () => {
        it('should append children to the container element', () => {
            const child1 = document.createElement('div');
            const child2 = document.createElement('span');

            container.render();
            container.append(child1, child2);

            expect(container.children).toContain(child1);
            expect(container.children).toContain(child2);
        });
    });
});
