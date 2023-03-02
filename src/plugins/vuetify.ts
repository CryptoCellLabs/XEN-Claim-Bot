import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark'
    },
    defaults: {
        VCard: {
            rounded: 'lg'
        },
        VBtn: {
            rounded: 'lg'
        }
    }
})

export default vuetify
