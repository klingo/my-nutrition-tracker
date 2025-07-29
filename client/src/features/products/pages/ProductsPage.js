import BasePage from '@core/base/BasePage';
import { Button, ContentBlock } from '@common/components';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_midnight.min.css'; // Import the default CSS

class ProductsPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.pageTitle = 'Products';
        this.tabulator = null;
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

    async renderContent() {
        console.log('ProductsPage renderContent() called');

        // Create a content block
        const productsContentBlock = new ContentBlock();

        // Create container for the table
        const tableContainer = document.createElement('div');
        tableContainer.style.marginTop = '20px';
        productsContentBlock.append(tableContainer);

        // Initialize Tabulator in the container
        this.tabulator = new Tabulator(tableContainer, {
            columns: [
                { title: 'Name', field: 'name' },
                { title: 'Package', field: 'package.amount' },
                { title: 'Calories (kcal)', field: 'nutrients.values.energy.kcal', hozAlign: 'right' },
                { title: 'Carbs (g)', field: 'nutrients.values.carbohydrates.total', hozAlign: 'right' },
                { title: 'Fiber (g)', field: 'nutrients.values.carbohydrates.fiber', hozAlign: 'right' },
                { title: 'Protein (g)', field: 'nutrients.values.protein', hozAlign: 'right' },
                { title: 'Fat (g)', field: 'nutrients.values.lipids.total', hozAlign: 'right' },
            ],
            layout: 'fitColumns',
            pagination: 'remote',
            paginationSize: 25,
            paginationSizeSelector: [10, 25, 50, 100],
            ajaxURL: '/api/products',
            ajaxParams: {},
            ajaxConfig: {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            ajaxResponse: (url, params, response) => {
                return response._embedded?.products || [];
            },
            ajaxURLGenerator: (url, config, params) => {
                const query = [];
                if (params.page) query.push(`page=${params.page}`);
                if (params.size) query.push(`limit=${params.size}`);
                if (params.sort?.length) {
                    const sort = params.sort[0];
                    query.push(`sortBy=${sort.field}`);
                    query.push(`sortOrder=${sort.dir === 'asc' ? 'asc' : 'desc'}`);
                }
                return query.length ? `${url}?${query.join('&')}` : url;
            },
        });

        // Add the "Add Product" button
        const addProductButton = new Button({
            text: 'Add Product',
            type: 'primary',
            icon: 'add',
            onClick: () => {
                // TODO: open add product overlay
                this.router.navigate('/products/add');
            },
        });
        addProductButton.mount(productsContentBlock);

        productsContentBlock.mount(this.element);

        return this.element;
    }

    unmount() {
        if (this.tabulator) {
            this.tabulator.destroy();
        }
        super.unmount();
    }
}

export default ProductsPage;
