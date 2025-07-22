import BasePage from '@core/base/BasePage';
import { Button, ContentBlock, ExpandableContainer, Input } from '@common/components';

class ProductAddPage extends BasePage {
    constructor(router, signal) {
        super(router, signal);
        this.pageTitle = 'Add New Product';
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get all form data at once
            const formData = new FormData(e.target);
            const formValues = Object.fromEntries(formData.entries());

            // Convert string values to numbers where needed
            const numericFields = ['calories', 'protein', 'carbs', 'fat', 'fiber' /* other numeric fields */];
            const processedData = Object.entries(formValues).reduce((acc, [key, value]) => {
                acc[key] = numericFields.includes(key) ? (value ? parseFloat(value) : 0) : value;
                return acc;
            }, {});

            console.log('Submitting product:', processedData);

            // TODO: Implement API call to add product
            // After successful submission, navigate back to products list
            this.router.navigate('/products');
        } catch (error) {
            console.error('Error adding product:', error);
            // TODO: Show error to user
            this.renderContent(error);
        }
    };

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
        const macrosFields = [
            {
                name: 'calories',
                label: 'Calories (kcal)',
                type: 'number',
                icon: 'calories',
                required: true,
                numberConfig: { min: 0, max: 9999, step: 1 },
            },
            {
                name: 'carbs',
                label: 'Total Carbohydrates (g)',
                type: 'number',
                icon: 'carbohydrates',
                required: true,
                numberConfig: { min: 0, max: 999, step: 1 },
            },
            {
                name: 'sugars',
                label: 'Sugars (g)',
                type: 'number',
                icon: 'sugars',
                required: true,
                numberConfig: { min: 0, max: 999, step: 1 },
            },
            {
                name: 'polyols',
                label: 'Polyols (g)',
                type: 'number',
                icon: 'polyols',
                numberConfig: { min: 0, max: 999, step: 1 },
            },
            {
                name: 'fat',
                label: 'Total Fat (g)',
                type: 'number',
                icon: 'fat',
                required: true,
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'saturated',
                label: 'Saturated Fat (g)',
                type: 'number',
                icon: 'saturated-fat',
                required: true,
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'monounsaturated',
                label: 'Monounsaturated Fat (g)',
                type: 'number',
                icon: 'monounsaturated-fat',
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'polyunsaturated',
                label: 'Polyunsaturated Fat (g)',
                type: 'number',
                icon: 'polyunsaturated-fat',
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'protein',
                label: 'Protein (g)',
                type: 'number',
                icon: 'protein',
                required: true,
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'fiber',
                label: 'Fiber (g)',
                type: 'number',
                icon: 'fiber',
                required: true,
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'salt',
                label: 'Salt (g)',
                type: 'number',
                icon: 'salt',
                required: true,
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
        ];
        const microsMineralsFields = [
            {
                name: 'magnesium',
                label: 'Magnesium (g)',
                type: 'number',
                icon: 'magnesium',
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'potassium',
                label: 'Potassium (g)',
                type: 'number',
                icon: 'potassium',
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'sodium',
                label: 'Sodium (g)',
                type: 'number',
                icon: 'sodium',
                numberConfig: { min: 0, max: 999, step: 0.1 },
            },
            {
                name: 'calcium',
                label: 'Calcium (mg)',
                type: 'number',
                icon: 'calcium',
                numberConfig: { min: 0, max: 9999, step: 0.1 },
            },
            { name: 'iron', label: 'Iron (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'zinc', label: 'Zinc (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
        ];
        const microsVitaminsFields = [
            { name: 'a', label: 'Vitamin A (IU)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'b1', label: 'Vitamin B1 (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'b2', label: 'Vitamin B2 (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'b3', label: 'Vitamin B3 (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'b6', label: 'Vitamin B6 (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'b12', label: 'Vitamin B12 (mcg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'c', label: 'Vitamin C (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'd', label: 'Vitamin D (IU)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'e', label: 'Vitamin E (IU)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
            { name: 'k', label: 'Vitamin K (mcg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
        ];

        const productHeading = this.createSectionHeading('Product Information');
        form.append(productHeading);
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
            form.append(wrapper);
        });

        const macrosHeading = this.createSectionHeading('Macronutrients');
        form.append(macrosHeading);
        macrosFields.forEach((field) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '15px';

            const input = new Input({
                type: field.type,
                name: field.name,
                label: field.label,
                icon: field.icon,
                required: field.required,
                numberConfig: field.numberConfig,
            });

            wrapper.append(input.render());
            form.append(wrapper);
        });

        const microsHeading = this.createSectionHeading('Micronutrients');
        form.append(microsHeading);
        const mineralsHeading = this.createSubSectionHeading('Minerals');
        form.append(mineralsHeading);

        const expandableMineralsContainer = new ExpandableContainer();
        expandableMineralsContainer.mount(form);
        mineralsHeading.addEventListener('click', () => expandableMineralsContainer.toggle());

        microsMineralsFields.forEach((field) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '15px';

            const input = new Input({
                type: field.type,
                name: field.name,
                label: field.label,
                icon: field.icon,
                required: field.required,
                numberConfig: field.numberConfig,
            });

            wrapper.append(input.render());
            expandableMineralsContainer.append(wrapper);
        });

        const vitaminsHeading = this.createSubSectionHeading('Vitamins');
        form.append(vitaminsHeading);

        const expandableVitaminsContainer = new ExpandableContainer();
        expandableVitaminsContainer.mount(form);
        vitaminsHeading.addEventListener('click', () => expandableVitaminsContainer.toggle());

        microsVitaminsFields.forEach((field) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '15px';

            const input = new Input({
                type: field.type,
                name: field.name,
                label: field.label,
                icon: field.icon,
                required: field.required,
                numberConfig: field.numberConfig,
            });

            wrapper.append(input.render());
            expandableVitaminsContainer.append(wrapper);
        });

        // Add submit button
        const submitButton = new Button({
            type: 'primary',
            text: 'Add Product',
        });

        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '20px';
        buttonWrapper.append(submitButton.render());
        form.append(buttonWrapper);

        contentBlock.append(form);
        contentBlock.mount(this.element);
        return this.element;
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
