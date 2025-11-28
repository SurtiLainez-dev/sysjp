import {defineStore} from "pinia";
import {ref} from "vue";
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"
export const authStore = defineStore('auth_store', ()=>{
    const loadingAuth = ref(false);
    const Is_admin        = ref(false);
    const Username    = ref<string | null>(null)

    const setLoading = (val:boolean) => {
      loadingAuth.value = val
    }

    const setUserData = (is_admin: boolean, username: string) => {
      Is_admin.value     = is_admin;
      Username.value = username
    }

    const loginPin = async (pin:string) => {
        loadingAuth.value = true;

        try {
            await $fetch('/api/auth/login',{method: 'post', body:{pin}});
            toast.success("Se ha iniciado sesión correctamente", { autoClose: 3000 })
            return navigateTo('/')
        }catch (err){
            toast.error("Hubo un error con el pin", { autoClose: 3000 })
        }finally {
            loadingAuth.value = false;
        }
    }

    return{
        loadingAuth,
        Is_admin,
        Username,
        setLoading,
        loginPin,
        setUserData
    }
})
