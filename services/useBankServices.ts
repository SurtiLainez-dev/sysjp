// @ts-ignore
import {toast} from "vue3-toastify";
import type {BankInterfaz, BankAccountInterfaz} from "@/types/bankInterfaz";

export const useBankServices = ()=>{
    const getBanks = async ():Promise<BankInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: BankInterfaz[] }>('/api/bank/banks')
            toast.success("Bancos cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar bancos", { autoClose: 3000 })
            return []
        }
    }
    const getAccounts = async ():Promise<BankAccountInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: BankAccountInterfaz[] }>('/api/bank/account/accounts')
            toast.success("Bancos cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar bancos", { autoClose: 3000 })
            return []
        }
    }

    return{
        getBanks,
        getAccounts
    }
}
