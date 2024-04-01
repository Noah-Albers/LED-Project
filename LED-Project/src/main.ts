/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

// Components
import App from '@webapp/App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@webapp/plugins'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
