import BasePage from './BasePage.js';
import authService from '@/services/AuthService.js';

class OverviewPage extends BasePage {
    async render() {
        console.log('OverviewPage render() called');

        const userInfo = authService.getUserInfo();
        const username = userInfo ? userInfo.username : 'User';

        this.element = this.createElement('div', 'overview-page');

        this.element.innerHTML = `
            <div class="overview-container">
                <h1>Overview</h1>
                <p>Welcome back, ${username}!</p>
                <p>Your nutrition tracker dashboard.</p>
                <nav>
                    <a href="#" data-navigate="/log-intake">Log Intake</a>
                </nav>
            </div>
        `;

        return this.element;
    }
}

export default OverviewPage;
