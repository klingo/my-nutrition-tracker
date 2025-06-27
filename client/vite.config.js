import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'src',
    base: '/',
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
    },
    test: {
        run: true,
        environment: 'jsdom',
        testTimeout: 10000,
        watch: false,
        setupFiles: ['./__test__/setup.js'],
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
            include: [/.+/],
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: '../coverage',
        },
    },
    build: {
        rollupOptions: {
            external: ['**/*.test.js'],
            input: resolve(__dirname, 'src/core/Spa.js'),
        },
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
