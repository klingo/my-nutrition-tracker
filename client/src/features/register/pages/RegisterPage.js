import styles from './RegisterPage.module.css';
import BasePage from '@core/base/BasePage';
import { Button, Fieldset, Input, Link, MessageBox } from '@common/components';
import authService from '@common/services/AuthService.js';
import { appInstance } from '@/main.js';
import { defaultAuthenticatedRoute } from '@core/config/routes.js';

class RegisterPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.signupButton = null;
        this.handleRegister = this.handleRegister.bind(this);
    }

    async renderContent() {
        console.log('RegisterPage renderContent() called');

        const container = document.createElement('div');
        container.classList.add(styles.overlay);

        const h1 = document.createElement('h1');
        h1.textContent = 'Create Your Account';
        container.append(h1);

        this.messageBoxContainer = document.createElement('div');
        this.messageBoxContainer.classList.add(styles.messageBoxContainer);
        container.append(this.messageBoxContainer);

        const form = document.createElement('form');
        form.classList.add(styles.form);
        form.addEventListener('submit', this.handleRegister);
        container.append(form);

        this.usernameInput = new Input({
            name: 'username',
            id: 'username',
            label: 'Username',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'username',
            icon: 'person',
        });
        this.usernameInput.mount(form);

        this.emailInput = new Input({
            type: 'email',
            name: 'email',
            id: 'email',
            label: 'Email',
            autocorrect: false,
            spellcheck: false,
            required: true,
            autocomplete: 'email',
            icon: 'mail',
            pattern: '^[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$',
            patternErrorMessage: 'Please enter a valid email address',
        });
        this.emailInput.mount(form);

        this.passwordInput = new Input({
            type: 'password',
            name: 'password',
            id: 'password',
            label: 'Password',
            autocorrect: false,
            spellcheck: false,
            required: true,
            minLength: 8,
            autocomplete: 'new-password',
            icon: 'lock',
            pattern: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}',
            patternErrorMessage:
                'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number',
        });
        this.passwordInput.mount(form);

        this.confirmPasswordInput = new Input({
            type: 'password',
            name: 'confirm-password',
            id: 'confirm-password',
            label: 'Confirm Password',
            autocorrect: false,
            spellcheck: false,
            required: true,
            minLength: 8,
            autocomplete: 'new-password',
            icon: 'lock',
            pattern: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}',
            patternErrorMessage:
                'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number',
        });
        this.confirmPasswordInput.mount(form);

        const profileDetailsHeader = document.createElement('h2');
        profileDetailsHeader.textContent = 'Profile Details';
        form.append(profileDetailsHeader);

        // Gender
        const genderFieldset = new Fieldset({ label: 'Gender', icon: 'gender' });
        const genderOptions = ['Male', 'Female', 'Other'];
        genderOptions.forEach((option) => {
            const labelElement = document.createElement('label');
            const inputElement = document.createElement('input');
            inputElement.type = 'radio';
            inputElement.name = 'gender';
            inputElement.value = option.toLowerCase();
            labelElement.append(inputElement, option);
            genderFieldset.append(labelElement);
        });
        genderFieldset.mount(form);

        // Birthday
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        this.birthdayInput = new Input({
            type: 'date',
            name: 'birthday',
            id: 'birthday',
            label: 'Birthday',
            placeholder: 'YYYY-MM-DD',
            autocorrect: false,
            spellcheck: false,
            icon: 'birthday',
            autocomplete: 'bday',
            numberConfig: {
                min: minDate.toISOString().split('T')[0],
                max: new Date().toISOString().split('T')[0],
            },
        });
        this.birthdayInput.mount(form);

        // Height
        this.heightInput = new Input({
            type: 'number',
            name: 'height',
            id: 'height',
            label: 'Height (cm)',
            autocorrect: false,
            spellcheck: false,
            icon: 'height',
            numberConfig: {
                min: 1,
                max: 300,
                step: 1,
            },
        });
        this.heightInput.mount(form);

        // Weight
        this.weightInput = new Input({
            type: 'number',
            name: 'weight',
            id: 'weight',
            label: 'Weight (kg)',
            autocorrect: false,
            spellcheck: false,
            icon: 'weight',
            numberConfig: {
                min: 1,
                max: 1000,
                step: 1,
            },
        });
        this.weightInput.mount(form);

        const termsHeading = document.createElement('h2');
        termsHeading.textContent = 'Terms of Service and Privacy Policy';
        form.append(termsHeading);

        this.signupButton = new Button({
            text: 'Sign up',
            type: 'primary',
            buttonType: 'submit',
        });
        this.signupButton.mount(form);

        // Login Text
        const loginContainer = document.createElement('div');
        container.append(loginContainer);
        const loginElement = document.createElement('span');
        loginElement.classList.add(styles.signup);
        loginElement.textContent = 'Already have an account?';
        loginContainer.append(loginElement);
        const loginLink = new Link({ text: 'Log in', routePath: '/login' });
        loginLink.mount(loginContainer);

        this.element.append(container);
    }

    async handleRegister(event) {
        event.preventDefault();

        let hasError = false;
        this.messageBoxContainer.innerHTML = '';
        const username = this.usernameInput.getValue();
        if (!username) this.#displayErrorMessage('Username is required.');

        const email = this.emailInput.getValue();
        if (!email) this.#displayErrorMessage('Email is required.');

        const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
            hasError = true;
            this.#displayErrorMessage('Please enter a valid email address.');
        }

        const password = this.passwordInput.getValue();
        const confirmPassword = this.confirmPasswordInput.getValue();
        if (password !== confirmPassword) {
            hasError = true;
            this.#displayErrorMessage('Passwords do not match.');
        }

        const height = this.heightInput.getValue();
        if (height && (height < 1 || height > 300)) {
            hasError = true;
            this.#displayErrorMessage('Height must be between 1 and 300.');
        }

        const weight = this.weightInput.getValue();
        if (weight && (weight < 1 || weight > 1000)) {
            hasError = true;
            this.#displayErrorMessage('Weight must be between 1 and 1000.');
        }

        const dateOfBirth = this.birthdayInput.getValue();
        const gender = this.element.querySelector('input[name="gender"]:checked')?.value;
        console.log(dateOfBirth);
        if (hasError) return;

        // Everything is validated
        this.signupButton.setLoading(true).setText('Signing up...');
        this.messageBoxContainer.innerHTML = '';

        try {
            const result = await authService.register(username, email, password, confirmPassword, {
                gender,
                dateOfBirth,
                height,
                weight,
            });
            console.log('Signup result:', result);

            if (result.success) {
                console.log('Signup successful, updating auth state...');

                await appInstance.renderNavigation();

                console.log('Auth state updated, redirecting...');
                this.router.navigate(defaultAuthenticatedRoute);
            } else {
                this.#handleSignupError(result);
            }
        } catch (error) {
            console.error('Register error:', error);
            this.#displayErrorMessage('An unexpected error occurred. Please try again later.');
        } finally {
            this.signupButton.setLoading(false).setText('Sign up');
        }
    }

    #handleSignupError(result) {
        console.log('Handling signup error:', result);
        const { status, message } = result;

        let errorMessage = message | 'Signup failed. Please try again.';

        if (status === 409) {
            errorMessage = 'Username or Email already exists. Please choose a different one.';
        } else if (status === 422) {
            errorMessage = 'Invalid data provided. Please try again.';
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

export default RegisterPage;
