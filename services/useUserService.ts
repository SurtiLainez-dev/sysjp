import {toast} from "vue3-toastify";
import type {UserInterfaz} from "@/types/userInterfaz";

export const useUserServices = ()=>{
    const getUsers = async ():Promise<UserInterfaz[]> => {
        try {
            const res = await $fetch<{ ok: boolean; data: UserInterfaz[] }>('/api/users/users')
            toast.success("Usuarios cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar los usuarios", { autoClose: 3000 })
            return []
        }
    }

    return{
        getUsers
    }
}
