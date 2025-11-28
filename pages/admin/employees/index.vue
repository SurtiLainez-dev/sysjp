<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Colaboradores de la Organización

      <v-spacer></v-spacer>

      <v-text-field
          v-model="search"
          density="compact"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table
        :headers="headers"
        :search="search"
        :loading="load"
        :items="employees"
        @click:row="openDialog"
    >
    </v-data-table>


    <v-dialog v-model="dialogoEdit" max-width="600">
      <v-card v-if="dialogoEdit">
        <v-card-title class="d-flex align-center pe-2">
          Editando Colaborador:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoEdit = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{Employee.name}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-form ref="formRef" class="pa-2" @submit.prevent="onEditEmployee">
          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="Employee.name"
                  label="Nombre *"
                  :rules="[req(), max(80)]"
                  counter="80"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
<!---->
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="Employee.phone"
                  label="Teléfono *"
                  :rules="[phoneRule, max(10)]"
                  counter="20"
                  variant="outlined"
                  density="comfortable"
                  placeholder="000-000-0000"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                  v-model="Employee.typeEmployee_id"
                  :items="typeEmployees"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Tipo de Colaborador *"
                  :rules="[req]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                  v-model="Employee.office_id"
                  :items="offices"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Oficina Asignada *"
                  :rules="[req]"
                  variant="outlined"
                  density="comfortable"
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
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {toast} from "vue3-toastify";
import type {EmployeeInterfaz, TypeEmployeeInterfaz} from "@/types/employeeInterfaz";
const search = ref('');
const load   = ref(false);
const employees = ref<EmployeeInterfaz[] | []>([])
const typeEmployees = ref<TypeEmployeeInterfaz[] | []>([]);
const offices       = ref<OficinaInterfaz[] | []>([])
import {useEmployeeServices} from "@/services/useEmployeeServices"
const employeeServices = useEmployeeServices();
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
  { key: 'phone', title: 'Tipo de Colaborador' },
  { key: 'office.name', title: 'Oficina Asignada' },
  { key: 'typeEmployee.name', title: 'Tipo de Colaborador' },
]
const dialogoEdit = ref(false);
const Employee = ref<EmployeeInterfaz | null>(null)
const formRef = ref<any>(null)

// ---------- Rules ----------
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)

// Teléfono: permite dígitos, espacios, guiones y paréntesis; 7–20 chars
const phoneRule = (v: any) => {
  if (!v) return true
  return /^[\d\s()+-]{7,20}$/.test(String(v)) || 'Teléfono inválido'
}
onMounted( async ()=>{
  employees.value    = await employeeServices.getEmployees()
  typeEmployees.value = await employeeServices.getTypeEmployees()
  offices.value       = await employeeServices.getOffices()
})

const openDialog = (event:any, data:{item:EmployeeInterfaz})=>{
  Employee.value = data.item;
  dialogoEdit.value = true;
}

const onEditEmployee = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoEdit.value = false
  utilsStore().setLoading(true)
  try {
    const updated = await $fetch<EmployeeInterfaz>(`/api/employees/${Employee.value.id}`, {
      method: 'PUT',
      body: {
        name: Employee.value.name?.trim(),
        typeEmployee_id: Employee.value.typeEmployee_id || null,
        phone: Employee.value.phone?.trim() || null,
        office_id: Employee.value.office_id || null,
      }
    })
    employees.value    = await employeeServices.getEmployees()
    toast.success('Oficina actualizada', { autoClose: 2500 })
  } catch (err) {
    dialogoEdit.value = true;
    toast.error('No se pudo actualizar la oficina', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
