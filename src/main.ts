import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import i18n from '@/langs'
import vuetify from '@/plugins/vuetify'
import '@/styles/index.scss'

const app = createApp(App)

app.use(i18n)
    .use(vuetify)
    .use(router)
    .mount('#app')
