<template>
<v-card flat tile>
  <v-card-title class="d-flex align-center pe-2">
    Oficinas

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
      :items="oficinas"
      @click:row="editOficina"
  >
  </v-data-table>


  <v-dialog v-model="dialogoEdit" max-width="600">
    <v-card v-if="dialogoEdit">
      <v-card-title class="d-flex align-center pe-2">
        Editando Oficina
        <v-spacer></v-spacer>
        <v-btn rounded size="xs" color="red" @click="dialogoEdit = false" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle>{{Oficina.name}}</v-card-subtitle>
      <v-divider></v-divider>
      <v-form ref="formRef" class="pa-2" @submit.prevent="onEditOficina">
        <v-row class="mt-3">
          <v-col cols="12" md="6">
            <v-text-field
                v-model="Oficina.name"
                label="Nombre *"
                :rules="[req(), max(80)]"
                counter="80"
                prepend-inner-icon="mdi-office-building"
                variant="outlined"
                density="comfortable"
                required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
                v-model="Oficina.nickname"
                label="Nickname *"
                :rules="[max(80)]"
                counter="80"
                prepend-inner-icon="mdi-tag-text-outline"
                variant="outlined"
                density="comfortable"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
                v-model="Oficina.email"
                label="Email"
                counter="120"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="comfortable"
                type="email"
                autocomplete="email"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
                v-model="Oficina.phone"
                label="Teléfono *"
                :rules="[phoneRule, max(10)]"
                counter="20"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="comfortable"
                placeholder="000-000-0000"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
                v-model="Oficina.address"
                label="Dirección *"
                :rules="[req, max(180)]"
                counter="180"
                prepend-inner-icon="mdi-map-marker-outline"
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
const search = ref('');
const load   = ref(false);
const oficinas = ref<OficinaInterfaz[] | []>([])
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
  { key: 'nickname', title: 'Nickname' },
  { key: 'email', title: 'Email' },
  { key: 'phone', title: 'Telefono' },
  { key: 'address', title: 'Direción' },
]
const dialogoEdit = ref(false);
const Oficina = ref<OficinaInterfaz | null>(null)
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
onMounted(()=>{
  getOffices();
})
const getOffices = async () => {
  load.value = true
  try {
    const res = await $fetch<{ ok: boolean; data: OficinaInterfaz[] }>('/api/offices/offices')
    oficinas.value = res.data
    toast.success("Oficinas cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar oficinas", { autoClose: 3000 })
  } finally {
    load.value = false
  }
}

const editOficina = (event:any, data:{item:OficinaInterfaz})=>{
  Oficina.value = data.item;
  dialogoEdit.value = true;
}

const onEditOficina = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  dialogoEdit.value = false
  utilsStore().setLoading(true)
  try {
    const updated = await $fetch<OficinaInterfaz>(`/api/offices/${Oficina.value.id}`, {
      method: 'PUT',
      body: {
        name: Oficina.value.name?.trim(),
        nickname: Oficina.value.nickname?.trim() || null,
        email: Oficina.value.email?.trim() || null,
        phone: Oficina.value.phone?.trim() || null,
        address: Oficina.value.address?.trim() || null,
      }
    })

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
