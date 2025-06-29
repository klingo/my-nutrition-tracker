import { defineConfig } from 'vite';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import { resolve } from 'path';
import fs from 'fs';
import 'dotenv/config';

export default defineConfig({
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
        reporters: ['default', 'junit'],
        outputFile: {
            junit: '../test-results/junit.xml',
        },
    },
    build: {
        rollupOptions: {
            external: ['**/*.test.js'],
            input: resolve(__dirname, 'src/app/App.js'),
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
    plugins: [
        // Put the Codecov vite plugin after all other plugins
        codecovVitePlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'my-nutrition-tracker-client',
            uploadToken: process.env.CODECOV_TOKEN,
            telemetry: false,
        }),
    ],
    server: {
        // Only configure HTTPS if SSL paths are provided
        ...(process.env.SSL_KEY_PATH &&
            process.env.SSL_CERT_PATH && {
                https: {
                    key: fs.readFileSync(resolve(__dirname, process.env.SSL_KEY_PATH)),
                    cert: fs.readFileSync(resolve(__dirname, process.env.SSL_CERT_PATH)),
                },
            }),
        port: process.env.PORT || 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'https://localhost:3001',
                changeOrigin: true,
                secure: false, // Change this to false for self-signed certificates
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@pages': resolve(__dirname, 'src/pages'),
            '@services': resolve(__dirname, 'src/services'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@styles': resolve(__dirname, 'src/styles'),
        },
    },
});
