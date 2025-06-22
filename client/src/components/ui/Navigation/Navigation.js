import authService from '@/services/AuthService.js';
import { spaInstance } from '@/core/Spa.js';

class Navigation {
    constructor() {
        this.element = null;
    }

    async render() {
        const isAuthenticated = await authService.isAuthenticated();

        this.element = document.createElement('nav');
        this.element.className = 'main-navigation';

        if (isAuthenticated) {
            // Authenticated user navigation
            this.element.innerHTML = `
                <ul>
                    <li><a href="#" data-navigate="/overview">Overview</a></li>
                    <li><a href="#" data-navigate="/log-intake">Log Intake</a></li>
                    <li><button class="logout-btn">Logout</button></li>
                </ul>
            `;

            // Add logout functionality
            const logoutBtn = this.element.querySelector('.logout-btn');
            logoutBtn.addEventListener('click', async () => {
                authService.logout();

                if (spaInstance) {
                    await spaInstance.refreshNavigation();
                }

                if (spaInstance?.router) {
                    spaInstance.router.navigate('/login');
                }
            });
        } else {
            // Guest navigation
            this.element.innerHTML = `
                <ul>
                    <li><a href="#" data-navigate="/login">Login</a></li>
                </ul>
            `;
        }

        return this.element;
    }
}

export default Navigation;
