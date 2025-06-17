import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'src', // Set the root to /src/
    base: '/',
    build: {
        outDir: '../dist', // Output to /dist/
        emptyOutDir: true
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});