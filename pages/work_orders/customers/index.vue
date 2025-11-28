<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Clientes
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
        @click:row="goToOrders"
        :items="Customers">
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import {ref} from "vue";
import type {CustomerInterfaz} from "@/types/customerInterfacez";
import {useCustomerServices} from "@/services/useCustomerServices";

const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre del cliente',
  },
  { key: 'nickname', title: 'Nickname' },
  { key: 'phone', title: 'Telefono' },
  { key: 'email', title: 'Email' },
]
const search = ref('')
const Customers = ref<CustomerInterfaz[]>( []);

onMounted(async ()=>{
  Customers.value = await useCustomerServices().getCustomers()
})

const goToOrders = (event:any, data:{item:CustomerInterfaz})=>{
  navigateTo('/work_orders/customers/'+data.item.id)
}
</script>

<style scoped>

</style>
