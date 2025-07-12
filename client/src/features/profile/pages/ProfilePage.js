import styles from './ProfilePage.module.css';
import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi.js';
import { ContentBlock, MasonryContainer, MessageBox } from '@common/components';

class ProfilePage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.userData = null;
        this.loading = false;
        this.error = null;
    }

    async fetchUserData() {
        try {
            this.loading = true;
            this.error = null;

            const response = await callApi('GET', '/api/users/me', null, { signal: this.abortSignal });
            this.userData = response.data;

            return this.userData;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted due to navigation');
                return null;
            }
            console.error('Error fetching user data:', error);
            this.error = error;
            return null;
        } finally {
            this.loading = false;
        }
    }

    async render() {
        console.log('ProfilePage render() called');

        this.element = this.createPageElement({ pageHeading: 'Profile' });

        try {
            // Fetch user data
            const userData = await this.fetchUserData();

            if (userData) {
                const { profile, username, email, accessLevel, status, calculations } = this.userData;

                // Create a masonry container
                const masonryContainer = new MasonryContainer();
                masonryContainer.mount(this.element);

                // Add account content block
                const accountContentBlock = new ContentBlock();
                accountContentBlock.textContent = '1';
                masonryContainer.add(accountContentBlock, { colSpan: 6 });

                const accountFields = [
                    { label: 'Username', value: username },
                    { label: 'EMail', value: email },
                    { label: 'Account type', value: accessLevel },
                    { label: 'Status', value: status },
                ];
                accountFields.forEach(({ label, value }) => {
                    const fieldContainer = this.createElement('div', styles.fieldContainer);
                    const labelElement = this.createElement('span', styles.label);
                    const valueElement = this.createElement('span', styles.value);

                    labelElement.textContent = `${label}:`;
                    valueElement.textContent = value;

                    fieldContainer.append(labelElement, valueElement);
                    accountContentBlock.append(fieldContainer);
                });

                // Add profile content block
                const profileContentBlock = new ContentBlock();
                profileContentBlock.textContent = '2';
                masonryContainer.add(profileContentBlock, { colSpan: 6 });

                const profileFields = [
                    { label: 'First name', value: profile.firstName },
                    { label: 'Last name', value: profile.lastName },
                    { label: 'Gender', value: profile.gender },
                    { label: 'Age', value: `${profile.age} years` },
                    { label: 'Date of Birth', value: profile.dateOfBirth },
                    { label: 'Height', value: `${profile.height.value} ${profile.height.unit}` },
                    { label: 'Weight', value: `${profile.weight.value} ${profile.weight.unit}` },
                    { label: 'Activity level', value: profile.activityLevel },
                ];
                profileFields.forEach(({ label, value }) => {
                    const fieldContainer = this.createElement('div', styles.fieldContainer);
                    const labelElement = this.createElement('span', styles.label);
                    const valueElement = this.createElement('span', styles.value);

                    labelElement.textContent = `${label}:`;
                    valueElement.textContent = value;

                    fieldContainer.append(labelElement, valueElement);
                    profileContentBlock.append(fieldContainer);
                });

                // Add calculations content block
                const calculationsContentBlock = new ContentBlock();
                calculationsContentBlock.textContent = '3';
                masonryContainer.add(calculationsContentBlock, { colSpan: 6 });

                const calculationFields = [
                    { label: 'Body Mass Index (BMI)', value: calculations.bmi },
                    { label: 'Basal Metabolic Rate (BMR)', value: calculations.bmr },
                    { label: 'Total Daily Energy Expenditure (TDEE)', value: calculations.tdee },
                ];
                calculationFields.forEach(({ label, value }) => {
                    const fieldContainer = this.createElement('div', styles.fieldContainer);
                    const labelElement = this.createElement('span', styles.label);
                    const valueElement = this.createElement('span', styles.value);

                    labelElement.textContent = `${label}:`;
                    valueElement.textContent = value;

                    fieldContainer.append(labelElement, valueElement);
                    calculationsContentBlock.append(fieldContainer);
                });
            } else {
                // Handle the error case
                const messageBox = new MessageBox({
                    type: 'error',
                    message: this.error.message || 'Failed to load user data',
                });
                messageBox.mount(this.element);
            }
        } catch (error) {
            console.error('Unexpected error in render:', error);
            const messageBox = new MessageBox({
                type: 'error',
                message: error.message || 'An unexpected error occurred',
            });
            messageBox.mount(this.element);
        }

        // TODO: Show loading state initially

        // try {
        //     // Fetch user data
        //     const userData = await this.fetchUserData();
        //
        //     // Update the content once data is loaded
        //     const profileContent = this.element.querySelector('#profile-content');
        //
        //     if (this.error) {
        //         profileContent.innerHTML = `
        //             <div class="error-message">
        //                 <p>${this.error}</p>
        //                 <button id="retry-button">Retry</button>
        //             </div>
        //         `;
        //
        //         // Add retry button event listener
        //         const retryButton = profileContent.querySelector('#retry-button');
        //         retryButton.addEventListener('click', async () => {
        //             profileContent.innerHTML = '<p>Loading profile data...</p>';
        //             await this.fetchUserData();
        //             this.updateProfileContent(profileContent);
        //         });
        //     } else if (userData) {
        //         this.updateProfileContent(profileContent);
        //         profileContent.querySelector('.refresh').addEventListener('click', async () => {
        //             const response = await callApi('POST', '/api/users/update-calculations');
        //             console.log(response);
        //         });
        //     }
        // } catch (error) {
        //     console.error('Error in profile render:', error);
        //     const profileContent = this.element.querySelector('#profile-content');
        //     profileContent.innerHTML = `
        //         <div class="error-message">
        //             <p>An unexpected error occurred: ${error.message}</p>
        //         </div>
        //     `;
        // }

        return this.element;
    }

    updateProfileContent(contentElement) {
        if (!this.userData) return;

        const { profile, username, email, accessLevel, isBlocked, calculations } = this.userData;

        contentElement.innerHTML = `
            <div class="profile-details">
                <h2>User Information</h2>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Access:</strong> ${accessLevel}</p>
                <p><strong>Blocked:</strong> ${isBlocked}</p>

                <h2>Personal Details</h2>
                <p><strong>Name:</strong> ${profile.firstName} ${profile.lastName}</p>
                <p><strong>Date of Birth:</strong> ${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Gender:</strong> ${profile.gender || 'Not set'}</p>

                <h2>Physical Details</h2>
                <p><strong>Height:</strong> ${profile.height?.value ? `${profile.height.value} ${profile.height.unit}` : 'Not set'}</p>
                <p><strong>Weight:</strong> ${profile.weight?.value ? `${profile.weight.value} ${profile.weight.unit}` : 'Not set'}</p>
                <p><strong>Activity Level:</strong> ${profile.activityLevel || 'Not set'}</p>

                <h2>Calculations</h2>
                <p><strong>Body Mass Index (BMI):</strong> ${calculations?.bmi ? `${calculations.bmi}` : 'Not available'}</p>
                <p><strong>Basal Metabolic Rate (BMR):</strong> ${calculations?.bmr ? `${calculations.bmr} calories/day` : 'Not available'}</p>
                <p><strong>Total Daily Energy Expenditure (TDEE):</strong> ${calculations?.tdee ? `${calculations.tdee} calories/day` : 'Not available'}</p>
                <p><strong>Update:</strong><button class="refresh">Refresh</button></p>
            </div>
        `;
    }
}

export default ProfilePage;
