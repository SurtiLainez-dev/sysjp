<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Colaborador Nuevo
      <v-spacer></v-spacer>
      <v-btn size="xs" color="secondary" icon tile @click="dialogoNewType = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-form ref="formRef" class="pa-2" @submit.prevent="onSubmitEmployee">
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

    <v-dialog v-model="dialogoNewType" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Nuevo Tipo de Colaborador
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoNewType = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-form ref="FormNewType" @submit.prevent="onSubmitTypeEmployee">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="Type.name"
                  label="Nombre *"
                  :rules="[req(), max(80)]"
                  counter="80"
                  variant="outlined"
                  density="comfortable"
                  required
              />
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end">
            <v-btn color="primary" type="submit" tile>
              Guardar
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import {utilsStore} from "@/store/utilsStore";
import {toast} from "vue3-toastify";
import {onMounted, ref} from "vue";
import type {EmployeeInterfaz, TypeEmployeeInterfaz} from "@/types/employeeInterfaz";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {useEmployeeServices} from "@/services/useEmployeeServices"
import {navigateTo} from "nuxt/app";
const employeeServices = useEmployeeServices();
const formRef = ref<any>(null);
const FormNewType = ref<any>(null);
const typeEmployees = ref<TypeEmployeeInterfaz[] | []>([]);
const offices       = ref<OficinaInterfaz[] | []>([])
const dialogoNewType = ref(false)
const Employee = ref<EmployeeInterfaz>({
  name: '',
  phone: '',
  typeEmployee_id: null,
  office_id: null,
  id: 0,
})
const Type = ref<TypeEmployeeInterfaz>({
  name: ''
})
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)

// Teléfono: permite dígitos, espacios, guiones y paréntesis; 7–20 chars
const phoneRule = (v: any) => {
  if (!v) return true
  return /^[\d\s()+-]{7,20}$/.test(String(v)) || 'Teléfono inválido'
}

onMounted(async ()=>{
  typeEmployees.value = await employeeServices.getTypeEmployees();
  offices.value       = await employeeServices.getOffices();
})

const onSubmitEmployee = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true);

  try {
    const newOffice = await $fetch(`/api/employees/employee`, {
      method: 'POST',
      body: {
        name:            Employee.value.name?.trim(),
        phone:           Employee.value.phone?.trim() || null,
        typeEmployee_id: Employee.value.typeEmployee_id,
        office_id:       Employee.value.office_id
      }
    })

    toast.success('Empleados creado', { autoClose: 2500 })
    navigateTo('/admin/employees/')
  } catch (err) {
    toast.error('No se crear el empleado', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}

const onSubmitTypeEmployee = async () => {
  const result = await FormNewType.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true);

  try {
    dialogoNewType.value = false;
    const newType = await $fetch(`/api/employees/type_employee`, {
      method: 'POST',
      body: {
        name: Type.value.name?.trim(),
      }
    })

    toast.success('Tipo de colaborador creado', { autoClose: 2500 })
    typeEmployees.value = await employeeServices.getTypeEmployees();
  } catch (err) {
    dialogoNewType.value = true;
    toast.error('No se puedo crear el tipo de  empleado', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false);
  }
}

</script>

<style scoped>

</style>
