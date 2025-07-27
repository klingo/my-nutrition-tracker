import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { MessageBox, Loader } from '@common/components';
import BasePage from './';

// Mock any dependencies that might cause circular imports
vi.mock('@common/components', () => ({
    Loader: vi.fn(() => ({
        mount: vi.fn(),
    })),
    MessageBox: vi.fn().mockImplementation(({ type, message }) => ({
        mount: vi.fn(),
        type,
        message,
    })),
}));

describe('BasePage', () => {
    describe('constructor and initialization', () => {
        it('should initialize with default values and state', () => {
            const basePage = new BasePage();
            expect(basePage.router).toBeNull();
            expect(basePage.element).toBeNull();
            expect(basePage.abortSignal).toBeNull();
            expect(basePage.pageTitle).toBe('');
            expect(basePage.getState()).toEqual({
                loading: false,
                error: null,
            });
        });

        it('should initialize with provided state', () => {
            class TestPage extends BasePage {
                constructor() {
                    super();
                    this.setState({ foo: 'bar', loading: true });
                }
            }
            const page = new TestPage();
            expect(page.getState()).toEqual({
                foo: 'bar',
                loading: true,
                error: null,
            });
        });

        it('should initialize with provided router and signal', () => {
            const mockRouter = {};
            const mockSignal = {};
            const basePage = new BasePage(mockRouter, mockSignal);
            expect(basePage.router).toBe(mockRouter);
            expect(basePage.abortSignal).toBe(mockSignal);
        });
    });

    describe('state management', () => {
        let page;

        beforeEach(() => {
            page = new (class extends BasePage {
                renderContent() {}
            })();
        });

        it('should handle state updates and callbacks', async () => {
            // Test initial state
            expect(page.getState()).toMatchObject({
                loading: false,
                error: null,
            });

            // Test basic state update
            await page.setState({ loading: true });
            expect(page.getState().loading).toBe(true);

            // Test state merging
            await page.setState({ test: 'value' });
            expect(page.getState()).toMatchObject({
                loading: true,
                test: 'value',
                error: null,
            });

            // Test callback
            const callback = vi.fn();
            await page.setState({ another: 'test' }, callback);
            expect(callback).toHaveBeenCalled();
        });

        it('should handle multiple concurrent state updates', async () => {
            await Promise.all([page.setState({ a: 1 }), page.setState({ b: 2 }), page.setState({ c: 3 })]);

            const state = page.getState();
            expect(state.a).toBe(1);
            expect(state.b).toBe(2);
            expect(state.c).toBe(3);
        });

        it('should handle empty or no-op state updates', async () => {
            const initialState = { ...page.getState() };
            await page.setState({});
            expect(page.getState()).toEqual(initialState);
        });

        it('should handle function-based state updates', async () => {
            await page.setState({ counter: 1 });
            await page.setState((prevState) => ({ counter: prevState.counter + 1 }));
            expect(page.getState().counter).toBe(2);
        });

        it('should handle errors in state update callbacks', async () => {
            const error = new Error('Test error');
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const badCallback = vi.fn().mockImplementation(() => {
                throw error;
            });

            await page.setState({ test: true }, badCallback);
            expect(badCallback).toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalledWith('Error in state update callback:', error);

            errorSpy.mockRestore();
        });

        it('should handle multiple callbacks in state updates', async () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            await page.setState({ test: 'value' }, callback1);
            await page.setState({ test: 'value2' }, callback2);
            await page.setState({ test: 'value3' }, callback3);

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            expect(callback3).toHaveBeenCalled();
        });
    });

    describe('mount and unmount', () => {
        let page, parent;

        beforeEach(() => {
            page = new (class extends BasePage {
                renderContent() {
                    const div = document.createElement('div');
                    div.textContent = 'Test Content';
                    this.element.appendChild(div);
                    return div;
                }
            })();
            parent = document.createElement('div');
            document.body.appendChild(parent);
        });

        afterEach(() => {
            if (parent && parent.parentNode) {
                document.body.removeChild(parent);
            }
        });

        it('should handle mount and unmount lifecycle', async () => {
            // Initial mount
            await page.mount(parent);
            expect(parent.contains(page.element)).toBe(true);
            expect(page.element.querySelector('div').textContent).toBe('Test Content');

            // Test remount with new parent
            const newParent = document.createElement('div');
            document.body.appendChild(newParent);

            await page.mount(newParent);
            expect(parent.contains(page.element)).toBe(false);
            expect(newParent.contains(page.element)).toBe(true);

            // Test unmount
            page.unmount();
            expect(newParent.contains(page.element)).toBe(false);

            // Test unmount when already unmounted
            expect(() => page.unmount()).not.toThrow();
        });

        it('should call lifecycle methods during mount and unmount', async () => {
            const componentDidMountSpy = vi.spyOn(page, 'componentDidMount');
            const componentWillUnmountSpy = vi.spyOn(page, 'componentWillUnmount');

            await page.mount(parent);
            expect(componentDidMountSpy).toHaveBeenCalled();

            page.unmount();
            expect(componentWillUnmountSpy).toHaveBeenCalled();

            componentDidMountSpy.mockRestore();
            componentWillUnmountSpy.mockRestore();
        });

        it('should handle mount when element already exists', async () => {
            // Create element manually
            page.element = document.createElement('div');
            page.element.textContent = 'Pre-existing element';

            await page.mount(parent);
            expect(parent.contains(page.element)).toBe(true);
            expect(page.element.textContent).toBe('Pre-existing element');
        });
    });

    describe('rendering', () => {
        it('should handle loading state', async () => {
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            const renderLoadingSpy = vi.spyOn(page, 'renderLoading');

            await page.setState({ loading: true });
            await page.render();

            expect(renderLoadingSpy).toHaveBeenCalled();
            renderLoadingSpy.mockRestore();
        });

        it('should handle error state', async () => {
            const error = new Error('Test error');
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            const renderErrorSpy = vi.spyOn(page, 'renderError');

            await page.setState({ error });
            await page.render();

            expect(renderErrorSpy).toHaveBeenCalledWith(error);
            renderErrorSpy.mockRestore();
        });

        it('should handle render errors', async () => {
            const error = new Error('Render error');
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const page = new (class extends BasePage {
                renderContent() {
                    throw error;
                }
            })();

            const parent = document.createElement('div');
            document.body.appendChild(parent);

            try {
                await page.mount(parent);
                expect(errorSpy).toHaveBeenCalledWith('Error rendering page content:', error);
                expect(MessageBox).toHaveBeenCalledWith({
                    type: 'error',
                    message: error.message,
                });
            } finally {
                errorSpy.mockRestore();
                document.body.removeChild(parent);
            }
        });

        it('should create element if it does not exist during render', async () => {
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            // Ensure no element exists
            expect(page.element).toBeNull();

            await page.render();

            // Element should be created
            expect(page.element).not.toBeNull();
            expect(page.element.tagName).toBe('DIV');
        });

        it('should clear content if element exists during render', async () => {
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            // Create element with content
            page.element = document.createElement('div');
            const child = document.createElement('span');
            child.textContent = 'Test content';
            page.element.appendChild(child);

            expect(page.element.children.length).toBe(1);

            await page.render();

            // Content should be cleared but element should still exist
            expect(page.element).not.toBeNull();
            expect(page.element.children.length).toBe(0);
        });

        it('should handle renderContent throwing error and show error message', async () => {
            const error = new Error('Test render error');
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const page = new (class extends BasePage {
                renderContent() {
                    throw error;
                }
            })();

            await page.render();

            expect(errorSpy).toHaveBeenCalledWith('Error rendering page content:', error);
            expect(MessageBox).toHaveBeenCalledWith({
                type: 'error',
                message: error.message,
            });

            errorSpy.mockRestore();
        });
    });

    describe('element creation', () => {
        it('should create elements with various configurations', () => {
            const page = new BasePage();

            // Test with all options
            const element1 = page.createElement('div', {
                className: 'my-class',
                styles: { color: 'red' },
                attributes: { id: 'test', 'data-test': 'true' },
                textContent: 'Hello',
            });

            expect(element1.tagName).toBe('DIV');
            expect(element1.className).toBe('my-class');
            expect(element1.style.color).toBe('red');
            expect(element1.id).toBe('test');
            expect(element1.getAttribute('data-test')).toBe('true');
            expect(element1.textContent).toBe('Hello');

            // Test with minimal options
            const element2 = page.createElement('span');
            expect(element2.tagName).toBe('SPAN');
            expect(element2.className).toBe('');
        });

        it('should create page elements with various configurations', () => {
            const page = new BasePage();

            // Test with all options
            const element1 = page.createPageElement({
                pageHeading: 'Test Page',
                className: 'test-class',
            });

            expect(element1.tagName).toBe('DIV');
            expect(element1.classList.contains('page')).toBe(true);
            expect(element1.classList.contains('test-class')).toBe(true);
            expect(element1.querySelector('h1').textContent).toBe('Test Page');

            // Test with minimal options
            const element2 = page.createPageElement({});
            expect(element2.querySelector('h1')).toBeNull();
        });

        it('should create page element with default page class', () => {
            const page = new BasePage();
            const element = page.createPageElement({ pageHeading: 'Test' });
            expect(element.classList.contains('page')).toBe(true);
        });
    });

    describe('content management', () => {
        it('should manage page content and title', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            // Test setPageTitle
            page.setPageTitle('New Title');
            expect(page.pageTitle).toBe('New Title');
            expect(page.element.querySelector('h1').textContent).toBe('New Title');

            // Test clearContent
            const heading = page.element.querySelector('h1');
            const testDiv = document.createElement('div');
            page.element.appendChild(testDiv);

            page.clearContent();
            expect(page.element.children).toHaveLength(1);
            expect(page.element.firstChild).toBe(heading);
        });

        it('should handle setPageTitle when no element exists', () => {
            const page = new BasePage();
            // element is null initially
            expect(page.element).toBeNull();

            page.setPageTitle('Test Title');
            // setPageTitle only updates the pageTitle property when no element exists
            expect(page.pageTitle).toBe('Test Title');
            // element should still be null
            expect(page.element).toBeNull();
        });

        it('should handle setPageTitle when no heading exists', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            // Ensure no heading exists
            expect(page.element.querySelector('h1')).toBeNull();

            page.setPageTitle('New Title');

            // Should create heading
            expect(page.element.querySelector('h1').textContent).toBe('New Title');
        });

        it('should handle clearContent when no element exists', () => {
            const page = new BasePage();
            // element is null initially
            expect(page.element).toBeNull();

            // Should not throw error
            expect(() => page.clearContent()).not.toThrow();
        });

        it('should handle clearContent when no heading exists', () => {
            const page = new BasePage();
            page.element = document.createElement('div');
            const child = document.createElement('div');
            child.textContent = 'Test content';
            page.element.appendChild(child);

            // Ensure no heading exists
            expect(page.element.querySelector('h1')).toBeNull();

            page.clearContent();

            // All content should be cleared
            expect(page.element.children.length).toBe(0);
        });

        it('should handle renderLoading when no element exists', () => {
            const page = new BasePage();
            // element is null initially
            expect(page.element).toBeNull();

            // Should not throw error
            expect(() => page.renderLoading()).not.toThrow();
        });

        it('should handle renderError when no element exists', () => {
            const page = new BasePage();
            // element is null initially
            expect(page.element).toBeNull();

            // Should not throw error
            expect(() => page.renderError(new Error('Test'))).not.toThrow();
        });

        it('should handle renderLoading with loader mounting', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            page.renderLoading();

            // Should create loader and mount it
            expect(Loader).toHaveBeenCalledWith({ size: 'large', centered: true });
        });
    });

    describe('lifecycle methods', () => {
        it('should handle renderContent throwing error', () => {
            const page = new BasePage();
            expect(() => page.renderContent()).toThrow('renderContent() must be implemented by child class');
        });
    });

    describe('chaining methods', () => {
        it('should support method chaining for setPageTitle', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            const result = page.setPageTitle('Test');
            expect(result).toBe(page);
        });

        it('should support method chaining for clearContent', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            const result = page.clearContent();
            expect(result).toBe(page);
        });

        it('should support method chaining for renderLoading', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            const result = page.renderLoading();
            expect(result).toBe(page);
        });

        it('should support method chaining for renderError', () => {
            const page = new BasePage();
            page.element = document.createElement('div');

            const result = page.renderError(new Error('Test'));
            expect(result).toBe(page);
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle concurrent state updates properly', async () => {
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            // Multiple rapid state updates
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(page.setState({ [`key${i}`]: i }));
            }

            await Promise.all(promises);

            // All updates should be applied
            for (let i = 0; i < 10; i++) {
                expect(page.getState()[`key${i}`]).toBe(i);
            }
        });

        it('should handle state update with null or undefined values', async () => {
            const page = new (class extends BasePage {
                renderContent() {}
            })();

            await page.setState({ value: null });
            expect(page.getState().value).toBeNull();

            await page.setState({ value: undefined });
            expect(page.getState().value).toBeUndefined();
        });

        it('should handle render with abort signal', async () => {
            const abortController = new AbortController();
            const page = new (class extends BasePage {
                renderContent() {}
            })(null, abortController.signal);

            expect(page.abortSignal).toBe(abortController.signal);

            await page.render();
            // Should complete without error
            expect(page.element).not.toBeNull();
        });
    });
});
