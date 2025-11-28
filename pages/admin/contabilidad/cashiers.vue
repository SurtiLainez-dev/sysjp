<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Cajas
      <v-spacer></v-spacer>
      <v-btn size="xs" color="secondary" @click="dialogNewCashier = true" icon tile ><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table
        :headers="headers"
        :items="Cashiers"
    >
    </v-data-table>

    <v-dialog v-model="dialogNewCashier" max-width="600">
      <v-card v-if="dialogNewCashier">
        <v-card-title class="d-flex align-center pe-2">
          Nueva Caja
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogNewCashier = false" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="formNewCashier" class="pa-2" @submit.prevent="onSubmitNewCashier">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-autocomplete
                  v-model="newCaja.office_id"
                  label="Sucursal *"
                  item-title="name"
                  item-value="id"
                  autocomplete="off"
                  :items="Offices"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>

            <!-- Usuario -->
            <v-col cols="12" md="12">
              <v-autocomplete
                  v-model="newCaja.user_id"
                  label="Usuario Responsable *"
                  :items="ColaboradorsXoffice"
                  item-title="name"
                  autocomplete="off"
                  item-value="id"
                  :rules="[val.req()]"
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

import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import type {EmployeeInterfaz} from "@/types/employeeInterfaz";
import {useValidators} from "@/composables/useValidators";
import {useEmployeeServices} from "@/services/useEmployeeServices";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const headers = [
  {
    align: 'start',
    key: 'id',
    sortable: false,
    title: '#',
  },
  {key:'office.name', title: 'Oficina'},
  {key:'user.username', title: 'Usuario Responsable'}
]
const val = useValidators();
const dialogNewCashier = ref(false);
const Offices = ref<OficinaInterfaz[]>([]);
const Colaboradors = ref<EmployeeInterfaz[]>([]);
const Cashiers     = ref([])
const formNewCashier = ref(null)
const newCaja = ref({
  office_id: null,
  user_id: null
})
const ColaboradorsXoffice = computed(()=>{
  if (newCaja.value.office_id)
    return Colaboradors.value.filter((item:EmployeeInterfaz)=>item.office_id === newCaja.value.office_id)
  else{
    newCaja.value.user = null;
    return []
  }
})
onMounted(async ()=>{
  await getCashiers();
  Offices.value = await useEmployeeServices().getOffices();
  Colaboradors.value = await useEmployeeServices().getEmployees();
})

const getCashiers = async () => {
  try {
    const res = await $fetch<{ ok: boolean; data: OficinaInterfaz[] }>('/api/cc/cashiers')
    Cashiers.value = res.data
    toast.success("Cajas cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar las cajas", { autoClose: 3000 })
  } finally {
    //
  }
}

const onSubmitNewCashier = async ()=>{
  const result = await formNewCashier.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  utilsStore().setLoading(true);

  dialogNewCashier.value = false;
  try {
    const newCahier = await $fetch<PaymentMethodInterfaz>(`/api/cc/cashier`, {
      method: 'POST',
      body: {
        office_id: newCaja.value.office_id,
        user_id: newCaja.value.user_id
      }
    })

    newCaja.value.user_id = null;
    newCaja.value.office_id = null;
    toast.success('Caja creada', { autoClose: 2500 })
    Cashiers.value = await getCashiers();
  } catch (err) {
    dialogNewCashier.value = true;
    toast.error('No se pudo crear la caja', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
