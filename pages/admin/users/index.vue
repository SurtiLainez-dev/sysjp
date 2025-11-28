<template>
<v-card flat tile>
  <v-card-title class="d-flex align-center pe-2">
    Usuarios Existentes

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
    <v-spacer></v-spacer>
    <v-btn size="xs" color="secondary" icon tile @click="dialogoNewUser = true"><v-icon>mdi-plus</v-icon></v-btn>
  </v-card-title>

  <v-divider></v-divider>
  <v-data-table
      :headers="headers"
      :search="search"
      :loading="load"
      :items="users"
  >
    <template v-slot:item.username="{ value }">
      {{value}} <span v-if="value == authStore().Username">(me)</span>
    </template>
    <template v-slot:item.is_admin="{ value }">
      <span v-if="value">Si</span>
      <span v-else>No</span>
    </template>

    <template v-slot:item.id="{ item }">
      <div class="d-flex row">
        <v-btn v-if="item.is_active" density="comfortable" :disabled="item.username == authStore().Username" icon="mdi-lock-off" @click="onBlockUser(item.id)" color="primary"></v-btn>
        <v-btn  v-if="!item.is_active" density="comfortable" :disabled="item.username == authStore().Username" class="text-white" icon="mdi-account-reactivate" color="accent" @click="onReactivateUser(item.id)"></v-btn>
        <v-btn density="comfortable" class="ml-2" icon="mdi-account-edit" color="secondary" @click="openDialogoEdit(item, 1)"></v-btn>
        <v-btn density="comfortable" class="ml-2 text-white" icon="mdi-lock-reset" color="accent" @click="openDialogoEdit(item, 2)"></v-btn>
      </div>
    </template>

    <template v-slot:item.is_active="{ value }">
      <span class="success" v-if="value">Si</span>
      <span class="red" v-else>No</span>
    </template>
  </v-data-table>

  <v-dialog v-model="dialogoNewUser" max-width="600">
    <v-card class="pa-3">
      <v-card-title class="d-flex align-center pe-2">
        Creando Nuevo Usuario
        <v-spacer></v-spacer>
        <v-btn rounded size="xs" color="red" @click="dialogoNewUser = false" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-form autocomplete="off" ref="FormNewUser" @submit.prevent="onSubmitNewUser">
        <v-row class="mt-3">
          <v-col cols="12" md="12">
            <v-select
                v-model="newUser.office_id"
                :items="offices"
                :item-value="'id'"
                :item-title="'name'"
                label="Seleccionar Oficina *"
                :rules="[req]"
                @update:modelValue="loadEmployees"
                variant="outlined"
                density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="12">
            <v-select
                v-model="newUser.employee_id"
                :items="employees"
                :item-value="'id'"
                :item-title="'name'"
                label="Seleccionar un Colaborador *"
                :rules="[req]"
                variant="outlined"
                density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="12">
            <v-text-field
                v-model="newUser.username"
                label="Nombre de Usuario *"
                :rules="[req(), max(20)]"
                counter="20"
                variant="outlined"
                density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="12">
            <v-text-field
                v-model="newUser.pin"
                label="Pin de Acces *"
                :rules="[req(), max(4)]"
                counter="4"
                variant="outlined"
                density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="12">
            <v-checkbox v-model="newUser.is_admin" label="¿Darle privilegios de administrador?"/>
          </v-col>
        </v-row>

        <div class="d-flex ga-2 justify-end mt-2">
          <v-btn color="primary" type="submit" tile>
            Guardar Usuario
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogoEditUser" max-width="600">
    <v-card v-if="dialogoEditUser" class="pa-3">
      <v-card-title class="d-flex align-center pe-2">
        Editando Usuario:
        <v-spacer></v-spacer>
        <v-btn rounded size="xs" color="red" @click="dialogoEditUser = false" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle>{{User.username}}</v-card-subtitle>
      <v-divider></v-divider>

      <v-form ref="FormEditUser" @submit.prevent="onEditUser">
        <v-row class="mt-3">
          <v-col cols="12" md="12">
            <v-text-field
                v-model="User.username"
                label="Cambiar Nombre de Usuario"
                :rules="[req(), max(20)]"
                counter="20"
                variant="outlined"
                density="comfortable"
            />
          </v-col>
        </v-row>
        <div class="d-flex ga-2 justify-end mt-2">
          <v-btn color="primary" type="submit" tile>
            Guardar Edición del Usuario
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogoNewPin" max-width="600">
    <v-card v-if="dialogoNewPin" class="pa-3">
      <v-card-title class="d-flex align-center pe-2">
        Editando Pin de: {{User.username}}
        <v-spacer></v-spacer>
        <v-btn rounded size="xs" color="red" @click="dialogoNewPin = false" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle>{{User.username}}</v-card-subtitle>
      <v-divider></v-divider>

      <v-form ref="FormEditPin" @submit.prevent="onSubmitNewPin">
        <v-row class="mt-3">
          <v-col cols="12" md="12">
            <v-text-field
                v-model="newUser.pin"
                label="Ingresar Nuevo Pin del Usuario"
                :rules="[req(), max(4)]"
                counter="4"
                variant="outlined"
                inputmode="numeric"
                pattern="[0-9]*"
                type="tel"
                density="comfortable"
            />
          </v-col>
        </v-row>
        <div class="d-flex ga-2 justify-end mt-2">
          <v-btn color="primary" type="submit" tile>
            Guardar Nuevo Pin
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</v-card>
</template>

<script setup lang="ts">
import {utilsStore} from "@/store/utilsStore";
import {useUserServices} from '@/services/useUserService'
import {onMounted, ref} from "vue";
import type {UserInterfaz} from "@/types/userInterfaz";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {useEmployeeServices} from "@/services/useEmployeeServices";
import type {EmployeeInterfaz} from "@/types/employeeInterfaz";
import {toast} from "vue3-toastify";
import {authStore} from "@/store/authStore";

const headers = [
  {align: 'start', key: 'username', sortable: false, title: 'Usuario',},
  { key: 'is_admin', title: 'Is_Admin' },
  { key: 'employee.name', title: 'Colaborador Asignado'},
  { key: 'is_active', title: '¿Activo?'},
  { key: 'id', title: 'Acciones'},
]
const load = ref(false);
const search = ref('');
const users = ref<UserInterfaz[]>([]);
const userServices = useUserServices();
const employeeServices = useEmployeeServices();
const dialogoNewUser  = ref(false);
const dialogoEditUser = ref(false);
const dialogoNewPin   = ref(false);
const User = ref<UserInterfaz | null>(null)
const newUser = ref({
  employee_id: null,
  office_id: null,
  username: '',
  pin: '',
  is_admin: false,
  is_active: false
})
const FormNewUser = ref<any>(null)
const offices = ref<OficinaInterfaz[]>([]);
const employees = ref<EmployeeInterfaz[]>([])
const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)

onMounted(async ()=>{
  users.value   = await userServices.getUsers();
  offices.value = await  employeeServices.getOffices();
})

const loadEmployees = async ()=>{
  utilsStore().setLoading(true)
  console.log(newUser.value.office_id)
  try {
    const Employees = await $fetch<EmployeeInterfaz[]>(`/api/employees/x_office/${newUser.value.office_id}`)
    employees.value = Employees.data
    toast.success('Colaboradores cargados', { autoClose: 2500 })
  } catch (err) {
    toast.error('No se pudieron cargar los colaboradores', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
const logout = async () => {
  utilsStore().setLoading(true);
  try{
    await $fetch('/api/auth/logout',{method: 'post'});
    toast.success("Se ha cerrado sesión correctamente", { autoClose: 3000 })
  }catch (err:any){
    toast.error("Error", { autoClose: 3000 })
  }finally {
    await navigateTo('/login');
    utilsStore().setLoading(false);
  }
}
const onBlockUser = async (id) => {
  try {
    await $fetch('/api/users/block/'+id,{
      method: 'put',
    })

    toast.success('Usuario bloqueado exitosamente', { autoClose: 2500 })
    users.value   = await userServices.getUsers();
  } catch (err: any){
    const msg = err?.statusMessage || "Error desconocido al bloquear usuario"
    toast.error(msg, { autoClose: 3000 })
    dialogoNewUser.value = false
    return null
  }
}
const onEditUser = async () => {
  if (User.value.username && User.value.username.length <= 5){
    toast.error('El nombre de usuario tiene que ser mayor a 5 letras', { autoClose: 3000 })
    return
  }
  dialogoEditUser.value = false

  try {
    await $fetch('/api/users/'+User.value.id,{
      method: 'put',
      body:{
        username: User.value.username
      }
    })

    toast.success('Usuario editado exitosamente', { autoClose: 2500 })
    users.value   = await userServices.getUsers();
  } catch (err: any){
    const msg = err?.statusMessage || "Error desconocido al editar usuario"
    toast.error(msg, { autoClose: 3000 })
    dialogoEditUser.value = true
    return null
  }
}
const onReactivateUser = async (id) => {
  try {
    await $fetch('/api/users/reactivate/'+id,{
      method: 'put',
    })

    toast.success('Usuario reactivado exitosamente', { autoClose: 2500 })
    users.value   = await userServices.getUsers();
  } catch (err: any){
    const msg = err?.statusMessage || "Error desconocido al reactivar usuario"
    toast.error(msg, { autoClose: 3000 })
    dialogoNewUser.value = false
    return null
  }
}
const onSubmitNewPin = async () => {
  if (!validarPin(newUser.value.pin, 4)){
    toast.error('El pin solo debe contener números y debe ser de 4 digitos', { autoClose: 3000 })
    return
  }

  dialogoNewPin.value = false
  try{
    await $fetch(`/api/users/${User.value.id}/pin`,{
      method: 'put',
      body:{
        pin: newUser.value.pin,
      }
    })

    toast.success('Usuario agregado exitosamente', { autoClose: 2500 })

    if (authStore().Username == User.value.username){

    }else
    users.value   = await userServices.getUsers();
  }catch (err: any) {
    const msg = err?.statusMessage || "Error desconocido al registrar usuario"
    toast.error(msg, {autoClose: 3000})
    dialogoNewPin.value = false
    return null
  }
}
const onSubmitNewUser = async ()=>{
  const result = await FormNewUser.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoNewUser.value = false;

  try {
    await $fetch('/api/users/save',{
      method: 'post',
      body:{
        username: newUser.value.username,
        password: newUser.value.pin,
        employee_id: newUser.value.employee_id,
        is_admin: newUser.value.is_admin
      }
    })

    toast.success('Usuario agregado exitosamente', { autoClose: 2500 })
    users.value   = await userServices.getUsers();
  } catch (err: any){
    const msg = err?.statusMessage || "Error desconocido al registrar usuario"
    toast.error(msg, { autoClose: 3000 })
    dialogoNewUser.value = false
    return null
  }finally {
    newUser.value.employee_id = null;
    newUser.value.office_id   = null;
    newUser.value.pin         = '';
    newUser.value.is_admin    = false;
    newUser.value.username    = '';
  }

}

const openDialogoEdit = (user:UserInterfaz, type: number) => {
  User.value = user;
  if (type === 1) dialogoEditUser.value = true
  else dialogoNewPin.value = true
}

const validarPin = (pin:string, length:number = 4) => {
  const regex = new RegExp(`^[0-9]{${length}}$`)
  return regex.test(pin)
}

</script>

<style scoped>

</style>
