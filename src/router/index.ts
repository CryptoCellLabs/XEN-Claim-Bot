import { createRouter, createWebHistory } from 'vue-router'
import { getAddressStorage } from '@/utils/addressStorage'
import ImportFile from '@/views/ImportFile.vue'
import ClaimXEN from '@/views/ClaimXEN.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_APP_ROUTE_BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/claim-xen'
        },
        {
            path: '/import-file',
            name: 'ImportFile',
            component: ImportFile
        },
        {
            path: '/claim-xen',
            name: 'ClaimXEN',
            component: ClaimXEN,
            beforeEnter: () => {
                if (!getAddressStorage()) {
                    return { path: '/import-file' }
                }
            }
        }
    ]
})

export default router
