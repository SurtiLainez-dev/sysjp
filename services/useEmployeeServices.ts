// @ts-ignore
import {toast} from "vue3-toastify";
import type {EmployeeInterfaz, TypeEmployeeInterfaz, TypePayrollInterfaz} from "@/types/employeeInterfaz";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";

export const useEmployeeServices = ()=>{
    const getTypeEmployees = async ():Promise<TypeEmployeeInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: TypeEmployeeInterfaz[] }>('/api/employees/type_employees')
            toast.success("Tipo de colaboradores cargados exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar tipo de colaboradoes", { autoClose: 3000 })
            return []
        }
    }

    const getOffices = async ():Promise<OficinaInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: OficinaInterfaz[] }>('/api/offices/offices')
            toast.success("Oficinas cargados exitosamente", { autoClose: 3000 })
            return res.data
        } catch (err) {
            toast.error("Hubo un error al cargar oficinas", { autoClose: 3000 })
            return []
        }
    }

    const getEmployees = async ():Promise<EmployeeInterfaz[]> => {
        try {
            const res = await $fetch<{ ok: boolean; data: EmployeeInterfaz[] }>('/api/employees/employees')
            toast.success("Colaboradores cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar colaboradoes", { autoClose: 3000 })
            return []
        }
    }

    const getEmployeesXoffices = async (id:Number):Promise<EmployeeInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: EmployeeInterfaz[] }>(`/api/employees/x_office/${id}`)
            toast.success("Colaboradores cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        }catch (err){
            toast.error("Hubo un error al cargar colaboradoes", { autoClose: 3000 })
            return []
        }
    }

    const getTypePayrolls = async ():Promise<TypePayrollInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: TypePayrollInterfaz[] }>('/api/employees/payrolls/type_payrolls')
            toast.success("Tipo de Planillas cargados exitosamente", { autoClose: 3000 })
            return res.data
        } catch (err) {
            toast.error("Hubo un error al cargar oficinas", { autoClose: 3000 })
            return []
        }
    }

    return{
        getTypeEmployees,
        getOffices,
        getEmployees,
        getEmployeesXoffices,
        getTypePayrolls
    }
}
