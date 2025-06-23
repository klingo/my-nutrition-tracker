import styles from './LoginPage.module.css';
import accountCircle from '@/assets/icons/actions/account_circle_24dp.svg';
import BasePage from '../BasePage.js';
import authService from '@/services/AuthService.js';
import { spaInstance } from '@/core/Spa.js';

class LoginPage extends BasePage {
    async render() {
        this.element = this.createElement('div', styles.page);

        const container = document.createElement('div');
        container.classList.add(styles.overlay);

        const logo = document.createElement('img');
        logo.setAttribute('src', accountCircle);
        logo.setAttribute('alt', '');
        logo.setAttribute('aria-hidden', 'true');
        container.append(logo);

        const h1 = document.createElement('h1');
        h1.textContent = 'Welcome Back!';
        container.append(h1);

        const h2 = document.createElement('h2');
        h2.textContent = "Don't have an account yet? Too bad! :-(";
        container.append(h2);

        const form = document.createElement('form');
        form.classList.add(styles.form);
        container.append(form);

        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('type', 'text');
        usernameInput.setAttribute('name', 'username');
        usernameInput.setAttribute('placeholder', 'Username');
        usernameInput.setAttribute('required', '');
        usernameInput.setAttribute('autocomplete', 'username');
        usernameInput.setAttribute('autofocus', '');
        usernameInput.setAttribute('id', 'username');
        usernameInput.setAttribute('aria-describedby', 'username-help');
        usernameInput.setAttribute('aria-invalid', 'false');
        usernameInput.setAttribute('aria-required', 'true');
        usernameInput.setAttribute('aria-label', 'Username');
        form.append(usernameInput);

        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.setAttribute('name', 'password');
        passwordInput.setAttribute('placeholder', 'Password');
        passwordInput.setAttribute('required', '');
        passwordInput.setAttribute('autocomplete', 'current-password');
        passwordInput.setAttribute('id', 'password');
        passwordInput.setAttribute('aria-describedby', 'password-help');
        passwordInput.setAttribute('aria-invalid', 'false');
        passwordInput.setAttribute('aria-required', 'true');
        passwordInput.setAttribute('aria-label', 'Password');
        passwordInput.setAttribute('title', 'Password');
        form.append(passwordInput);

        const loginButton = document.createElement('button');
        loginButton.setAttribute('type', 'submit');
        loginButton.textContent = 'Login';
        loginButton.setAttribute('id', 'login-button');
        loginButton.setAttribute('aria-label', 'Login');
        loginButton.setAttribute('title', 'Login');
        form.append(loginButton);

        this.element.append(container);

        return this.element;
    }

    mount() {
        // Add event listeners specific to this page
        const form = this.element.querySelector(`.${styles.form}`);
        form.addEventListener('submit', this.handleLogin.bind(this));
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        // const messageDiv = this.element.querySelector('.login-message');
        // messageDiv.innerHTML = '<p>Logging in...</p>';

        try {
            const result = await authService.login(username, password);

            if (result.success) {
                // messageDiv.innerHTML = '<p style="color: green;">Login successful!</p>';

                if (spaInstance) {
                    await spaInstance.renderNavigation();
                }

                // Navigate to overview page
                setTimeout(() => {
                    this.router.navigate('/overview');
                }, 1000);
            } else {
                // messageDiv.innerHTML = '<p style="color: red;">Login failed!</p>';
            }
        } catch (error) {
            console.error('Login error:', error);
            // messageDiv.innerHTML = '<p style="color: red;">Login failed. Please try again.</p>';
        }
    }
}

export default LoginPage;
