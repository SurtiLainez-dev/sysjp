import type {ArticleInterfaz, CategoryInterfaz} from "@/types/inventoryinterfaces";
// @ts-ignore
import {toast} from "vue3-toastify";

export const useInventoryServices = () =>{
    const getCategories = async ():Promise<CategoryInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: CategoryInterfaz[] }>('/api/inventory/category/categories')
            toast.success("Categorias cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar categorias", { autoClose: 3000 })
            return []
        }
    }

    const getInventory = async ():Promise<ArticleInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: ArticleInterfaz[] }>('/api/inventory/articles')
            toast.success("Inventario cargado exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar el inventario", { autoClose: 3000 })
            return []
        }
    }

    const getInventoryXsupplier = async (supplier_id:number):Promise<ArticleInterfaz[]> =>{
        try {
            const res = await $fetch<{ ok: boolean; data: ArticleInterfaz[] }>('/api/inventory/article/supplier/'+supplier_id)
            toast.success("Inventario cargado exitosamente", { autoClose: 3000 })
            return res.data;
        } catch (err) {
            toast.error("Hubo un error al cargar el inventario", { autoClose: 3000 })
            return []
        }
    }

    return{
        getCategories,
        getInventory,
        getInventoryXsupplier
    }
}
