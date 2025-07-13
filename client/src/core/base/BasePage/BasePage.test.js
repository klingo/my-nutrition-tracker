import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { MessageBox } from '@common/components';
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
    });
});
