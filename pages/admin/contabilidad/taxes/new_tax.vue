<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Creando un Nuevo Impuesto
      <v-spacer></v-spacer>
    </v-card-title>

    <v-divider></v-divider>

    <v-form ref="formRef" class="pa-2" @submit.prevent="onSubmitTax">
      <v-row class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field
              v-model="tax.name"
              label="Nombre del Impuesto*"
              :rules="[val.req(), val.max(25)]"
              counter="25"
              variant="outlined"
              density="comfortable"
              required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="tax.rate"
              label="Porcenta del Impuesto"
              :rules="[val.req(), val.isMoney]"
              :suffix="tax.rate+' %'"
              variant="outlined"
              density="comfortable"
              required
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2 justify-end mt-2">
        <v-btn color="primary" type="submit" tile>
          Registrar Impuesto
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script lang="ts" setup>
import {useValidators} from "@/composables/useValidators";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const formRef = ref(null)
const val = useValidators();
const tax = ref({
  name: '',
  rate: '',
})

const onSubmitTax = async ()=>{
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  utilsStore().setLoading(true);
  let rate = (tax.value.rate/100).toFixed(3)
  try{
    const Tax = await $fetch(`/api/cc/tax`, {
      method: 'POST',
      body:{
        name: tax.value.name,
        rate
      }
    });

    toast.success('Se ha registrado exitosamente el impuesto', { autoClose: 3000 })
  }catch (err){
    toast.error('No se pudo crear el impuesto', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
    navigateTo('/admin/contabilidad/taxes/');
  }
}
</script>

<style scoped>

</style>
