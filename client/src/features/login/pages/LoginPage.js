import styles from './LoginPage.module.css';
import BasePage from '@core/base/BasePage';
import { defaultAuthenticatedRoute } from '@core/config/routes.js';
import authService from '@common/services/AuthService.js';
import { appInstance } from '@/main.js';
import { Button, Input, MessageBox } from '@common/components';
import logo from '@assets/logo/android-chrome-192x192.png';

class LoginPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.loginButton = null;
        this.messageBoxContainer = null;
        this.handleLogin = this.handleLogin.bind(this);
    }

    async renderContent() {
        console.log('LoginPage renderContent() called');

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

        this.messageBoxContainer = document.createElement('div');
        this.messageBoxContainer.classList.add(styles.messageBoxContainer);
        container.append(this.messageBoxContainer);

        const form = document.createElement('form');
        form.classList.add(styles.form);
        container.append(form);

        this.usernameInput = new Input({
            name: 'username',
            id: 'username',
            label: 'Username or Email',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'username',
            autofocus: true,
            icon: 'person',
        });
        this.usernameInput.mount(form);

        this.passwordInput = new Input({
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
        this.passwordInput.mount(form);

        // Auth Actions
        const authActions = document.createElement('div');
        authActions.classList.add(styles.authActions);
        form.append(authActions);

        // Remember Me
        // TODO: introduce new component
        const rememberMeCheckbox = document.createElement('span');
        rememberMeCheckbox.classList.add(styles.rememberMe);
        rememberMeCheckbox.textContent = '[X] Remember me';
        authActions.append(rememberMeCheckbox);

        // Forgot Password
        // TODO: introduce new component
        const forgotPasswordLink = document.createElement('a');
        forgotPasswordLink.classList.add(styles.forgotPassword);
        forgotPasswordLink.textContent = 'Forgot password?';
        authActions.append(forgotPasswordLink);

        // Login Button
        this.loginButton = new Button({
            text: 'Login',
            type: 'primary',
            icon: 'login',
            onClick: (e) => {
                e.preventDefault();
                this.handleLogin(e);
            },
        });
        this.loginButton.mount(form);

        // const registerButton = new Button({ children: 'Register', type: 'secondary' });
        // registerButton.mount(container);

        // Sign Up Text
        const signupElement = document.createElement('span');
        signupElement.classList.add(styles.signup);
        signupElement.textContent = "Don't have an account? Sign up.";
        container.append(signupElement);

        this.element.append(container);
    }

    async handleLogin(event) {
        event.preventDefault();

        const username = this.usernameInput.getValue();
        const password = this.passwordInput.getValue();

        this.loginButton.setLoading(true).setText('Loading...');
        this.messageBoxContainer.innerHTML = '';

        try {
            console.log('Calling authService.login with:', username, '***'); // Don't log password
            const result = await authService.login(username, password);
            console.log('Login result:', result);

            if (result.success) {
                console.log('Login successful, updating auth state...');

                await appInstance.renderNavigation();

                console.log('Auth state updated, redirecting...');
                this.router.navigate(defaultAuthenticatedRoute);
            } else {
                this.#handleLoginError(result);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.#displayErrorMessage('An unexpected error occurred. Please try again later.');
        } finally {
            this.loginButton.setLoading(false).setText('Login');
        }
    }

    #handleLoginError(result) {
        console.log('Handling login error:', result);
        const { status, message } = result;

        let errorMessage = message || 'Login failed. Please try again.';

        if (status === 401) {
            errorMessage =
                'Sorry, the username and password you entered did not match our records. Please double-check and try again.';
        } else if (status === 403) {
            errorMessage = 'Your account is blocked.';
        } else if (status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
        } else if (status === 500) {
            errorMessage = 'My Nutrition Tracker is temporarily unavailable. Please try again later.';
        }

        console.log('Displaying error message:', errorMessage);
        this.#displayErrorMessage(errorMessage);
    }

    #displayErrorMessage(message) {
        console.log('Displaying message box with message:', message);

        // Clear any existing messages first
        this.messageBoxContainer.innerHTML = '';

        // Create and mount the new message box
        const messageBox = new MessageBox({ type: 'error', message });
        messageBox.mount(this.messageBoxContainer);
    }
}

export default LoginPage;
