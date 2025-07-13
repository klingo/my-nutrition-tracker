import BasePage from '@core/base/BasePage';
import authService from '@common/services/AuthService.js';
import { ContentBlock } from '@common/components/index.js';

class OverviewPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.pageTitle = 'Overview';
    }

    async renderContent() {
        console.log('OverviewPage renderContent() called');
        const { loading, error } = this.getState();

        if (loading) return this.renderLoading();
        if (error) return this.renderError(error);

        const userInfo = authService.getUserInfo();
        const username = userInfo ? userInfo.username : 'User';

        // Welcome Section
        const welcomeContentBlock = new ContentBlock();
        welcomeContentBlock.append(this.createSectionHeading(`Welcome back, ${username}!`));
        welcomeContentBlock.append(this.createElement('p', { textContent: 'Your nutrition tracker dashboard.' }));
        welcomeContentBlock.mount(this.element);
    }

    createSectionHeading(text) {
        const heading = document.createElement('h2');
        heading.textContent = text;
        return heading;
    }
}

export default OverviewPage;
