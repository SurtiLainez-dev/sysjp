// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            colors: {
              primary: '#C89D45',   // dorado
              secondary: '#8C6239', // marrón
              accent: '#B0B0B0',    // gris metálico
              background: '#F5F5F5',
              surface: '#FFFFFF',
              info: '#777777',
              success: '#4CAF50',
              warning: '#FFC107',
              error: '#F44336',
            }
          },
          dark: {
            colors: {
              primary: '#C89D45',
              secondary: '#8C6239',
              background: '#1E1E1E',
              surface: '#333333',
              accent: '#B0B0B0',
            }
          }
        }
      }
    }
  },
  devServer: {
    host: '0.0.0.0',   // acepta conexiones externas
    port: 3000
  },
  vite: {
    server: {
      allowedHosts: ['4d74ca13b9cd.ngrok-free.app'],
      host: true,
    },
  },
})
