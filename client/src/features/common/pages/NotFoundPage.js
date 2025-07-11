import BasePage from '@core/base/BasePage';

class NotFoundPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
    }

    async render() {
        console.log('NotFoundPage render() called');

        this.element = this.createPageElement();

        this.element.innerHTML = `
            <div class="not-found-container">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="#" data-navigate="/">Go to Overview</a>
            </div>
        `;

        return this.element;
    }
}

export default NotFoundPage;
