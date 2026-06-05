import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ isSsrBuild }) => ({
    plugins: [react()],
    server: {
        fs: { allow: ['..'] },
        proxy: { '/api': 'http://localhost:8080' },
    },
    build: {
        outDir: isSsrBuild ? 'dist-server' : 'dist',
    },
}));