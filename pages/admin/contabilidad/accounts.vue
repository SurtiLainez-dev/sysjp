<template>
<v-card flat tile>
  <v-card-title class="d-flex align-center pe-2">
    Cuentas contables
    <v-spacer></v-spacer>
  </v-card-title>

  <v-data-table :headers="headers" :items="Accounts"></v-data-table>
</v-card>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import type {AccountInterfaz} from "@/types/transactionInterfacez";
import {useCcServices} from "@/services/useCcServices";


const Accounts = ref<AccountInterfaz[]>([]);
const headers = [
  {
    align: 'code',
    key: 'code',
    sortable: false,
    title: '# de la Cuenta',
  },
  { key: 'name', title: 'Nombre' },
  { key: 'type', title: 'Tipo' },
  { key: 'parent.name', title: 'Cuenta Padre' },
]
onMounted(async ()=>{
  Accounts.value = await useCcServices().getAccounts();
})
</script>

<style scoped>

</style>
