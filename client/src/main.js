import { App } from '@core/App.js';

let appInstance;

document.addEventListener('DOMContentLoaded', async () => {
    appInstance = new App();
    await appInstance.init();
});

export { appInstance };
