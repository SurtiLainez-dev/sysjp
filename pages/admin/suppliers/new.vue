<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Creando un Proveedor Nuevo
    </v-card-title>

    <v-form ref="formRef" class="pa-2" @submit.prevent="onSubmitSupplier">
      <v-row class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field
              label="Nombre del Proveedor*"
              counter="50"
              v-model="Supplier.fullname"
              :rules="[val.req(), val.max(50)]"
              prepend-inner-icon="mdi-office-building"
              variant="outlined"
              density="comfortable"
              required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
              label="Nickname del Proveedor *"
              counter="20"
              v-model="Supplier.name"
              :rules="[val.req(), val.max(20)]"
              prepend-inner-icon="mdi-tag-text-outline"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
              label="Email"
              counter="120"
              v-model="Supplier.email"
              :rules="[val.req()]"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              type="email"
              autocomplete="email"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
              label="Teléfono *"
              v-model="Supplier.phone"
              counter="12"
              :rules="[val.req(), val.max(12)]"
              prepend-inner-icon="mdi-phone"
              variant="outlined"
              density="comfortable"
              placeholder="000-000-0000"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
              label="Dirección *"
              counter="180"
              :rules="[val.req(), val.max(180)]"
              v-model="Supplier.address"
              prepend-inner-icon="mdi-map-marker-outline"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2 justify-end mt-2">
        <v-btn color="primary" type="submit" tile>
          Registrar Proveedor
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import type {SupplierInterfaz} from '@/types/supplierInterfaz';
import {ref} from "vue";
import {useValidators} from "@/composables/useValidators"
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const formRef = ref(null)
const val = useValidators();
const Supplier = <SupplierInterfaz>ref({
  fullname: '',
  name: '',
  phone: '',
  address: '',
  email: ''
});


const onSubmitSupplier = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  utilsStore().setLoading(true)
  try{
    const Payroll = await $fetch(`/api/suppliers/supplier`, {
      method: 'POST',
      body:{
        name:     Supplier.value.fullname,
        nickname: Supplier.value.name,
        phone:    Supplier.value.phone,
        address:  Supplier.value.address,
        email:    Supplier.value.email
      }
    });

    toast.success('Se ha registrado exitosamente el proveedor', { autoClose: 3000 })
  }catch (err){
    toast.error('No se pudo crear el proveedor', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
    navigateTo('/admin/suppliers/');
  }
}
</script>

<style scoped>

</style>
