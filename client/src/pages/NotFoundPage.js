import BasePage from './BasePage/BasePage.js';

class NotFoundPage extends BasePage {
    async render() {
        this.element = this.createElement('div', 'not-found-page');

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
