export default function setAttributes(element, attributes) {
    for (const { name, value } of attributes) {
        if (value) {
            element.setAttribute(name, value);
        }
    }
}
