export class EncodeUtil {
    /**
     * @param {string} text
     * @return {string}
     */
    static encode(text) {
        if (text === null || text === undefined) {
            throw new TypeError('text must be a string');
        }
        // Handle Unicode properly
        return btoa(new TextEncoder().encode(text).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    }

    /**
     * @param {string} encodedText
     * @return {string}
     */
    static decode(encodedText) {
        if (encodedText === null || encodedText === undefined) {
            throw new TypeError('encodedText must be a string');
        }
        const binary = atob(encodedText);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }
}
