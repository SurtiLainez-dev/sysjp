// @ts-ignore
import {toast} from "vue3-toastify";
import type {SupplierInterfaz, BrandsInterfaz} from "@/types/supplierInterfaz";

export const useSupplierServices = ()=>{

    const getSuppliers = async ():Promise<SupplierInterfaz[]> => {
      try {
          const res = await $fetch<{ ok: boolean; data: SupplierInterfaz[] }>('/api/suppliers/suppliers');
          toast.success("Proveedores cargados exitosamente", { autoClose: 3000 })
          return res.data;
      }catch (error){
          toast.error("Hubo un error al cargar los proveedores", { autoClose: 3000 })
          return []
      }
    }

    const getBrands = async ():Promise<BrandsInterfaz[]> => {
        try {
            const res = await $fetch<{ ok: boolean; data: BrandsInterfaz[] }>('/api/suppliers/brands');
            toast.success("Marcas cargadas exitosamente", { autoClose: 3000 })
            return res.data;
        }catch (error){
            toast.error("Hubo un error al cargar las marcas", { autoClose: 3000 })
            return []
        }
    }



    return{
        getSuppliers,
        getBrands
    }
}
