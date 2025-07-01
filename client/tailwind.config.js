/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // Add more specific paths for better tree shaking
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
  ],
  // Enable production optimizations
  mode: 'jit', // Just-in-time compilation for smaller bundles
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        intero: ["Intero", "sans-serif"],
        sf: ["SFRegular", "sans-serif"],
        sfbold: ["SFProBold", "sans-serif"],
        sfmedium: ["SFProMedium", "sans-serif"],
      },
      // Optimize colors - only include used colors
      colors: {
        green: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
        gray: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        red: {
          100: '#fee2e2',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    purge: {
      enabled: true,
      content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./constants/**/*.{js,jsx,ts,tsx}",
        "./store/**/*.{js,jsx,ts,tsx}",
      ],
      // Remove unused styles more aggressively
      options: {
        safelist: [
          // Keep essential utility classes that might be used dynamically
          'text-green-600',
          'text-green-700',
          'bg-green-600',
          'bg-green-50',
        ],
      },
    },
  }),
}