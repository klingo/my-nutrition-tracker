import BasePage from './BasePage.js';
import authService from '@/services/AuthService.js';
import { spaInstance } from '@/core/Spa.js';

class LoginPage extends BasePage {
    async render() {
        this.element = this.createElement('div', 'login-page');

        this.element.innerHTML = `
      <div class="login-container">
        <h1>Login</h1>
        <div class="login-message"></div>
        <form class="login-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input id="username" name="username" placeholder="Username" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    `;

        return this.element;
    }

    mount() {
        // Add event listeners specific to this page
        const form = this.element.querySelector('.login-form');
        form.addEventListener('submit', this.handleLogin.bind(this));
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const messageDiv = this.element.querySelector('.login-message');
        messageDiv.innerHTML = '<p>Logging in...</p>';

        try {
            const result = await authService.login(username, password);

            if (result.success) {
                messageDiv.innerHTML = '<p style="color: green;">Login successful!</p>';

                if (spaInstance) {
                    await spaInstance.refreshNavigation();
                }

                // Navigate to overview page
                setTimeout(() => {
                    this.router.navigate('/overview');
                }, 1000);
            } else {
                messageDiv.innerHTML = '<p style="color: red;">Login failed!</p>';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.innerHTML = '<p style="color: red;">Login failed. Please try again.</p>';
        }
    }
}

export default LoginPage;
