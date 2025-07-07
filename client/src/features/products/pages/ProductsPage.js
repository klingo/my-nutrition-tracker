import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi';
import { Button } from '@common/components';

class ProductsPage extends BasePage {
    constructor(router) {
        super(router);
    }

    async fetchProductsData() {
        try {
            this.loading = true;
            this.error = null;

            const response = await callApi('GET', '/api/products/');
            this.productsData = response.data;

            return this.productsData;
        } catch (error) {
            console.error('Error fetching products data:', error);
            this.error = error.message || 'Failed to load products data';
            return null;
        } finally {
            this.loading = false;
        }
    }

    async render() {
        console.log('ProductsPage render() called');

        this.element = this.createPageElement();

        this.element.innerHTML = `
            <div class="overview-container">
                <h1>Products</h1>
                <p>Your nutrition tracker product dashboard.</p>
            </div>
        `;

        const addProductButton = new Button({
            text: 'Add Product',
            type: 'primary',
            icon: 'add',
            onClick: () => {
                // TODO: open add product overlay
            },
        });
        addProductButton.mount(this.element);

        try {
            const productsData = await this.fetchProductsData();
            console.log(productsData);
        } catch (error) {
            console.error('Error in products render:', error);
        }

        return this.element;
    }
}

export default ProductsPage;
