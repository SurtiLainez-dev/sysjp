<template>
  <v-card flat tile>
    <div v-if="pending">Loading order...</div>
    <div v-else-if="error">Error loading order</div>
    <div v-else>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn size="small" class="mr-5" @click="navigateTo('/work_orders/customers')"
               icon text  color="primary"><v-icon color="white">mdi-arrow-left</v-icon></v-btn>
        Ordenes de Trabajo del Cliente: <strong>{{customer.name}}</strong>
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
              @click:row="goToOrder"
              :items="orders">
            <template v-slot:item.created_at="{ value }">
              {{parseCreatedAtHelper(value)}}
            </template>
          </v-data-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type {WorkOrderInterfaz} from "@/types/work_ordersinterfacez";
import type {CustomerInterfaz} from "@/types/customerInterfacez";
import {parseCreatedAtHelper} from "@/helpers/parseCreatedAtHelper";

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
const route = useRoute()
const search = ref('')

const cusId = route.params.id as string
const orders = ref<WorkOrderInterfaz[]>();
const customer = ref<CustomerInterfaz | null>(null)
const { data, pending, error } = await useAsyncData('loadOrder', () =>
    $fetch(`/api/work_orders/customers/${cusId}`)
)
const goToOrder = (event:any, data:{item:WorkOrderInterfaz}) =>{
  navigateTo('/work_orders/'+data.item.id)
}
watchEffect(() => {
  customer.value = data.value.customer
  orders.value = data.value.data;
})
</script>

<style scoped>

</style>
