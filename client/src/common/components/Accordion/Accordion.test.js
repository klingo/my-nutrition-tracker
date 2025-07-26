import { describe, expect, it, beforeEach, vi } from 'vitest';
import Accordion from './Accordion';

// Mocking CSS modules
vi.mock('./Accordion.module.css', () => ({
    default: {
        accordion: 'accordion',
        header: 'header',
        content: 'content',
    },
}));
vi.mock('@styles/icons.module.css', () => ({
    default: {
        icon: 'icon',
        chevronDown: 'chevron-down',
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
        mount(parent) {
            if (parent) {
                parent.append(this.render());
            }
        }
    }
    return { default: BaseComponent };
});

// Mocking ExpandableContainer
const mockExpandableContainerInstance = {
    expand: vi.fn(),
    collapse: vi.fn(),
    toggle: vi.fn(),
    isExpanded: vi.fn(),
    append: vi.fn(),
    render: vi.fn(() => document.createElement('div')),
    mount: vi.fn(function (parent) {
        this.element = this.render();
        parent.append(this.element);
    }),
    element: null, // This will be set in the mount mock
};

vi.mock('@common/components', () => ({
    ExpandableContainer: vi.fn(() => mockExpandableContainerInstance),
}));

describe('Accordion', () => {
    let accordion;
    const mockTitle = 'Test Title';

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset element for each test
        mockExpandableContainerInstance.element = document.createElement('div');
    });

    describe('constructor', () => {
        it('should initialize with a title and default expanded state', () => {
            // Arrange & Act
            accordion = new Accordion({ title: mockTitle });

            // Assert
            expect(accordion.title).toBe(mockTitle);
            expect(accordion.initiallyExpanded).toBe(false);
        });

        it('should initialize with initiallyExpanded set to true', () => {
            // Arrange & Act
            accordion = new Accordion({ title: mockTitle, initiallyExpanded: true });

            // Assert
            expect(accordion.initiallyExpanded).toBe(true);
        });
    });

    describe('render', () => {
        beforeEach(() => {
            accordion = new Accordion({ title: mockTitle, initiallyExpanded: false });
            accordion.render();
        });

        it('should create the main accordion element with the correct class', () => {
            // Assert
            expect(accordion.element.tagName).toBe('DIV');
            expect(accordion.element.classList.contains('accordion')).toBe(true);
        });

        it('should create a header with a button containing the title and an icon', () => {
            // Arrange
            const button = accordion.element.querySelector('button');
            const titleSpan = button.querySelector('span');
            const icon = button.querySelector('div.icon');

            // Assert
            expect(button).toBeDefined();
            expect(titleSpan.textContent).toBe(mockTitle);
            expect(icon).toBeDefined();
            expect(icon.classList.contains('chevron-down')).toBe(true);
        });

        it('should instantiate ExpandableContainer with the correct initial state', async () => {
            // Assert
            const { ExpandableContainer } = await import('@common/components');
            expect(ExpandableContainer).toHaveBeenCalledWith(false);
        });

        it('should set the initial aria-expanded attribute correctly', () => {
            // Arrange
            const button = accordion.element.querySelector('button');

            // Assert
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('Interaction Methods', () => {
        it.each(['expand', 'collapse', 'toggle', 'append'])(
            'should throw an error if %s is called before render',
            async (method) => {
                // Arrange
                accordion = new Accordion({ title: mockTitle });

                // Assert
                expect(() => accordion[method]()).toThrow(
                    `Accordion: Cannot ${method} content before render() is called`,
                );
            },
        );

        it.each(['expand', 'collapse', 'toggle', 'append'])(
            'should call the corresponding method on expandableContainer after render',
            async (method) => {
                // Arrange
                accordion = new Accordion({ title: mockTitle });
                accordion.render();

                // Act
                accordion[method]();

                // Assert
                expect(mockExpandableContainerInstance[method]).toHaveBeenCalled();
            },
        );
    });

    describe('isExpanded', () => {
        it('should return false before render', () => {
            // Arrange
            accordion = new Accordion({ title: mockTitle });

            // Assert
            expect(accordion.isExpanded()).toBe(false);
        });

        it('should return the value from expandableContainer.isExpanded after render', () => {
            // Arrange
            accordion = new Accordion({ title: mockTitle });
            accordion.render();
            mockExpandableContainerInstance.isExpanded.mockReturnValue(true);

            // Assert
            expect(accordion.isExpanded()).toBe(true);
        });
    });

    describe('Event Handling', () => {
        beforeEach(() => {
            accordion = new Accordion({ title: mockTitle });
            accordion.render();
        });

        it('should call toggle on expandableContainer when the button is clicked', () => {
            // Arrange
            const button = accordion.element.querySelector('button');

            // Act
            button.click();

            // Assert
            expect(mockExpandableContainerInstance.toggle).toHaveBeenCalled();
        });

        it('should update aria-expanded and dispatch accordionChange event on expandableContainerChange', () => {
            // Arrange
            const button = accordion.element.querySelector('button');
            const eventListener = vi.fn();
            accordion.element.addEventListener('accordionChange', eventListener);

            // Act
            const detail = { isExpanded: true };
            const customEvent = new CustomEvent('expandableContainerChange', { detail, bubbles: true });
            mockExpandableContainerInstance.element.dispatchEvent(customEvent);

            // Assert
            expect(button.getAttribute('aria-expanded')).toBe('true');
            expect(eventListener).toHaveBeenCalled();
            const dispatchedEvent = eventListener.mock.calls[0][0];
            expect(dispatchedEvent.detail).toEqual(detail);
        });
    });
});
