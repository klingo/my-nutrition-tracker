import { defineConfig } from 'vite';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
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
            reportsDirectory: './coverage',
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
            output: {
                manualChunks: (id) => {
                    // Create a vendors chunk for node_modules
                    if (id.includes('node_modules')) {
                        if (id.includes('tabulator-tables')) {
                            return 'vendor-tabulator';
                        }
                        return 'vendors';
                    }

                    // Split by feature
                    if (id.includes('/features/')) {
                        if (id.includes('/login/')) {
                            return 'feature-login';
                        } else if (id.includes('/register/')) {
                            return 'feature-register';
                        } else if (id.includes('/overview/')) {
                            return 'feature-overview';
                        } else if (id.includes('/products/')) {
                            return 'feature-products';
                        } else if (id.includes('/profile/')) {
                            return 'feature-profile';
                        }
                        return 'features';
                    }

                    // Common components and utilities
                    if (id.includes('/common/')) {
                        if (id.includes('/components/')) {
                            return 'common-components';
                        }
                        return 'common';
                    }
                    if (id.includes('/core/')) {
                        return 'core';
                    }
                },
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 500,
        sourcemap: true,
    },
    plugins: [
        // Add visualizer plugin to analyze bundle sizes
        visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap', // Options: sunburst, treemap, network
        }),
        // Put the Codecov vite plugin after all other plugins
        codecovVitePlugin({
            enableBundleAnalysis: process.env.CI === 'true' || process.env.CODECOV_TOKEN !== undefined,
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
        host: '0.0.0.0',
        port: process.env.PORT || 3000,
        strictPort: true,
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
            '@common': resolve(__dirname, 'src/common'),
            '@core': resolve(__dirname, 'src/core'),
            '@features': resolve(__dirname, 'src/features'),
            '@styles': resolve(__dirname, 'src/styles'),
            '@assets': resolve(__dirname, 'src/assets'),
        },
    },
});
