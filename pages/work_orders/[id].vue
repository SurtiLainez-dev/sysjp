<template>
  <v-card flat tile>
    <div v-if="pending">Loading order...</div>
    <div v-else-if="error">Error loading order</div>
    <div v-else>
      <Work_orden_component
          v-model:order="order"
          v-model:items="items"
          :mode="order.status === 'OPEN'?'edit':'closed'"
          @submit="handleEdit"
      />
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import Work_orden_component from "@/components/forms/work_orden_component.vue";
import { utilsStore } from '@/store/utilsStore'
import { toast } from 'vue3-toastify'

const route = useRoute()
const orderId = route.params.id as string

const { data, pending, error } = await useAsyncData('loadOrder', () =>
    $fetch(`/api/work_orders/${orderId}`)
)

const order = ref({
  office_id: null as number | null,
  customer_id: null as number | null,
  notes: '',
  detalle: '',
  descuento: 0,
  subtotal: 0,
  total: 0,
  created_at: Date,
  update_at: Date,
  id: null
  // status: 'open' as any
})
type UIItem = {
  id?: number | null
  persisted?: boolean
  removed?: boolean
  cod: string
  articulo_id: number | null
  nombre: string
  precio: number
  cant: number
  total: number
  note?: string | null,
  status: 'OPEN' | 'CERRADA'
}
const items = ref<UIItem[]>([
  { id: null, persisted: false, removed: false, cod: '', articulo_id: null, nombre: '', precio: 0, cant: 0, total: 0 }
])

watchEffect(() => {
  if (data.value?.ok && data.value.data) {
    const d = data.value.data
    order.value = {
      id:          d.meta.id,
      office_id:   d.order.office_id,
      customer_id: d.order.customer_id,
      notes:       d.order.notes ?? '',
      detalle:     d.order.detalle ?? '',
      descuento:   d.order.descuento ?? 0,
      subtotal:    d.order.subtotal ?? 0,
      total:       d.order.total ?? 0,
      updated_at:  d.meta.updated_at,
      created_at:  d.meta.created_at,
      status: d.order.status
    }

    const mapped: UIItem[] = (d.items ?? []).map((i: any) => ({
      id: i.id ?? null,
      persisted: !!i.id,
      removed: false,
      cod: i.cod,
      articulo_id: i.articulo_id,
      nombre: i.nombre,
      precio: Number(i.precio),
      cant: Number(i.cant),
      total: Number(i.total),
      note: i.note ?? null,
    }))

    items.value = [
      { id: null, persisted: false, removed: false, cod: '', articulo_id: null, nombre: '', precio: 0, cant: 0, total: 0 },
      ...mapped
    ]
  }
})

async function handleEdit(payload: { order: any; items: any[]; total: number }) {
  utilsStore().setLoading(true)
  try {
    await $fetch(`/api/work_orders/${orderId}`, {
      method: 'PUT',
      body: {
        items:       payload.items,
        job_detail:  payload.order.detalle,
        notes:       payload.order.notes,
        total:       payload.total ?? payload.order.total
      }
    })
    toast.success('Orden actualizada', { autoClose: 2000 });
    navigateTo('/work_orders/open')
  } catch (err: any) {
    toast.error(err?.statusMessage ?? 'Error al actualizar', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
</script>

