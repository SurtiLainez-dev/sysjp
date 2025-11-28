<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Ordenes de Entrada
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
        :items="Orders"
        @click:row="goToEntryOrder"
    >
      <template v-slot:item.disccount="{ value }">
        {{Intl.NumberFormat().format(value?value:0)}} USD
      </template>
      <template v-slot:item.total_amount="{ value }">
        {{Intl.NumberFormat().format(value?value:0)}} USD
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import type {EntryOrderInterfaz} from "@/types/order_entryinterfacez";
import {toast} from "vue3-toastify";

const Orders = ref<EntryOrderInterfaz[]>([])
const search = ref('');
const headers = [
  {
    align: 'start',
    key: 'id',
    sortable: false,
    title: '#',
  },
  { key: 'code', title: 'Referencia' },
  { key: 'supplier.name', title: 'Proveedor' },
  { key: 'branch.name', title: 'Oficina' },
  { key: 'disccount', title: 'Descuento' },
  { key: 'total_amount', title: 'Total' },
]
onMounted(()=>{
  getEntryOrders();
})
const getEntryOrders = async () => {
  try {
    const res = await $fetch<{ ok: boolean; data: EntryOrderInterfaz[] }>('/api/inventory/orders/entry')
    Orders.value = res.data
    toast.success("Ordenes cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar las ordenes de entrada", { autoClose: 3000 })
  }
}
const goToEntryOrder = (event:any, data:{item:EntryOrderInterfaz})=>{
  navigateTo('/admin/inventory/entry_orders/'+data.item.id)
}
</script>

<style scoped>

</style>
