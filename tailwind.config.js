import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#303b6a',
                    50: '#eef0f5',
                    100: '#d6d9e5',
                    200: '#b0b7d0',
                    300: '#8b94bc',
                    400: '#6571a7',
                    500: '#4e5990',
                    600: '#3f4876',
                    700: '#303b6a', // Primary color
                    800: '#252d52',
                    900: '#1c233e',
                },
                accent: {
                    DEFAULT: '#f32d21',
                    50: '#fef2f1',
                    100: '#fde2df',
                    200: '#fcc5c0',
                    300: '#fa9990',
                    400: '#f76c61',
                    500: '#f32d21', // Accent color
                    600: '#e2180c',
                    700: '#bc140a',
                    800: '#96110a',
                    900: '#7b130c',
                },
            },
            fontFamily: {
                sans: ['Google Sans', 'Roboto', ...defaultTheme.fontFamily.sans],
                display: ['Google Sans Display', 'Google Sans', 'Roboto', ...defaultTheme.fontFamily.sans],
            },
            animation: {
                'fadeIn': 'fadeIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-5px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },

    plugins: [forms],
};
