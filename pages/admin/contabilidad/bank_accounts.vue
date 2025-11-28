<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Cuentas de Bancos
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table
        :headers="headers"
        :items="accounts"
        @click:row="openDialogoEdit"
    >
      <template v-slot:item.is_checking="{ value }">
        <span class="success" v-if="value">Si</span>
        <span class="red" v-else>No</span>
      </template>
    </v-data-table>

    <v-dialog v-model="dialogoEdit" max-width="600">
      <v-card v-if="dialogoEdit">
        <v-card-title class="d-flex align-center pe-2">
          Editando Cuenta:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoEdit = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>#{{Account.number}} {{Account.nickname}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-form ref="formRef" class="pa-2" @submit.prevent="onEditAccount">
          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="Account.number"
                  label="# de Cuenta *"
                  :rules="[req(), max(25)]"
                  counter="25"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
            <!---->
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="Account.nickname"
                  label="Nickname *"
                  :rules="[req(),max(25)]"
                  counter="25"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                  v-model="Account.bank.id"
                  :items="Banks"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Banco *"
                  :rules="[req]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
          </v-row>
          <v-checkbox label="¿Es cuenta de cheques?" v-model="Account.is_checking"></v-checkbox>
          <v-card-text>El nombre y el codigo de la cuenta contable no se puede editar, la cc siempre tendra el codigo de
          {{Account.account.code}} y nombre {{Account.account.name}}</v-card-text>
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
import {onMounted, ref} from "vue";
import type {BankAccountInterfaz} from "@/types/bankInterfaz";
import {useBankServices} from "@/services/useBankServices";
import type {BankInterfaz} from "@/types/bankInterfaz";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const accounts = ref<BankAccountInterfaz[]>([]);
const Account  = ref<BankAccountInterfaz | null>(null);
const Banks    = ref<BankInterfaz[]>([])
const dialogoEdit = ref(false);
const formRef     = ref(null);
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)
const headers = [
  {
    align: 'start',
    key: 'number',
    sortable: false,
    title: '# de Cuenta',
  },
  { key: 'nickname', title: 'Nickname' },
  { key: 'is_checking', title: '¿Cuenta de Cheques?' },
  { key: 'bank.name', title: 'Banco' },
  { key: 'account.code', title: 'CC' },
]

onMounted( async ()=>{
  accounts.value = await useBankServices().getAccounts();
  Banks.value    = await useBankServices().getBanks();
})

const openDialogoEdit = (event:any, data:{item:BankAccountInterfaz}) => {
  Account.value     = data.item;
  dialogoEdit.value = true
}

const onEditAccount = async ()=>{
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoEdit.value = false
  utilsStore().setLoading(true)
  try {
    const updated = await $fetch<BankAccountInterfaz>(`/api/bank/account/${Account.value.id}`, {
      method: 'PUT',
      body: {
        number: Account.value.number?.trim(),
        nickname: Account.value.nickname?.trim(),
        bank_id: Account.value.bank.id ,
        is_checking: Account.value.is_checking,
      }
    })
    accounts.value = await useBankServices().getAccounts();
    toast.success('Cuenta de banco actualizada', { autoClose: 2500 })
  } catch (err) {
    dialogoEdit.value = true;
    toast.error('No se pudo actualizar la cuenta de banco', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
