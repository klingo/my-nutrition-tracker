import styles from './ProductAddPage.module.css';
import BasePage from '@core/base/BasePage';
import { Button, ContentBlock, Input, MasonryContainer } from '@common/components';
import {
    getCarbohydratesEntries,
    getGeneralEntries,
    getLipidsEntries,
    getMineralsEntries,
    getProteinsEntries,
    getVitaminsEntries,
} from '@features/products/constants/productFormConfig';

class ProductAddPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.pageTitle = 'Add New Product';
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    renderContent() {
        const contentBlock = new ContentBlock();
        const form = document.createElement('form');
        form.name = 'product-form';
        form.onsubmit = this.handleSubmit;

        // Add form fields
        const productFields = [
            { name: 'name', label: 'Product Name', type: 'text', required: true, minLength: 5, maxLength: 100 },
            { name: 'brand', label: 'Brand', type: 'text' },
            // { name: 'category', label: 'Category', type: 'text' },
            { name: 'barcode', label: 'Barcode', type: 'text', icon: 'barcode' },
            {
                name: 'packageAmount',
                label: 'Package size (g)',
                type: 'number',
                icon: 'package-size',
                required: true,
                numberConfig: { min: 0, max: 9999, step: 1 },
            },
            {
                name: 'referenceAmount',
                label: 'Reference amount (g)',
                type: 'number',
                icon: 'serving-size',
                required: true,
                value: 100,
                numberConfig: { min: 0, max: 9999, step: 1 },
            },
        ];

        // Product
        const productHeading = this.createSectionHeading('Product Information');
        form.append(productHeading);
        const productMasonryContainer = new MasonryContainer({ layoutMode: 'fixedWidth' });
        productFields.forEach((field) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '15px';

            const input = new Input({
                type: field.type,
                name: field.name,
                label: field.label,
                icon: field.icon,
                required: field.required,
                value: field.value,
                numberConfig: field.numberConfig,
            });

            wrapper.append(input.render());
            productMasonryContainer.add(wrapper, { fixedWidth: 270 });
        });
        productMasonryContainer.mount(form);

        const options = { textAlignRight: true, compact: true };
        this.#renderSection(form, 'General', getGeneralEntries(options));
        this.#renderSection(form, 'Carbohydrates', getCarbohydratesEntries(options));
        this.#renderSection(form, 'Lipids', getLipidsEntries(options));
        this.#renderSection(form, 'Proteins', getProteinsEntries(options));
        this.#renderSection(form, 'Minerals', getMineralsEntries(options));
        this.#renderSection(form, 'Vitamins', getVitaminsEntries(options));

        // Add Submit button
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '20px';
        const submitButton = new Button({
            text: 'Add Product',
            type: 'primary',
            buttonType: 'submit',
        });
        submitButton.mount(buttonWrapper);
        form.append(buttonWrapper);

        contentBlock.append(form);
        contentBlock.mount(this.element);
        return this.element;
    }

    #renderSection(form, headingText, entries) {
        // https://cronometer.com/#custom-foods
        const tableElement = document.createElement('table');

        const tableHeadElement = document.createElement('thead');
        tableElement.append(tableHeadElement);
        const headerRow = document.createElement('tr');
        tableHeadElement.append(headerRow);
        const headerSectionCell = document.createElement('th');
        headerSectionCell.textContent = headingText;
        headerRow.append(headerSectionCell);
        const headerAmountCell = document.createElement('th');
        headerAmountCell.textContent = 'Amount';
        headerRow.append(headerAmountCell);
        const headerUnitCell = document.createElement('th');
        headerUnitCell.textContent = '';
        headerRow.append(headerUnitCell);

        const tableBodyElement = document.createElement('tbody');
        tableElement.append(tableBodyElement);

        for (const entry of entries || []) {
            const row = document.createElement('tr');
            tableBodyElement.append(row);

            const sectionCell = document.createElement('td');
            const label = document.createElement('label');
            label.textContent = entry.name;
            if (entry.inputConfig?.id) label.htmlFor = entry.inputConfig?.id;
            sectionCell.append(label);
            row.append(sectionCell);

            const amountCell = document.createElement('td');
            if (entry.inputConfig) {
                const inputElement = new Input(entry.inputConfig);
                inputElement.mount(amountCell);
            } else if (entry.labelConfig) {
                const labelElement = document.createElement('label');
                labelElement.setAttribute('name', entry.labelConfig.name);
                labelElement.setAttribute('id', entry.labelConfig.id);
                if (entry.labelConfig.textAlignRight) labelElement.style.textAlign = 'right';
                amountCell.append(labelElement);
            }
            row.append(amountCell);
            const unitCell = document.createElement('td');
            unitCell.textContent = entry.unit;
            row.append(unitCell);

            for (const subEntry of entry.subEntries || []) {
                const subRow = document.createElement('tr');
                subRow.classList.add(styles.subRow);
                tableBodyElement.append(subRow);

                const subSectionCell = document.createElement('td');
                const subLabel = document.createElement('label');
                subLabel.textContent = subEntry.name;
                if (subEntry.inputConfig?.id) subLabel.htmlFor = subEntry.inputConfig.id;
                subSectionCell.append(subLabel);
                subRow.append(subSectionCell);

                const subAmountCell = document.createElement('td');
                const inputElement = new Input(subEntry.inputConfig);
                inputElement.mount(subAmountCell);
                subRow.append(subAmountCell);
                const subUnitCell = document.createElement('td');
                subUnitCell.textContent = subEntry.unit;
                subRow.append(subUnitCell);
            }
        }

        form.append(tableElement);
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        // Validate form
        const inputFields = this.element.querySelectorAll('input');
        let isFormValid = true;
        inputFields.forEach((field) => {
            if (!field.checkValidity()) isFormValid = false;
        });
        if (!isFormValid) return;

        try {
            // Get all form data at once
            const formData = new FormData(event.target);
            const formValues = Object.fromEntries(formData.entries());

            // Convert string values to numbers where needed
            const numericFields = [
                'barcode',
                'packageAmount',
                'referenceAmount',
                'calories',
                'carbs',
                'sugars',
                'polyols',
                'fat',
                'saturatedFat',
                'monounsaturatedFat',
                'polyunsaturatedFat',
                'protein',
                'fiber',
                'salt',
                'magnesium',
                'potassium',
                'sodium',
                'calcium',
                /* other numeric fields */
            ];
            const processedData = Object.entries(formValues).reduce((acc, [key, value]) => {
                acc[key] = numericFields.includes(key) ? (value ? parseFloat(value) : 0) : value;
                return acc;
            }, {});

            console.log('Submitting product:', processedData);

            // TODO: Implement API call to add product
            // After successful submission, navigate back to products list
            // this.router.navigate('/products');
        } catch (error) {
            console.error('Error adding product:', error);
            // TODO: Show error to user
            this.renderContent(error);
        }
    };

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSubmit(event);
        }
    }

    createSectionHeading(text) {
        const heading = document.createElement('h2');
        heading.textContent = text;
        return heading;
    }

    createSubSectionHeading(text) {
        const heading = document.createElement('h3');
        heading.textContent = text;
        return heading;
    }
}

export default ProductAddPage;
