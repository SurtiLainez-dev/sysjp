<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Formas de Pago
      <v-spacer></v-spacer>
      <v-btn size="small" color="secondary" icon tile @click="dialogNewMethod = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table
        :headers="headers"
        :items="PaymentMethods"
    >
    </v-data-table>

    <v-dialog v-model="dialogNewMethod" max-width="600">
      <v-card v-if="dialogNewMethod">
        <v-card-title class="d-flex align-center pe-2">
          Nuevo Metodo de Pago
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogNewMethod = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-form ref="formNewMethod" class="pa-2" @submit.prevent="onSubmitNewMethodo">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="name"
                  autocomplete="off"
                  label="Nombre del Metodo de Pago *"
                  :rules="[val.req(), val.max(15)]"
                  counter="15"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
            <v-col v-if="!isCash" cols="12" md="12">
              <v-autocomplete
                  v-model="accountId"
                  autocomplete="off"
                  :items="AccountsParseaded"
                  label="Selecciona la Cuenta de Banco *"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
          </v-row>
          <v-checkbox v-model="isCash" label="¿Es una cuenta de efectivo?" />

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script setup lang="ts">
import {utilsStore} from "@/store/utilsStore";
import {onMounted, ref} from 'vue'
import {toast} from "vue3-toastify";
import type {PaymentMethodInterfaz} from "@/types/payment_methodsInterfacez";
import {useValidators} from "@/composables/useValidators";
import type {BankAccountInterfaz} from "@/types/bankInterfaz";
import {useBankServices} from "@/services/useBankServices";
import {useCcServices} from "@/services/useCcServices";

const val = useValidators();
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
  {key:'is_cash', title: '¿Efectivo?'},
  {key:'account.name', title: 'Cuenta'}
]
const PaymentMethods = ref<PaymentMethodInterfaz[]>([]);
const PaymentMethod  = ref<PaymentMethodInterfaz>(null)
const dialogoEdit = ref(false);
const dialogNewMethod = ref(false);
const name           = ref('');
const isCash         = ref(false);
const accountId      = ref(null)
const formNewMethod = ref(null);
const BankAccounts   = ref<BankAccountInterfaz[]>([])

const AccountsParseaded = computed(()=>{
  return BankAccounts.value.map((item:BankAccountInterfaz)=>{
    return {title:item.nickname+' - '+item.bank?.name, value:item.account_id}
  })
})
onMounted(async ()=>{
  BankAccounts.value = await useBankServices().getAccounts();
  PaymentMethods.value = await useCcServices().getPaymentMethods();
})
// const formNewBank = ref<any>(null)
// const formEditBank = ref<any>(null)
//
// // ---------- Rules ----------
// const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
// const max = (n: number, m?: string) => (v: any) =>
//     (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)
//
//
const openDialogeEdit = (event:any, data:{item:PaymentMethodInterfaz})=>{
  PaymentMethod.value = data.item;
  dialogoEdit.value   = true;
}
//
const onSubmitNewMethodo = async () => {
  const result = await formNewMethod.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  utilsStore().setLoading(true);

  dialogNewMethod.value = false;
  try {
    const newMethod = await $fetch<PaymentMethodInterfaz>(`/api/cc/payment_method`, {
      method: 'POST',
      body: {
        name: name.value,
        is_cash: isCash.value,
        account_id: accountId.value
      }
    })

    name.value = '';
    isCash.value = false;
    accountId.value = null;
    PaymentMethods.value = await useCcServices().getPaymentMethods();
    toast.success('Banco creado', { autoClose: 2500 })
  } catch (err) {
    dialogNewMethod.value = true;
    toast.error('No se pudo crear el banco', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
// const onEditBank = async () => {
//   const result = await formEditBank.value?.validate()
//   if (!result?.valid) {
//     toast.error('Revisa los campos del formulario', { autoClose: 3000 })
//     return
//   }
//
//   dialogoEdit.value = false
//   utilsStore().setLoading(true)
//   try {
//     const newBank = await $fetch<BankInterfaz>(`/api/bank/${Bank.value.id}`, {
//       method: 'PUT',
//       body: {
//         name: Bank.value.name?.trim(),
//       }
//     })
//     Banks.value = await useEmployeeServices().getBanks();
//     toast.success('Banco editado', { autoClose: 2500 })
//   } catch (err) {
//     dialogoEdit.value = true;
//     toast.error('No se puede editar el banco', { autoClose: 3000 })
//   } finally {
//     utilsStore().setLoading(false)
//   }
// }
</script>

<style scoped>

</style>
