import styles from './LoginPage.module.css';
import BasePage from '@core/base/BasePage';
import { defaultAuthenticatedRoute } from '@core/config/routes.js';
import authService from '@common/services/AuthService.js';
import { appInstance } from '@/main.js';
import { Button, Input, MessageBox } from '@common/components';
import logo from '@assets/logo/android-chrome-192x192.png';

class LoginPage extends BasePage {
    constructor(router) {
        super(router);
        this.loginButton = null;
        this.isLoading = false;
        this.messageBoxContainer = null;
    }

    async render() {
        console.log('LoginPage render() called');

        this.element = this.createPageElement();
        const rowElement = this.addRow({ justifyContent: 'center' });
        const colElement = this.addCol({ rowElement });

        // TODO: replace with contentBlock?
        const container = document.createElement('div');
        container.classList.add(styles.overlay);
        colElement.append(container);

        const logoImg = document.createElement('img');
        logoImg.setAttribute('src', logo);
        logoImg.setAttribute('alt', '');
        logoImg.setAttribute('aria-hidden', 'true');
        container.append(logoImg);

        const h1 = document.createElement('h1');
        h1.textContent = 'Welcome Back!';
        container.append(h1);

        this.messageBoxContainer = document.createElement('div');
        this.messageBoxContainer.classList.add(styles.messageBoxContainer);
        container.append(this.messageBoxContainer);

        const form = document.createElement('form');
        form.classList.add(styles.form);
        form.addEventListener('submit', this.handleLogin.bind(this));
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
            icon: 'person',
        });
        usernameInput.mount(form);

        const passwordInput = new Input({
            type: 'password',
            name: 'password',
            id: 'password',
            label: 'Password',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'current-password',
            icon: 'lock',
        });
        passwordInput.mount(form);

        const authActions = document.createElement('div');
        authActions.classList.add(styles.authActions);
        form.append(authActions);

        // TODO: introduce new component
        const rememberMeCheckbox = document.createElement('span');
        rememberMeCheckbox.classList.add(styles.rememberMe);
        rememberMeCheckbox.textContent = '[X] Remember me';
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

        this.loginButton = new Button({
            text: 'Login',
            type: 'primary',
            icon: 'login',
        });
        this.loginButton.mount(form);

        // const registerButton = new Button({ children: 'Register', type: 'secondary' });
        // registerButton.mount(container);

        const signupElement = document.createElement('span');
        signupElement.classList.add(styles.signup);
        signupElement.textContent = "Don't have an account? Sign up.";
        container.append(signupElement);

        return this.element;
    }

    async handleLogin(event) {
        event.preventDefault();

        if (this.isLoading) return;
        this.isLoading = true;
        this.messageBoxContainer.innerHTML = '';

        if (this.loginButton) {
            this.loginButton.setLoading(true).setText('Loading...');
        }

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const result = await authService.login(username, password);
            if (result.success) {
                await appInstance.renderNavigation();
                this.router.navigate(defaultAuthenticatedRoute);
            } else {
                if (result.status === 401) {
                    this.#displayErrorMessage(
                        'Sorry, the username and password you entered did not match our records. Please double-check and try again.',
                    );
                } else if (result.status === 403) {
                    this.#displayErrorMessage('Your account is blocked.');
                } else if (result.status === 429) {
                    this.#displayErrorMessage('Too many login attempts. Please try again later.');
                } else if (result.status === 500) {
                    this.#displayErrorMessage(
                        'My Nutrition Tracker is temporarily unavailable. Please try again later.',
                    );
                } else {
                    this.#displayErrorMessage(result.message);
                }
            }
        } catch (error) {
            console.log(error);
            this.#displayErrorMessage('An unexpected error occurred. Please try again later.');
        } finally {
            this.isLoading = false;
            if (this.loginButton) {
                this.loginButton.setLoading(false).setText('Login');
            }
        }
    }

    #displayErrorMessage(message) {
        const messageBox = new MessageBox({ type: 'error', message });
        messageBox.mount(this.messageBoxContainer);
    }
}

export default LoginPage;
