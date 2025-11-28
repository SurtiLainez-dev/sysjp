<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Proveedores

      <v-spacer></v-spacer>

      <v-text-field
          v-model="search"
          density="compact"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table
        :headers="headers"
        :search="search"
        :loading="load"
        :items="Proveedor"
        @click:row="editProveedor"
    >
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import type {SupplierInterfaz} from "@/types/supplierInterfaz";
import {toast} from "vue3-toastify";

const search = ref('');
const load   = ref(false);
const Proveedor = ref<SupplierInterfaz[]>([]);
onMounted(()=>{
  getSuppliers();
})
const headers = [
  {
    align: 'start',
    key: 'fullname',
    sortable: false,
    title: 'Nombre',
  },
  { key: 'name', title: 'Nickname' },
  { key: 'email', title: 'Email' },
  { key: 'phone', title: 'Telefono' },
  { key: 'address', title: 'Direción' },
  { key: 'account.code', title: 'CC Code' },
]


const editProveedor = () =>{

}
const getSuppliers = async () => {
  load.value = true
  try {
    const res = await $fetch<{ ok: boolean; data: SupplierInterfaz[] }>('/api/suppliers/suppliers')
    Proveedor.value = res.data
    toast.success("Proveedores cargados exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar proveedores", { autoClose: 3000 })
  } finally {
    load.value = false
  }
}
</script>

<style scoped>

</style>
