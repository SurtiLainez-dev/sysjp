<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      <v-btn size="small" class="mr-5" @click="mode === 'edit'?navigateTo('/work_orders/open'):navigateTo('/work_orders/close')"
             v-if="mode !== 'create'" icon text  color="primary"><v-icon color="white">mdi-arrow-left</v-icon></v-btn>
      {{ mode === 'create' ? 'Nueva Orden de Trabajo' : mode === 'edit' && orderLocal.status === 'OPEN' ? 'Editar Orden de Trabajo' :'Orden #'+orderLocal.id }}
      <v-spacer></v-spacer>

      <!-- Nuevo Cliente -->
      <div v-if="mode !== 'closed'">
        <v-btn size="small" v-if="mode === 'create'" color="secondary" icon tile @click="dialogoNewClient = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Botón principal según modo -->
        <v-btn
            class="ml-2"
            v-if="itemsLocal.length > 1"
            color="primary"
            tile
            @click="onSubmit"
        >
          {{ mode === 'create' ? 'Registrar Orden' : 'Editar Orden' }}
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>
    <v-card :disabled="mode === 'closed' " flat tile>
      <v-form ref="FormOrder" class="pa-2" @submit.prevent="onSubmit">
        <v-row>
          <v-col cols="12" md="12">
            <v-autocomplete
                v-model="orderLocal.customer_id"
                :items="Customers"
                :item-value="'id'"
                :item-title="'name'"
                label="Seleccionar un Cliente *"
                :rules="[val.req()]"
                variant="outlined"
                autocomplete="off"
                density="comfortable"
                :disabled="mode==='edit'"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-textarea
                variant="outlined"
                label="Detalle del Trabajo"
                rows="2"
                v-model="orderLocal.detalle"
                autocomplete="off"
                :rules="[val.max(250)]"
                density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
                variant="outlined"
                label="Notas"
                rows="2"
                v-model="orderLocal.notes"
                autocomplete="off"
                :rules="[val.max(250)]"
                density="comfortable"
            />
          </v-col>
        </v-row>

        <v-table class="align-middle" density="comfortable">
          <thead>
          <tr>
            <th v-if="mode === 'create'" class="text-right" colspan="7" style="font-size: 22px">
              Total de la Orden:
              <strong>{{ Intl.NumberFormat().format(orderTotal) }} USD</strong>
            </th>
            <th v-if="mode === 'edit'" class="text-right" colspan="2" style="font-size: 22px">
              Creado:
              <strong v-if="orderLocal.created_at">{{parseCreatedAtHelper(orderLocal.created_at)}}</strong>
            </th>
            <th v-if="mode === 'edit'" class="text-right" colspan="2" style="font-size: 22px">
              Última Edicioón:
              <strong>{{parseCreatedAtHelper(orderLocal.updated_at)}}</strong>
            </th>
            <th v-if="mode === 'edit'" class="text-right" colspan="3" style="font-size: 22px">
              Total de la Orden:
              <strong>{{ Intl.NumberFormat().format(orderTotal) }} USD</strong>
            </th>
          </tr>
          </thead>

          <thead>
          <tr>
            <th>#</th>
            <th>Cod.</th>
            <th>Articulo</th>
            <th>Precio</th>
            <th>Cant.</th>
            <th>Total</th>
            <th>Quitar</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="(row, index) in itemsLocal" :key="index" :class="{ 'row-removed': row.removed }">
            <!-- fila de búsqueda (cuando no hay artículo seleccionado) -->
            <td class="text-center" v-if="!row.articulo_id" colspan="7">
              <v-text-field
                  variant="outlined"
                  class="mt-5"
                  autocomplete="off"
                  @click="dialogoInventy = true"
                  @keyup.enter="dialogoInventy = true"
                  density="comfortable"
              />
            </td>

            <!-- fila con artículo -->
            <template v-else>
              <td>{{ index + 1 }}</td>
              <td>{{ row.cod }}</td>
              <td>{{ row.nombre }}</td>
              <td>$ {{ Intl.NumberFormat().format(row.precio) }}</td>
              <td>
                <v-text-field
                    variant="outlined"
                    autocomplete="off"
                    class="mt-3"
                    v-model.number="row.cant"
                    @input="onQtyChange(row)"
                    type="number"
                    min="0"
                    step="0.001"
                    density="comfortable"
                />
              </td>
              <td>$ {{ Intl.NumberFormat().format(row.total) }}</td>
              <td>
                <v-btn rounded size="xs" color="red" @click="removeItem(row)" icon>
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </td>
            </template>
          </tr>

          <tr>
            <td colspan="7">
              <div class="d-flex justify-end">
                <v-btn
                    class="mt-4"
                    v-if="itemsLocal.length > 1 && mode === 'edit'"
                    color="secondary"
                    @click="closeOrder"
                    tile>
                  Cerrar Orden
                </v-btn>
              </div>
            </td>
          </tr>
          </tbody>
        </v-table>
      </v-form>

      <!-- Dialog: Nuevo Cliente -->
      <v-dialog v-model="dialogoNewClient" max-width="600">
        <v-card class="pa-3">
          <v-card-title class="d-flex align-center pe-2">
            Cliente Nuevo
            <v-spacer></v-spacer>
            <v-btn rounded size="xs" color="red" @click="dialogoNewClient = false" icon>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>

          <v-form ref="FormNewCustomer" class="pa-2" @submit.prevent="onSubmitCustomer">
            <v-row>
              <v-col cols="12">
                <v-text-field
                    label="Nombre *"
                    counter="70"
                    v-model="newCustomer.name"
                    @change="nicknameSameToname"
                    autocomplete="off"
                    :rules="[val.req(), val.minLen(4), val.max(50)]"
                    variant="outlined"
                    density="comfortable"
                />
              </v-col>

              <v-col>
                <v-text-field
                    label="Nickname"
                    counter="20"
                    v-model="newCustomer.nickname"
                    autocomplete="off"
                    :rules="[val.max(20)]"
                    variant="outlined"
                    density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                    label="Email *"
                    counter="100"
                    v-model="newCustomer.email"
                    autocomplete="off"
                    :rules="[val.req(), val.max(100)]"
                    variant="outlined"
                    density="comfortable"
                    type="email"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                    label="Telefono *"
                    counter="15"
                    v-model="newCustomer.phone"
                    autocomplete="off"
                    :rules="[val.req(), val.max(13)]"
                    variant="outlined"
                    density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                    label="address"
                    counter="150"
                    v-model="newCustomer.address"
                    autocomplete="off"
                    variant="outlined"
                    density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                    v-model="newCustomer.dateFormatt"
                    label="Selecciona una fecha"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar"
                    @click="newCustomer.dialogoDate = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="d-flex ga-2 justify-end mt-2">
              <v-btn color="primary" type="submit" tile>
                Registrar Cliente
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-dialog>

      <!-- Dialog: Inventario -->
      <v-dialog v-model="dialogoInventy" max-width="950">
        <v-card class="pa-3">
          <v-card-title class="d-flex align-center pe-2">
            Inventario
            <v-spacer></v-spacer>
            <v-btn rounded size="xs" color="red" @click="dialogoInventy = false" icon>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-text-field
              variant="outlined"
              autocomplete="off"
              v-model="search"
              label="buscar..."
              density="comfortable"
          />
          <v-divider></v-divider>

          <v-data-table
              :headers="headers"
              :search="search"
              :items="Inventario"
              @click:row="selectArticle"
          />
        </v-card>
      </v-dialog>

      <v-dialog v-model="newCustomer.dialogoDate" persistent max-width="320">
        <v-card>

          <v-date-picker color="primary" v-model="newCustomer.date"></v-date-picker>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="grey" @click="newCustomer.dialogoDate = false">Cancelar</v-btn>
            <v-btn text color="primary" @click="confirmDate">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import {parseCreatedAtHelper} from "@/helpers/parseCreatedAtHelper"
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { utilsStore } from '@/store/utilsStore'
import { useValidators } from '@/composables/useValidators'
import type { CustomerInterfaz } from '@/types/customerInterfacez'
import type { ArticleInterfaz } from '@/types/inventoryinterfaces'
import { useCustomerServices } from '@/services/useCustomerServices'
import { useInventoryServices } from '@/services/useInventoryServices'

// -------------------- Props / Models / Emits --------------------
type Mode = 'create' | 'edit' | 'closed'

const props = withDefaults(defineProps<{
  mode?: Mode
  customers?: CustomerInterfaz[]     // opcional: puedes pasarlos desde el padre
  inventory?: ArticleInterfaz[]      // opcional: puedes pasarlos desde el padre
}>(), {
  mode: 'create'
})

// v-model:order
const orderLocal = defineModel<{
  office_id: number | null
  customer_id: number | null
  notes: string
  detalle: string
  descuento: number,
  created_at?: Date,
  status: 'OPEN' | 'CERRADA'
}>('order', {
  default: { office_id: null, customer_id: null, notes: '', detalle: '', descuento: 0 , created_at:null, status: 'OPEN'}
})

// v-model:items
const itemsLocal = defineModel<Array<{
  id?: number | null
  persisted?: boolean
  removed?: boolean
  cod: string
  articulo_id: number | null
  nombre: string
  precio: number
  cant: number
  total: number
}>>('items', {
  default: () => ([
    { id: null, persisted: false, removed: false, cod: '', articulo_id: null, nombre: '', precio: 0, cant: 0, total: 0 }
  ])
})

// emit submit (padre decide crear/editar y llamar al endpoint correspondiente)
const emit = defineEmits<{
  (e: 'submit', payload: { order: typeof orderLocal.value, items: typeof itemsLocal.value, total: number }): void
}>()

// -------------------- Data y servicios --------------------
const val = useValidators()
const dialogoNewClient = ref(false)
const dialogoInventy = ref(false)
const FormNewCustomer = ref<any>(null)
const FormOrder = ref<any>(null)

const Customers = ref<CustomerInterfaz[]>(props.customers ?? [])
const Inventario = ref<ArticleInterfaz[]>(props.inventory ?? [])
const search = ref('')

const headers = [
  { align: 'start', key: 'name', sortable: false, title: 'Nombre' },
  { key: 'bar_code', title: 'Cod. Barra' },
  { key: 'category.name', title: 'Categoria' },
  { key: 'brand.name', title: 'Marca' },
]

onMounted(async () => {
  if (!props.customers) {
    Customers.value = await useCustomerServices().getCustomers()
  }
  if (!props.inventory) {
    Inventario.value = await useInventoryServices().getInventory()
  }
})

// -------------------- Computed / helpers --------------------
const orderTotal = computed(() =>
    Number(itemsLocal.value.reduce((acc, it) => acc + (Number(it.total) || 0), 0).toFixed(2))
)

const hasAtLeastOneArticle = computed(() =>
    itemsLocal.value.some(r => r.articulo_id)
)


const nicknameSameToname = ()=>{
  newCustomer.value.nickname = newCustomer.value.name
}
function confirmDate() {
  if (newCustomer.value.date) {
    // Formatea la fecha a AAAA-MM-DD (puedes adaptarlo)
    newCustomer.value.dateFormatt = new Date(newCustomer.value.date).toISOString().split('T')[0]
  }
  dialog.value = false
}
function onQtyChange(row: any) {
  const qty = Number(row.cant) || 0
  const price = Number(row.precio) || 0

  row.total = Number((qty * price).toFixed(2))


  if (props.mode === 'edit' && row.persisted)
    row.removed = qty <= 0
  else
    row.removed = false

}

function removeItem(row: any) {
  console.log(row)
  if (props.mode === 'edit' && row.persisted) {
    row.cant = 0
    row.total = 0
    row.removed = true
    toast.info('La línea existente no se elimina; se marca con cantidad 0.', { autoClose: 1800 })
    return
  }
  const idx = itemsLocal.value.findIndex(it => it === row)
  if (idx !== -1) itemsLocal.value.splice(idx, 1)
}

function selectArticle(_: any, data: { item: ArticleInterfaz }) {
  const exists = itemsLocal.value.some((art: any) => art.articulo_id === data.item.id)
  if (exists) {
    toast.warning('El articulo ya esta en la orden', { autoClose: 2500 })
  } else {
    if (data.item.sale_price <= 0) {
      toast.warning('El articulo no tiene precio, recuerda que esto afecta', { autoClose: 2500 })
    }
    itemsLocal.value.push({
      cod: `${data.item.bar_code} - ${data.item.sku}`,
      articulo_id: data.item.id,
      nombre: data.item.name,
      precio: data.item.sale_price,
      cant: 1,
      total: data.item.sale_price
    })
  }
  dialogoInventy.value = false
}

// -------------------- Nuevo cliente --------------------
const newCustomer = ref({
  phone: '',
  name: '',
  nickname: '',
  address: '',
  email: '',
  date: '',
  dateFormatt: '',
  dialogoDate: false
})

async function closeOrder(){
  const result = await FormOrder.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true)
  try {
    await $fetch('/api/work_orders/close', {
      method: 'POST',
      body: {
        id: orderLocal.value.id
      }
    })
    toast.success('El cliente ha sido registrado exitosamente', { autoClose: 2500 })
    navigateTo('/work_orders/close')
  } catch (err: any) {
    const msg = err?.statusMessage || 'Error desconocido al registrar el cliente'
    toast.error(msg, { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}

async function onSubmitCustomer() {
  const result = await FormNewCustomer.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true)
  dialogoNewClient.value = false
  try {
    await $fetch('/api/customers/save', {
      method: 'POST',
      body: {
        phone: newCustomer.value.phone,
        email: newCustomer.value.email,
        name: newCustomer.value.name,
        nickname: newCustomer.value.nickname,
        address: newCustomer.value.address,
      }
    })
    // limpiar
    newCustomer.value = { phone: '', email: '', name: '', nickname: '', address: '' }
    toast.success('El cliente ha sido registrado exitosamente', { autoClose: 2500 })
    // refrescar lista de clientes local si no vino por prop
    if (!props.customers) {
      Customers.value = await useCustomerServices().getCustomers()
    }
  } catch (err: any) {
    const msg = err?.statusMessage || 'Error desconocido al registrar el cliente'
    dialogoNewClient.value = true
    toast.error(msg, { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}

// async function onEdit(){
//   const result = await FormOrder.value?.validate()
//   if (!result?.valid) {
//     toast.error('Revisa los campos del formulario', { autoClose: 3000 })
//     return
//   }
//
//   // emite al padre con order/items/total
//   emit('submit', {
//     order: orderLocal.value,
//     items: itemsLocal.value.filter(i => i.articulo_id),
//     total: orderTotal.value
//   })
// }
async function onSubmit() {
  const result = await FormOrder.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }

  // emite al padre con order/items/total
  emit('submit', {
    order: orderLocal.value,
    items: itemsLocal.value.filter(i => i.articulo_id),
    total: orderTotal.value
  })
}
</script>

<style scoped>
.row-removed { opacity: .6; text-decoration: line-through; }
</style>
