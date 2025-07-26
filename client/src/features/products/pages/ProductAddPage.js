import styles from './ProductAddPage.module.css';
import iconStyles from '@styles/icons.module.css';
import BasePage from '@core/base/BasePage';
import { Accordion, Button, ContentBlock, Input } from '@common/components';
import {
    getCarbohydratesEntries,
    getGeneralEntries,
    getLipidsEntries,
    getMineralsEntries,
    getProductAdvancedInfoEntries,
    getProductInfoEntries,
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
        const form = document.createElement('form');
        form.name = 'product-form';
        form.onsubmit = this.handleSubmit;

        // Product information
        this.#renderProductContentBlock(form, 'Product Information', { compact: true });

        // Nutritional input
        this.#renderNutritionContentBlock(form, 'Nutrition Overview', { compact: true });

        // Submit button
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '20px';
        const submitButton = new Button({
            text: 'Add Product',
            type: 'primary',
            buttonType: 'submit',
        });
        submitButton.mount(buttonWrapper);
        form.append(buttonWrapper);

        this.element.append(form);
        return this.element;
    }

    #renderProductContentBlock(form, headingText, options) {
        const contentBlock = new ContentBlock();
        contentBlock.mount(form);

        const productHeading = this.createSectionHeading(headingText);
        contentBlock.append(productHeading);

        const infoAccordion = new Accordion({ title: 'Info', initiallyExpanded: true });
        infoAccordion.mount(contentBlock.element);
        this.#renderEntriesSection(infoAccordion, 'Info', getProductInfoEntries(options), true);

        const advancedInfoAccordion = new Accordion({ title: 'Advanced Info', initiallyExpanded: false });
        advancedInfoAccordion.mount(contentBlock.element);
        this.#renderEntriesSection(
            advancedInfoAccordion,
            'Advanced Info',
            getProductAdvancedInfoEntries(options),
            true,
        );
        // Category
        // Tags
        // Images(?)
    }

    #renderNutritionContentBlock(form, headingText, options) {
        const contentBlock = new ContentBlock();
        contentBlock.mount(form);

        const productHeading = this.createSectionHeading(headingText);
        contentBlock.append(productHeading);

        this.#renderEntriesSection(contentBlock, 'General', getGeneralEntries(options));
        this.#renderEntriesSection(contentBlock, 'Carbohydrates', getCarbohydratesEntries(options));
        this.#renderEntriesSection(contentBlock, 'Lipids', getLipidsEntries(options));
        this.#renderEntriesSection(contentBlock, 'Proteins', getProteinsEntries(options));
        this.#renderEntriesSection(contentBlock, 'Minerals', getMineralsEntries(options));
        this.#renderEntriesSection(contentBlock, 'Vitamins', getVitaminsEntries(options));
    }

    #renderEntriesSection(parent, headingText, entries, skipTableHead = false) {
        const tableElement = document.createElement('table');

        // Colgroup
        const colGroupElement = document.createElement('colgroup');
        for (let i = 0; i < 3; i++) colGroupElement.append(document.createElement('col'));
        tableElement.append(colGroupElement);

        // Table Head
        if (!skipTableHead) {
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
        }

        // Table Body
        const tableBodyElement = document.createElement('tbody');
        tableElement.append(tableBodyElement);

        for (const entry of entries || []) {
            const row = document.createElement('tr');
            tableBodyElement.append(row);

            const sectionCell = document.createElement('td');
            const label = document.createElement('label');
            label.textContent = entry.labelText;
            if (entry.inputConfig?.id) label.htmlFor = entry.inputConfig?.id;
            if (entry.inputConfig?.required) label.classList.add(styles.required);
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
                const icon = document.createElement('div');
                icon.classList.add(iconStyles.icon, iconStyles.subdirectoryRight);
                const subLabel = document.createElement('label');
                subLabel.textContent = subEntry.labelText;
                if (subEntry.inputConfig?.id) subLabel.htmlFor = subEntry.inputConfig.id;
                subSectionCell.append(icon, subLabel);
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

        parent.append(tableElement);
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
