import BasePage from '@core/base/BasePage';

class ProductsPage extends BasePage {
    constructor(router) {
        super(router);
    }

    async render() {
        console.log('ProductsPage render() called');

        this.element = this.createElement();

        this.element.innerHTML = `
            <div class="overview-container">
                <h1>Products</h1>
                <p>Your nutrition tracker product dashboard.</p>
            </div>
        `;

        return this.element;
    }
}

export default ProductsPage;
