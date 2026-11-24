import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cajua: {
          cream: '#FFFDF6',
          sand: '#F7F3E9',
          yellow: '#FFCA28',
          orange: '#FF7043',
          red: '#E53935',
          green: '#43A047',
          blue: '#1E88E5',
          purple: '#8E24AA',
          charcoal: '#212121',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        fredoka: ['var(--font-fredoka)', 'sans-serif'],
        plus: ['var(--font-plus)', 'sans-serif'],
      },
      boxShadow: {
        'pop': '4px 4px 0px 0px #212121',
        'pop-lg': '6px 6px 0px 0px #212121',
        'pop-hover': '2px 2px 0px 0px #212121',
        'pop-active': '0px 0px 0px 0px #212121',
      },
    },
  },
  plugins: [],
}
export default config
