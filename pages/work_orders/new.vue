<template>
  <Work_orden_component
      v-model:order="order"
      v-model:items="items"
      mode="create"
      @submit="handleCreate"
  />
</template>

<script setup lang="ts">
import Work_orden_component from "@/components/forms/work_orden_component.vue";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const order = ref({
  office_id: null,
  customer_id: null,
  notes: '',
  detalle: '',
  descuento: 0
})
const items = ref([
  { cod: '', articulo_id: null, nombre: '', precio: 0, cant: 0, total: 0 }
])

async function handleCreate(payload: { order: any; items: any[]; total: number }) {
  utilsStore().setLoading(true)
  try {
    await $fetch('/api/work_orders/save', {
      method: 'POST',
      body: {
        items: payload.items,
        customer_id: payload.order.customer_id,
        job_detail: payload.order.detalle,
        notes: payload.order.notes,
        total: payload.total
      }
    })
    toast.success('Orden registrada', { autoClose: 2000 })
    navigateTo('/work_orders/open')
  } catch (err: any) {
    toast.error(err?.statusMessage ?? 'Error al registrar', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

<style scoped>

</style>
