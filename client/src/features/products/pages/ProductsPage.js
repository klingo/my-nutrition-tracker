import BasePage from '@core/base/BasePage';
import callApi from '@common/utils/callApi';
import { Button, ContentBlock } from '@common/components';

class ProductsPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.pageTitle = 'Products';
        this.setState({
            products: [],
            pagination: {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 0,
                totalPages: 1,
            },
        });
    }

    async componentDidMount() {
        await super.componentDidMount();
        const { currentPage, itemsPerPage } = this.getState().pagination;
        await this.fetchProductsData(currentPage, itemsPerPage);
    }

    async fetchProductsData(page = 1, limit = 10) {
        try {
            this.setState({ loading: true, error: null });
            const response = await callApi('GET', `/api/products?page=${page}&limit=${limit}`, null, {
                signal: this.abortSignal,
            });

            this.setState({ products: response._embedded.products, pagination: response.pagination, loading: false });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching products data:', error);
                this.setState({ error, loading: false });
            }
        }
    }

    async renderContent() {
        console.log('ProductsPage renderContent() called');
        const { products, pagination } = this.getState();

        const productsContentBlock = new ContentBlock();
        if (!products || products.length === 0) {
            productsContentBlock.append(document.createTextNode('No products found.'));
        } else {
            products.forEach((product) => {
                // TODO: implement product rendering
                const productCard = document.createElement('div');
                productCard.textContent = product.name;
                productsContentBlock.append(productCard);
            });
        }

        productsContentBlock.mount(this.element);

        const addProductButton = new Button({
            text: 'Add Product',
            type: 'primary',
            icon: 'add',
            onClick: () => {
                // TODO: open add product overlay
            },
        });
        addProductButton.mount(this.element);

        // TODO: implement pagination
        console.log(pagination);
    }
}

export default ProductsPage;
