<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Impuestos Creados
      <v-spacer></v-spacer>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table :headers="headers" :items="Taxes">
      <template v-slot:item.id="{ item }">
        <div class="d-flex row">
          {{(item.rate * 100).toFixed(2)}} %
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
import {useCcServices} from "@/services/useCcServices";
import type {TaxInterfaz} from "@/types/transactionInterfacez";

onMounted(async ()=>{
  Taxes.value = await  useCcServices().getTaxes();
})
const Taxes = ref<TaxInterfaz[]>([]);
const headers = [
  {
    align: 'name',
    key: 'name',
    sortable: false,
    title: 'Nombre del Impuesto',
  },
  { key: 'rate', title: 'Tasa' },
  { key: 'id', title: 'Porcentaje' },
  { key: 'account.name', title: 'CC' },
]
</script>

<style scoped>

</style>
