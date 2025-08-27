import styles from './ProfilePage.module.css';
import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi.js';
import { Button, ContentBlock, MasonryContainer, Input, RadioButtons, Fieldset } from '@common/components';

class ProfilePage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.pageTitle = 'Profile';

        this.setState({
            userData: null,
            editProfile: false,
            saving: false,
            formError: null,
        });

        this.handleProfileSave = this.handleProfileSave.bind(this);
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
        const containerWidth = 380;
        const { userData, loading, error, editProfile, saving } = this.getState();

        if (loading) return this.renderLoading();

        if (error) return this.renderError(error);

        if (!userData) return this.renderError(new Error('No user data available'));

        const { profile, username, email, accessLevel, status } = userData;
        const masonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });

        // Account Section
        const accountContentBlock = new ContentBlock();
        accountContentBlock.append(this.createSectionHeading('Account'));
        this.renderField(accountContentBlock, 'Username', username);
        this.renderField(accountContentBlock, 'EMail', email);
        this.renderField(accountContentBlock, 'Account type', accessLevel);
        this.renderField(accountContentBlock, 'Status', status);
        masonryContainer.add(accountContentBlock, { fixedWidth: containerWidth });

        // Profile Section
        const profileContentBlock = new ContentBlock();
        profileContentBlock.append(this.createSectionHeading('Profile'));
        if (!editProfile) {
            this.renderField(profileContentBlock, 'First Name', profile.firstName);
            this.renderField(profileContentBlock, 'Last Name', profile.lastName);
            this.renderField(profileContentBlock, 'Gender', profile.gender);
            this.renderField(profileContentBlock, 'Date of Birth', profile.dateOfBirth);
            this.renderField(
                profileContentBlock,
                'Height',
                profile.height?.value != null && profile.height?.unit
                    ? `${profile.height.value} ${profile.height.unit}`
                    : '',
            );
            this.renderField(
                profileContentBlock,
                'Weight',
                profile.weight?.value != null && profile.weight?.unit
                    ? `${profile.weight.value} ${profile.weight.unit}`
                    : '',
            );
            this.renderField(profileContentBlock, 'Activity Level', profile.activityLevel);
            const profileActions = document.createElement('div');
            profileActions.classList.add(styles.actions);
            const editProfileButton = new Button({
                text: 'Edit Profile',
                type: 'secondary',
                onClick: () => {
                    this.setState({ loading: true, editProfile: true }, () => {
                        setTimeout(() => this.setState({ loading: false }), 0);
                    });
                },
            });
            editProfileButton.mount(profileActions);
            profileContentBlock.append(profileActions);
        } else {
            const form = document.createElement('form');
            form.onsubmit = this.handleProfileSave;

            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 120);

            const rows = [
                {
                    label: 'First Name',
                    input: {
                        type: 'text',
                        name: 'firstName',
                        autocomplete: 'given-name',
                        value: profile.firstName || '',
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Last Name',
                    input: {
                        type: 'text',
                        name: 'lastName',
                        autocomplete: 'family-name',
                        value: profile.lastName || '',
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Gender',
                    radioButtons: {
                        name: 'gender',
                        value: profile.gender.toLowerCase() || '',
                        options: [
                            { value: 'male', text: 'Male' },
                            { value: 'female', text: 'Female' },
                            { value: 'other', text: 'Other' },
                        ],
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Date of Birth',
                    input: {
                        type: 'date',
                        name: 'dateOfBirth',
                        placeholder: 'YYYY-MM-DD',
                        autocorrect: false,
                        spellcheck: false,
                        autocomplete: 'bday',
                        numberConfig: {
                            min: minDate.toISOString().split('T')[0],
                            max: new Date().toISOString().split('T')[0],
                        },
                        value: profile.dateOfBirth || '',
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Height',
                    input: {
                        type: 'number',
                        name: 'height.value',
                        autocorrect: false,
                        spellcheck: false,
                        value: profile.height?.value ?? '',
                        numberConfig: {
                            min: 1,
                            max: 300,
                            step: 1,
                            inputmode: 'numeric',
                            suffix: profile.height?.unit || 'cm',
                        },
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Weight',
                    input: {
                        type: 'number',
                        name: 'weight.value',
                        autocorrect: false,
                        spellcheck: false,
                        value: profile.weight?.value ?? '',
                        numberConfig: {
                            min: 1,
                            max: 1000,
                            step: 1,
                            inputmode: 'numeric',
                            suffix: profile.weight?.unit || 'kg',
                        },
                        // width: '160px',
                        compact: true,
                    },
                },
                {
                    label: 'Activity Level',
                    input: {
                        name: 'activityLevel',
                        type: 'text',
                        value: profile.activityLevel || '',
                        // width: '180px',
                        compact: true,
                    },
                },
            ];

            for (const rowConfig of rows) {
                const row = this.createElement('div', { className: styles.fieldContainer });
                const label = this.createElement('label', { className: styles.label });
                label.textContent = `${rowConfig.label}:`;
                row.append(label);

                const valueContainer = document.createElement('div');
                valueContainer.classList.add(styles.value);
                if (Object.prototype.hasOwnProperty.call(rowConfig, 'input')) {
                    const input = new Input(rowConfig.input);
                    input.mount(valueContainer);
                } else if (Object.prototype.hasOwnProperty.call(rowConfig, 'radioButtons')) {
                    const fieldset = new Fieldset();
                    const radioButtons = new RadioButtons(rowConfig.radioButtons);
                    radioButtons.mount(fieldset);
                    fieldset.mount(valueContainer);
                }
                row.append(valueContainer);

                form.append(row);
            }

            const profileActions = document.createElement('div');
            profileActions.classList.add(styles.actions);
            const saveButton = new Button({
                text: saving ? 'Saving...' : 'Save',
                type: 'primary',
                buttonType: 'submit',
                disabled: saving,
            });
            saveButton.mount(profileActions);

            const cancelButton = new Button({
                text: 'Cancel',
                type: 'mute',
                onClick: () => {
                    this.setState({ loading: true, editProfile: false, formError: null }, () => {
                        setTimeout(() => this.setState({ loading: false }), 0);
                    });
                },
            });
            cancelButton.mount(profileActions);

            form.append(profileActions);
            profileContentBlock.append(form);
        }

        masonryContainer.add(profileContentBlock, { fixedWidth: containerWidth });

        // Calculations Section
        const calculationsContentBlock = new ContentBlock();
        calculationsContentBlock.append(this.createSectionHeading('Calculations'));
        this.renderField(calculationsContentBlock, 'Age', profile.age ? `${profile.age} years` : '');
        this.renderField(calculationsContentBlock, 'Body Mass Index (BMI)', profile.calculations?.bmi);
        this.renderField(calculationsContentBlock, 'Basal Metabolic Rate (BMR)', profile.calculations?.bmr);
        this.renderField(calculationsContentBlock, 'Total Daily Energy Expenditure (TDEE)', profile.calculations?.tdee);
        masonryContainer.add(calculationsContentBlock, { fixedWidth: containerWidth });

        // Mount Masonry into the page element
        masonryContainer.mount(this.element);
    }

    async handleProfileSave(e) {
        e.preventDefault();
        const form = e.target;

        // basic validation via HTML5 constraints
        const inputs = form.querySelectorAll('input');
        for (const input of inputs) {
            if (!input.checkValidity()) return;
        }

        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());
        const currentProfile = this.getState().userData?.profile || {};

        const payload = {
            profile: {
                firstName: (values['firstName'] || '').trim(),
                lastName: (values['lastName'] || '').trim(),
                gender: values['gender'] || null,
                dateOfBirth: values['dateOfBirth'] || null,
                height: {
                    unit: currentProfile.height?.unit || 'cm',
                    value: values['height.value'] !== '' ? Number(values['height.value']) : null,
                },
                weight: {
                    unit: currentProfile.weight?.unit || 'kg',
                    value: values['weight.value'] !== '' ? Number(values['weight.value']) : null,
                },
                activityLevel: values['activityLevel'] || null,
            },
        };

        try {
            this.setState({ saving: true, formError: null });
            await callApi('PATCH', '/api/users/me', payload, { signal: this.abortSignal });
            await this.fetchUserData(); // refresh to update calculations
            this.setState({ editProfile: false });
        } catch (err) {
            console.error('Update profile failed', err);
            this.setState({ formError: err });
        } finally {
            this.setState({ saving: false });
        }
    }

    createSectionHeading(text) {
        const heading = document.createElement('h2');
        heading.textContent = text;
        return heading;
    }

    renderField(container, label, value) {
        if (value === undefined) return;

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
