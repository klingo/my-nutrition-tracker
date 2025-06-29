export default function setAttributes(element, attributes) {
    for (const { name, value } of attributes) {
        if (value !== undefined) {
            element.setAttribute(name, value);
        }
    }
}
