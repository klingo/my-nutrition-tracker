import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi.js';

class ProfilePage extends BasePage {
    constructor(router) {
        super(router);
        this.userData = null;
        this.loading = false;
        this.error = null;
    }

    async fetchUserData() {
        try {
            this.loading = true;
            this.error = null;

            const response = await callApi('GET', '/api/users/me');
            this.userData = response.data;

            return this.userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            this.error = error.message || 'Failed to load user data';
            return null;
        } finally {
            this.loading = false;
        }
    }

    async render() {
        console.log('ProfilePage render() called');

        this.element = this.createPageElement();

        // Show loading state initially
        this.element.innerHTML = `
            <div class="profile-container">
                <h1>Profile</h1>
                <div id="profile-content">
                    <p>Loading profile data...</p>
                </div>
            </div>
        `;

        try {
            // Fetch user data
            const userData = await this.fetchUserData();

            // Update the content once data is loaded
            const profileContent = this.element.querySelector('#profile-content');

            if (this.error) {
                profileContent.innerHTML = `
                    <div class="error-message">
                        <p>${this.error}</p>
                        <button id="retry-button">Retry</button>
                    </div>
                `;

                // Add retry button event listener
                const retryButton = profileContent.querySelector('#retry-button');
                retryButton.addEventListener('click', async () => {
                    profileContent.innerHTML = '<p>Loading profile data...</p>';
                    await this.fetchUserData();
                    this.updateProfileContent(profileContent);
                });
            } else if (userData) {
                this.updateProfileContent(profileContent);
                profileContent.querySelector('.refresh').addEventListener('click', async () => {
                    const response = await callApi('POST', '/api/users/update-calculations');
                    console.log(response);
                });
            }
        } catch (error) {
            console.error('Error in profile render:', error);
            const profileContent = this.element.querySelector('#profile-content');
            profileContent.innerHTML = `
                <div class="error-message">
                    <p>An unexpected error occurred: ${error.message}</p>
                </div>
            `;
        }

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
