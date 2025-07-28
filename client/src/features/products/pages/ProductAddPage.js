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
import calculateNetCarbs from '@features/products/utils/calculateNetCarbs';
import callApi from '@common/utils/callApi.js';

class ProductAddPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);

        this.pageTitle = 'Add New Product';
        this.submitButton = null;
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    renderContent() {
        const form = document.createElement('form');
        form.name = 'product-form';
        form.onsubmit = this.handleSubmit;

        // Product information
        this.#renderProductContentBlock(form, 'Product Information', { compact: true, width: '140px' });

        // Nutritional input
        this.#renderNutritionContentBlock(form, 'Nutrition Overview', { compact: true, width: '140px' });

        // Submit button
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '20px';
        this.submitButton = new Button({
            text: 'Add Product',
            type: 'primary',
            buttonType: 'submit',
        });
        this.submitButton.mount(buttonWrapper);
        form.append(buttonWrapper);

        this.element.append(form);

        // Add event listeners for net carbs calculation after the form is rendered
        this.#setupNetCarbsCalculation();

        return this.element;
    }

    #renderProductContentBlock(form, headingText, inputConfig) {
        const contentBlock = new ContentBlock();
        contentBlock.mount(form);

        const productHeading = this.createSectionHeading(headingText);
        contentBlock.append(productHeading);

        const infoAccordion = new Accordion({ title: 'Info', initiallyExpanded: true });
        infoAccordion.mount(contentBlock.element);
        this.#renderEntriesSection(infoAccordion, 'Info', getProductInfoEntries(inputConfig), true);

        const advancedInfoAccordion = new Accordion({ title: 'Advanced Info', initiallyExpanded: false });
        advancedInfoAccordion.mount(contentBlock.element);
        this.#renderEntriesSection(
            advancedInfoAccordion,
            'Advanced Info',
            getProductAdvancedInfoEntries({ ...inputConfig }),
            true,
        );
        // Category
        // Tags
        // Images(?)
    }

    #renderNutritionContentBlock(form, headingText, inputConfig) {
        const contentBlock = new ContentBlock();
        contentBlock.mount(form);

        const productHeading = this.createSectionHeading(headingText);
        contentBlock.append(productHeading);

        this.#renderEntriesSection(contentBlock, 'General', getGeneralEntries(inputConfig));
        this.#renderEntriesSection(contentBlock, 'Carbohydrates', getCarbohydratesEntries(inputConfig));
        this.#renderEntriesSection(contentBlock, 'Lipids', getLipidsEntries(inputConfig));
        this.#renderEntriesSection(contentBlock, 'Proteins', getProteinsEntries(inputConfig));
        this.#renderEntriesSection(contentBlock, 'Minerals', getMineralsEntries(inputConfig));
        this.#renderEntriesSection(contentBlock, 'Vitamins', getVitaminsEntries(inputConfig));
    }

    #renderEntriesSection(parent, headingText, entries, skipTableHead = false) {
        const tableElement = document.createElement('table');

        // Colgroup
        const colGroupElement = document.createElement('colgroup');
        for (let i = 0; i < 2; i++) colGroupElement.append(document.createElement('col'));
        tableElement.append(colGroupElement);

        // Table Head
        if (!skipTableHead) {
            tableElement.classList.add(styles.borders);

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
            if (entry.spanConfig?.id) label.htmlFor = entry.spanConfig?.id;
            if (entry.inputConfig?.id) label.htmlFor = entry.inputConfig?.id;
            if (entry.inputConfig?.required) label.classList.add(styles.required);
            sectionCell.append(label);
            row.append(sectionCell);

            const amountCell = document.createElement('td');
            if (entry.inputConfig) {
                const inputElement = new Input(entry.inputConfig);
                inputElement.mount(amountCell);
            } else if (entry.spanConfig) {
                const spanElement = document.createElement('span');
                spanElement.setAttribute('name', entry.spanConfig.name);
                spanElement.setAttribute('id', entry.spanConfig.id);
                amountCell.append(spanElement);
            }
            row.append(amountCell);

            for (const subEntry of entry.subEntries || []) {
                const subRow = document.createElement('tr');
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
            }
        }

        parent.append(tableElement);
    }

    // Set up event listeners for net carbs calculation
    #setupNetCarbsCalculation() {
        // Find the input elements in the DOM by their IDs
        const carbsInput = this.element.querySelector('#carbs');
        const fiberInput = this.element.querySelector('#fiber');
        const polyolsInput = this.element.querySelector('#polyols');
        const netCarbsSpan = this.element.querySelector('#netCarbs');

        // If all elements are found, add event listeners
        if (carbsInput && fiberInput && polyolsInput && netCarbsSpan) {
            const amountSpan = document.createElement('span');
            amountSpan.classList.add(styles.amount);

            const unitSpan = document.createElement('span');
            unitSpan.classList.add(styles.unit);
            unitSpan.textContent = 'g';

            netCarbsSpan.append(amountSpan, unitSpan);

            // Add event listeners to the input elements
            const updateNetCarbs = () => {
                amountSpan.textContent = calculateNetCarbs(carbsInput.value, fiberInput.value, polyolsInput.value);
            };

            carbsInput.addEventListener('input', updateNetCarbs);
            fiberInput.addEventListener('input', updateNetCarbs);
            polyolsInput.addEventListener('input', updateNetCarbs);

            netCarbsSpan.classList.add(styles.netCarbs);

            // Initialize with the default value
            updateNetCarbs();
        }
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
                /* Info */
                'packageAmount',
                'referenceAmount',
                /* Advanced Info */
                'barcode',
                /* General */
                'calories',
                /* Carbohydrates */
                'carbs',
                'sugar',
                'polyols',
                'fiber',
                /* Lipids */
                'fat',
                'saturatedFat',
                'monounsaturatedFat',
                'polyunsaturatedFat',
                /* Proteins */
                'protein',
                /* Minerals */
                'salt',
                'magnesium',
                'potassium',
                'sodium',
                'calcium',
                /* Vitamins */
                'vitaminA',
                'vitaminB1',
                'vitaminB2',
                'vitaminB3',
                'vitaminB6',
                'vitaminB12',
                'vitaminC',
                'vitaminD',
                'vitaminE',
                'vitaminK',
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

            // Everything is validated
            this.submitButton.setLoading(true).setText('Adding Product...');

            const result = await callApi('POST', '/api/products', processedData);
            console.log('Add Product result:', result);

            if (result?._embedded?.product?._id) {
                console.log('New product added, redirecting...');
                this.router.navigate('/products');
            } else {
                // TODO: Show error to user
                // this.#handleSignupError(result);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            // TODO: Show error to user
        } finally {
            this.submitButton.setLoading(false).setText('Add Product');
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
}

export default ProductAddPage;
