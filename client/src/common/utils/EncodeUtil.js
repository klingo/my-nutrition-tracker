export class EncodeUtil {
    static encode(text) {
        // Handle Unicode properly
        return btoa(new TextEncoder().encode(text).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    }

    static decode(encodedText) {
        const binary = atob(encodedText);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    static clear() {
        // Nothing to clear
    }
}
