import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const sentryOrg = process.env.SENTRY_ORG
const sentryProject = process.env.SENTRY_PROJECT_WEB
const sentryRelease = process.env.VITE_SENTRY_RELEASE
const sentryEnabled = Boolean(
  sentryAuthToken && sentryOrg && sentryProject && sentryRelease,
)

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    ...(sentryEnabled
      ? [
          sentryVitePlugin({
            authToken: sentryAuthToken,
            org: sentryOrg,
            project: sentryProject,
            release: {
              name: sentryRelease,
            },
            sourcemaps: {
              assets: './dist/**',
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
