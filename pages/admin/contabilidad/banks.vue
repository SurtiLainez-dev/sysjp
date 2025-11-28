<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Bancos
      <v-spacer></v-spacer>
      <v-btn size="xs" color="secondary" icon tile @click="dialogoNewBank = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table
        :headers="headers"
        :items="Banks"
        @click:row="openDialogeEdit"
    >
    </v-data-table>


    <v-dialog v-model="dialogoNewBank" max-width="600">
      <v-card v-if="dialogoNewBank">
        <v-card-title class="d-flex align-center pe-2">
          Nuevo Banco
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoNewBank = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-form ref="formNewBank" class="pa-2" @submit.prevent="onSubmitNewBank">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="nameBank"
                  label="Nombre del Banco *"
                  :rules="[req(), max(30)]"
                  counter="30"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoEdit" max-width="600">
      <v-card v-if="dialogoEdit">
        <v-card-title class="d-flex align-center pe-2">
          Editando Banco:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoEdit = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{Bank.name}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-form ref="formEditBank" class="pa-2" @submit.prevent="onEditBank">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="Bank.name"
                  label="Nombre del Banco *"
                  :rules="[req(), max(30)]"
                  counter="30"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
          </v-row>

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
import type {BankInterfaz} from "@/types/bankInterfaz";
import {useBankServices} from "@/services/useBankServices"
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
]
const Banks = ref<BankInterfaz[]>([]);
const Bank  = ref<BankInterfaz | null>(null);
const dialogoEdit = ref(false);
const dialogoNewBank = ref(false);
const nameBank       = ref('');
onMounted(async ()=>{
  Banks.value = await useBankServices().getBanks();
})
const formNewBank = ref<any>(null)
const formEditBank = ref<any>(null)

// ---------- Rules ----------
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)


const openDialogeEdit = (event:any, data:{item:BankInterfaz})=>{
  Bank.value        = data.item;
  dialogoEdit.value = true;
}

const onSubmitNewBank = async () => {
  const result = await formNewBank.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoNewBank.value = false
  utilsStore().setLoading(true)
  try {
    const newBank = await $fetch<BankInterfaz>(`/api/bank/save`, {
      method: 'POST',
      body: {
        name: nameBank.value?.trim(),
      }
    })
    Banks.value = await useBankServices().getBanks();
    nameBank.value = '';
    toast.success('Banco creado', { autoClose: 2500 })
  } catch (err) {
    dialogoNewBank.value = true;
    toast.error('No se pudo crear el banco', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
const onEditBank = async () => {
  const result = await formEditBank.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoEdit.value = false
  utilsStore().setLoading(true)
  try {
    const newBank = await $fetch<BankInterfaz>(`/api/bank/${Bank.value.id}`, {
      method: 'PUT',
      body: {
        name: Bank.value.name?.trim(),
      }
    })
    Banks.value = await useEmployeeServices().getBanks();
    toast.success('Banco editado', { autoClose: 2500 })
  } catch (err) {
    dialogoEdit.value = true;
    toast.error('No se puede editar el banco', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
