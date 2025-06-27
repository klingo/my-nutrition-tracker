import styles from './LoginPage.module.css';
import BasePage from '../BasePage/BasePage.js';
import authService from '@/services/AuthService.js';
import { spaInstance } from '@/core/Spa.js';
import Input from '@/components/Input';
import { INPUT_ICONS, TYPES } from '@/components/Input/Input.js';
import { ICONS } from '@/components/Button/Button.js';
import { Button } from '@/components';

class LoginPage extends BasePage {
    async render() {
        this.element = this.createElement('div', styles.page);

        const container = document.createElement('div');
        container.classList.add(styles.overlay);

        const logo = document.createElement('div');
        logo.classList.add(styles.icon, styles.home);
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

        const usernameInput = new Input({
            name: 'username',
            id: 'username',
            placeholder: 'Username',
            required: true,
            autocomplete: 'username',
            autofocus: true,
            leadingIcon: INPUT_ICONS.ACCOUNT,
        });
        usernameInput.mount(form);

        const passwordInput = new Input({
            type: TYPES.PASSWORD,
            name: 'password',
            id: 'password',
            placeholder: 'Password',
            required: true,
            autocomplete: 'current-password',
            leadingIcon: INPUT_ICONS.LOCK,
        });
        passwordInput.mount(form);
        // const passwordInput = document.createElement('input');
        // passwordInput.setAttribute('type', 'password');
        // passwordInput.setAttribute('name', 'password');
        // passwordInput.setAttribute('placeholder', 'Password');
        // passwordInput.setAttribute('required', '');
        // passwordInput.setAttribute('autocomplete', 'current-password');
        // passwordInput.setAttribute('id', 'password');
        // passwordInput.setAttribute('aria-describedby', 'password-help');
        // passwordInput.setAttribute('aria-invalid', 'false');
        // passwordInput.setAttribute('aria-required', 'true');
        // passwordInput.setAttribute('aria-label', 'Password');
        // passwordInput.setAttribute('title', 'Password');
        // form.append(passwordInput);

        const logButton = new Button({ children: 'Login', icon: ICONS.LOGIN, type: 'primary' });
        logButton.mount(form);

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
