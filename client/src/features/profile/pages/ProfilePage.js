import styles from './ProfilePage.module.css';
import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi.js';
import { ContentBlock, MasonryContainer } from '@common/components';

class ProfilePage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.pageTitle = 'Profile';

        this.setState({
            userData: null,
        });
    }

    async componentDidMount() {
        await super.componentDidMount();
        await this.fetchUserData();
    }

    async fetchUserData() {
        try {
            this.setState({ loading: true, error: null });
            const response = await callApi('GET', '/api/users/me', null, { signal: this.abortSignal });
            this.setState({ userData: response._embedded.user, loading: false });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching user data:', error);
                this.setState({ error, loading: false });
            }
        }
    }

    async renderContent() {
        console.log('ProfilePage renderContent() called');
        const { userData, loading, error } = this.getState();

        if (loading) return this.renderLoading();

        if (error) return this.renderError(error);

        if (!userData) return this.renderError(new Error('No user data available'));

        const { profile, username, email, accessLevel, status, calculations } = userData;
        const masonryContainer = new MasonryContainer();

        // Account Section
        const accountContentBlock = new ContentBlock();
        accountContentBlock.append(this.createSectionHeading('Account'));
        this.renderField(accountContentBlock, 'Username', username);
        this.renderField(accountContentBlock, 'EMail', email);
        this.renderField(accountContentBlock, 'Account type', accessLevel);
        this.renderField(accountContentBlock, 'Status', status);
        masonryContainer.add(accountContentBlock, { colSpan: 6 });

        // Profile Section
        const profileContentBlock = new ContentBlock();
        profileContentBlock.append(this.createSectionHeading('Profile'));
        this.renderField(profileContentBlock, 'First Name', profile.firstName);
        this.renderField(profileContentBlock, 'Last Name', profile.lastName);
        this.renderField(profileContentBlock, 'Gender', profile.gender);
        this.renderField(profileContentBlock, 'Age', `${profile.age} years`);
        this.renderField(profileContentBlock, 'Date of Birth', profile.dateOfBirth);
        this.renderField(profileContentBlock, 'Height', `${profile.height.value} ${profile.height.unit}`);
        this.renderField(profileContentBlock, 'Weight', `${profile.weight.value} ${profile.weight.unit}`);
        this.renderField(profileContentBlock, 'Activity Level', profile.activityLevel);
        masonryContainer.add(profileContentBlock, { colSpan: 6 });

        // Calculations Section
        const calculationsContentBlock = new ContentBlock();
        calculationsContentBlock.append(this.createSectionHeading('Calculations'));
        this.renderField(calculationsContentBlock, 'Body Mass Index (BMI)', calculations.bmi);
        this.renderField(calculationsContentBlock, 'Basal Metabolic Rate (BMR)', calculations.bmr);
        this.renderField(calculationsContentBlock, 'Total Daily Energy Expenditure (TDEE)', calculations.tdee);
        masonryContainer.add(calculationsContentBlock, { colSpan: 6 });

        masonryContainer.mount(this.element);
    }

    createSectionHeading(text) {
        const heading = document.createElement('h2');
        heading.textContent = text;
        return heading;
    }

    renderField(container, label, value) {
        if (!value) return;

        const fieldContainer = this.createElement('div', { className: styles.fieldContainer });

        const labelElement = this.createElement('span', { className: styles.label });
        labelElement.textContent = `${label}:`;

        const valueElement = this.createElement('span', { className: styles.value });
        valueElement.textContent = value || 'N/A';

        fieldContainer.append(labelElement, valueElement);
        container.append(fieldContainer);
    }
}

export default ProfilePage;
