<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Orden de Trabajo Cerradas
      <v-spacer></v-spacer>
      <v-text-field
          v-model="search"
          density="compact"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          placeholder="buscar..."
          hide-details
          single-line
      ></v-text-field>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
        :headers="headers"
        :search="search"
        :items="Orders"
        @click:row="goToOrder"
    >
      <template v-slot:item.created_at="{ value }">
        {{parseCreatedAtHelper(value)}}
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
import {toast} from "vue3-toastify";
import type {WorkOrderInterfaz} from "@/types/work_ordersinterfacez";
import {parseCreatedAtHelper} from "@/helpers/parseCreatedAtHelper"

const headers = [
  {
    align: 'start',
    key: 'id',
    sortable: false,
    title: '#',
  },
  { key: 'office_name', title: 'Sucursal' },
  { key: 'user_name', title: 'Usuario Creador' },
  { key: 'customer_name', title: 'Cliente' },
  { key: 'status', title: 'Estado' },
  { key: 'created_at', title: 'Creado' },
]
const search = ref('');
const Orders = ref<WorkOrderInterfaz>([])

onMounted( ()=>{
  getWorkOrders();
})

const getWorkOrders = async ()=>{
  try {
    Orders.value = await $fetch<{ ok: boolean; data: WorkOrderInterfaz[] }>('/api/work_orders/close')
    toast.success("Ordenes cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar las ordenes", { autoClose: 3000 })
    return []
  }
}

const goToOrder = (event:any, data:{item:WorkOrderInterfaz}) =>{
  navigateTo('/work_orders/'+data.item.id)
}
</script>

<style scoped>

</style>
