import { defineConfig } from 'vite';
import { codecovVitePlugin } from '@codecov/vite-plugin';
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
            // thresholds: {
            //     global: {
            //         branches: 80,
            //         functions: 80,
            //         lines: 80,
            //         statements: 80
            //     },
            // }
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
    plugins: [
        // Put the Codecov vite plugin after all other plugins
        codecovVitePlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'my-nutrition-tracker-client',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
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
