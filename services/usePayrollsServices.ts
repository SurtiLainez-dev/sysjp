// @ts-ignore
import {toast} from "vue3-toastify";
import type {PayrollInterfaz} from "@/types/employeeInterfaz";

export const usePayrollsServices = () =>{
    const getPayrolls = async (ano:number, mes: number):Promise<PayrollInterfaz[]>=>{
        try {
            const res = await $fetch<{ ok: boolean; data: PayrollInterfaz[] }>(`/api/employees/payrolls/${ano}/${mes}`)
            toast.success("Planillas cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        }catch (err) {
            toast.error("Hubo un error al cargar las planillas", {autoClose: 3000})
            return []
        }
    }
    const getAllPayrolls = async ():Promise<PayrollInterfaz[]>=>{
        try {
            const res = await $fetch<{ ok: boolean; data: PayrollInterfaz[] }>(`/api/employees/payrolls/payrolls`)
            toast.success("Planillas cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        }catch (err) {
            toast.error("Hubo un error al cargar las planillas", {autoClose: 3000})
            return []
        }
    }

    return{
        getPayrolls,
        getAllPayrolls
    }
}
