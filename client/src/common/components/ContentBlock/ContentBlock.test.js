import { beforeEach, describe, expect, it } from 'vitest';
import ContentBlock from '@/common/components/ContentBlock';

describe('ContentBlock', () => {
    let contentBlock;

    beforeEach(() => {
        contentBlock = new ContentBlock();
        contentBlock.render();
    });

    describe('render', () => {
        it('should create a div element with the correct class', () => {
            expect(contentBlock.element.tagName).toBe('DIV');
            expect(contentBlock.element.classList.contains('content-block')).toBe(true);
        });

        it('should not render if already rendered', () => {
            const element = contentBlock.element;
            contentBlock.render();
            expect(contentBlock.element).toStrictEqual(element);
        });
    });

    describe('mount', () => {
        it('should call render if element is not already rendered', () => {
            const newContentBlock = new ContentBlock();
            let renderCalled = false;
            newContentBlock.render = () => (renderCalled = true);
            newContentBlock.mount(document.createElement('div'));
            expect(renderCalled).toBe(true);
        });

        it('should append the rendered element to the parent', () => {
            const parent = document.createElement('div');
            contentBlock.mount(parent);
            expect(parent.contains(contentBlock.element)).toBe(true);
        });
    });

    describe('append', () => {
        it('should append a child element to the content block', () => {
            const childElement = document.createElement('span');
            contentBlock.append(childElement);
            expect(contentBlock.element.contains(childElement)).toBe(true);
        });

        it('should chain the method call', () => {
            const childElement1 = document.createElement('span');
            const childElement2 = document.createElement('div');
            contentBlock.append(childElement1).append(childElement2);
            expect(contentBlock.element.contains(childElement1)).toBe(true);
            expect(contentBlock.element.contains(childElement2)).toBe(true);
        });
    });
});
