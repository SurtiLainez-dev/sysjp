<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Cuenta de Banco Nueva
    </v-card-title>

    <v-form ref="formRef" class="pa-2" @submit.prevent="onSubmitCuentaBanco">
      <v-row class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field
              v-model="bank.num"
              label="# de Cuenta *"
              :rules="[req(), max(25)]"
              counter="25"
              variant="outlined"
              density="comfortable"
              required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
              v-model="bank.nickname"
              label="Nickname *"
              :rules="[req(), max(25)]"
              counter="25"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12">
          <v-select
              v-model="bank.bank_id"
              :items="Banks"
              :item-value="'id'"
              :item-title="'name'"
              label="Seleccione un Banco *"
              :rules="[req]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
      </v-row>
      <v-checkbox label="¿Es cuenta de cheques?" v-model="bank.is_checking"></v-checkbox>

      <div class="d-flex ga-2 justify-end mt-2">
        <v-btn color="primary" type="submit" tile>
          Guardar
        </v-btn>
      </div>
    </v-form>

  </v-card>
</template>

<script lang="ts" setup>
import {utilsStore} from "@/store/utilsStore";
import {toast} from "vue3-toastify";
import {onMounted, ref} from "vue";
import {useBankServices} from "@/services/useBankServices"
import type {BankInterfaz} from "@/types/bankInterfaz";

const formRef = ref<any>(null);
const typeEmployees = ref<BankInterfaz[]>([]);
const bank = ref<BankInterfaz>({
  num: '',
  bank_id: null,
  is_checking: false,
  nickname: ''
})
const Banks = ref<BankInterfaz[]>([]);
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)

onMounted(async ()=>{
  Banks.value = await useBankServices().getBanks();
})
const onSubmitCuentaBanco = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true);

  try {
    const newAccount = await $fetch(`/api/bank/account/save`, {
      method: 'POST',
      body: {
        num: bank.value.num?.trim(),
        nickname: bank.value.nickname?.trim(),
        bank_id: bank.value.bank_id,
        is_checking: bank.value.is_checking
      }
    })

    toast.success('Cuenta de banco creado', { autoClose: 2500 })
    navigateTo('/admin/contabilidad/bank_accounts')
  } catch (err) {
    toast.error('No se puedo crear la cuenta de banco', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false);
  }
}
</script>

<style scoped>

</style>
