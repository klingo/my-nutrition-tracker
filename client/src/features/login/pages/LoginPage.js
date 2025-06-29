import styles from './LoginPage.module.css';
import BasePage from '@core/base/BasePage';
import { defaultAuthenticatedRoute } from '@core/config/routes.js';
import authService from '@common/services/AuthService.js';
import { appInstance } from '@/main.js';
import { INPUT_ICONS, TYPES } from '@common/components/Input/Input.js';
import { BUTTON_ICONS } from '@common/components/Button/Button.js';
import { Button, Input } from '@common/components';
import logo from '@assets/logo/android-chrome-192x192.png';

class LoginPage extends BasePage {
    constructor(router) {
        super(router);
    }

    async render() {
        this.element = this.createPageElement();

        const container = document.createElement('div');
        container.classList.add(styles.overlay);

        const logoImg = document.createElement('img');
        logoImg.setAttribute('src', logo);
        logoImg.setAttribute('alt', '');
        logoImg.setAttribute('aria-hidden', 'true');
        container.append(logoImg);

        const h1 = document.createElement('h1');
        h1.textContent = 'Welcome Back!';
        container.append(h1);

        const form = document.createElement('form');
        form.classList.add(styles.form);
        container.append(form);

        const usernameInput = new Input({
            name: 'username',
            id: 'username',
            label: 'Username',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'username',
            autofocus: true,
            leadingIcon: INPUT_ICONS.PERSON,
        });
        usernameInput.mount(form);

        const passwordInput = new Input({
            type: TYPES.PASSWORD,
            name: 'password',
            id: 'password',
            label: 'Password',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'current-password',
            leadingIcon: INPUT_ICONS.LOCK,
        });
        passwordInput.mount(form);

        const authActions = document.createElement('div');
        authActions.classList.add(styles.authActions);
        form.append(authActions);

        // TODO: introduce new component
        const rememberMeCheckbox = document.createElement('span');
        rememberMeCheckbox.classList.add(styles.rememberMe);
        rememberMeCheckbox.textContent = '[ ] Remember me';
        authActions.append(rememberMeCheckbox);

        // TODO: introduce new component
        const forgotPasswordLink = document.createElement('a');
        forgotPasswordLink.classList.add(styles.forgotPassword);
        forgotPasswordLink.textContent = 'Forgot password?';
        authActions.append(forgotPasswordLink);

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

        const loginButton = new Button({ children: 'Login', icon: BUTTON_ICONS.LOGIN, type: 'primary' });
        loginButton.mount(form);

        // const registerButton = new Button({ children: 'Register', type: 'secondary' });
        // registerButton.mount(container);

        const signupElement = document.createElement('span');
        signupElement.classList.add(styles.signup);
        signupElement.textContent = "Don't have an account? Sign up.";
        container.append(signupElement);

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

                if (appInstance) {
                    await appInstance.renderNavigation();
                }

                // Navigate to overview page
                this.router.navigate(defaultAuthenticatedRoute);
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
