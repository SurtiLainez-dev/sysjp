<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Creando Oficina Nueva
    </v-card-title>

    <v-form ref="formRef" class="pa-2" @submit.prevent="onSubmitOffice">
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
              :rules="[req(), max(80)]"
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
              :rules="[req(),phoneRule, max(10)]"
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
              :rules="[req(), max(180)]"
              counter="180"
              prepend-inner-icon="mdi-map-marker-outline"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2 justify-end mt-2">
        <v-btn color="primary" type="submit" tile>
          Registrar Oficina
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script lang="ts" setup>
import {utilsStore} from "@/store/utilsStore";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {toast} from "vue3-toastify";
import {ref} from "vue";
import {navigateTo} from "nuxt/app";
const formRef = ref<any>(null)

const req = (m = 'Requerido') => (v: any) => !!String(v ?? '').trim() || m
const max = (n: number, m?: string) => (v: any) =>
    (v == null || String(v).length <= n) || (m ?? `Máx. ${n} caracteres`)


const phoneRule = (v: any) => {
  if (!v) return true
  return /^[\d\s()+-]{7,20}$/.test(String(v)) || 'Teléfono inválido'
}
const Oficina = <OficinaInterfaz>ref({
  name: '',
  nickname: '',
  phone: '',
  address: '',
  email: ''
});

const onSubmitOffice = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  utilsStore().setLoading(true);

  try {
    const newOffice = await $fetch(`/api/offices/office`, {
      method: 'POST',
      body: {
        name: Oficina.value.name?.trim(),
        nickname: Oficina.value.nickname?.trim() || null,
        email: Oficina.value.email?.trim() || null,
        phone: Oficina.value.phone?.trim() || null,
        address: Oficina.value.address?.trim() || null,
      }
    })

    toast.success('Oficina creada', { autoClose: 2500 })
    navigateTo('/admin/oficinas/')
  } catch (err) {
    toast.error('No se pudo crear la oficina', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
