import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi';
import { Button } from '@common/components';

class ProductsPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.productsData = null;
        this.loading = false;
        this.error = null;
    }

    async fetchProductsData() {
        try {
            this.loading = true;
            this.error = null;

            const response = await callApi('GET', '/api/products/', null, { signal: this.abortSignal });
            this.productsData = response.data;

            return this.productsData;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted due to navigation');
                return null;
            }
            console.error('Error fetching products data:', error);
            this.error = error;
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
