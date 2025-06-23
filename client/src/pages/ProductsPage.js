import BasePage from './BasePage.js';

class ProductsPage extends BasePage {
    async render() {
        console.log('ProductsPage render() called');

        this.element = this.createElement('div', 'products-page');

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
