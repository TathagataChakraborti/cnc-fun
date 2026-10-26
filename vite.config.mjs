import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    assetsInclude: ['**/*.wasm', '**/*.onnx'],
    server: {
        port: 3000,
        open: true,
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 3000,
    },
});
