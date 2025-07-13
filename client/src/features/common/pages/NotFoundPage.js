import BasePage from '@core/base/BasePage';
import { ContentBlock } from '@common/components';

class NotFoundPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.pageTitle = '404 - Page Not Found';
    }

    async renderContent() {
        console.log('NotFoundPage renderContent() called');

        // Error Section
        const errorContentBlock = new ContentBlock();
        errorContentBlock.append(
            this.createElement('p', { textContent: "The page you're looking for doesn't exist." }),
        );
        errorContentBlock.mount(this.element);
    }
}

export default NotFoundPage;
