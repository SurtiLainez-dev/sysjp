import {authStore} from "@/store/authStore";

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (to.path === '/login') {
        // si ya estoy logueado, manda al home
        try {
            const me = await $fetch('/api/auth/me')
            authStore().setUserData(me.is_admin, me.username)
            return navigateTo('/')
        } catch {
            return
        }
    }

    // Para el resto de páginas, exige sesión
    try {
        const me = await $fetch('/api/auth/me')
        authStore().setUserData(me.is_admin, me.username)
    } catch {
        return navigateTo('/login')
    }
})
