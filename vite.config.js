import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { glob } from 'glob';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                ...glob.sync('resources/css/**/*.css'),  // ✅ TODOS los CSS
                ...glob.sync('resources/js/**/*.js'),    // ✅ TODOS los JS
            ].filter(file => 
                !file.includes('_') && // Ignora archivos que empiezan con _
                !file.includes('/modules/') // Ignora carpetas específicas si quieres
            ),
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});