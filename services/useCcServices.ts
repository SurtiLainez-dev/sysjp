// @ts-ignore
import {toast} from "vue3-toastify";
import type {AccountInterfaz, TransactionInterfaz, TaxInterfaz} from "@/types/transactionInterfacez";
import type {PaymentMethodInterfaz} from "@/types/payment_methodsInterfacez";

export const useCcServices = ()=>{
    const getAccounts = async ():Promise<AccountInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: AccountInterfaz[] }>('/api/cc/accounts')
            toast.success("Cuentas contables cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar las ceuntas contables", { autoClose: 3000 })
            return []
        }
    }

    const getRegisters = async (date:string):Promise<TransactionInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: TransactionInterfaz[] }>(`/api/cc/${date}`)
            toast.success("Registros contables cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar los registros contables", { autoClose: 3000 })
            return []
        }
    }

    const getTaxes =  async ():Promise<TaxInterfaz[]>=>{
        try {
            const res = await $fetch<{ ok: boolean; data: TaxInterfaz[] }>(`/api/cc/taxes`)
            toast.success("Impuestos cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar los impuestos", { autoClose: 3000 })
            return []
        }
    }

    const getPaymentMethods =  async ():Promise<PaymentMethodInterfaz[]>=>{
        try {
            const res = await $fetch<{ ok: boolean; data: PaymentMethodInterfaz[] }>(`/api/cc/payment_methods`)
            toast.success("Metodos de pagos cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar los metodos de pagos", { autoClose: 3000 })
            return []
        }
    }

    return{
        getAccounts,
        getRegisters,
        getTaxes,
        getPaymentMethods
    }
}
