import type {CustomerInterfaz} from "@/types/customerInterfacez";
import {toast} from "vue3-toastify";

export const useCustomerServices = () =>{
    const getCustomers = async ():Promise<CustomerInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: CustomerInterfaz[] }>('/api/customers/customers')
            toast.success("Clientes cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar los clientes", { autoClose: 3000 })
            return []
        }
    }


    return{
        getCustomers
    }
}
