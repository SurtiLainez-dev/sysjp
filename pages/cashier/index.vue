<template>
  <v-card flat tile class="pa-2">
    <!-- HEADER -->
    <div class="d-flex align-center mb-2">
      <div class="text-h6">Caja</div>
      <v-spacer />
      <div class="text-caption mr-2">{{ nowLabel }}</div>
      <v-btn variant="text" size="small" icon @click="dialogClosures = true">
        <v-icon>mdi-calendar-search</v-icon>
        <v-tooltip activator="parent" text="Ver cierres por fecha" />
      </v-btn>
    </div>

    <v-divider class="mb-2" />

    <!-- TABS -->
    <v-tabs v-model="tab" density="compact">
      <v-tab value="caja" prepend-icon="mdi-cash-register">Caja</v-tab>
      <v-tab value="ordenes" prepend-icon="mdi-cash-register">Ordenes de Trabajo Abiertas</v-tab>
      <v-tab value="historial" prepend-icon="mdi-cash-register">Historial de Cierres</v-tab>
      <v-tab value="gastos" prepend-icon="mdi-cash-minus">Gastos</v-tab>
      <v-tab value="cierres" prepend-icon="mdi-lock">Cierres</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-3">
      <!-- ======================= VISTA CAJA ======================= -->
      <v-window-item value="caja">
        <v-row>
          <!-- Inventario -->
          <v-col cols="7">
            <v-card>
              <v-text-field
                  v-model="search"
                  label="Buscar artículo..."
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="ma-2"
              />
              <v-divider />
              <v-data-table
                  :headers="headersInventario"
                  :items="Inventario"
                  :search="search"
                  @click:row="addArticleFromTable"
              >
                <template #item.sale_price="{ value }">
                  <strong>$ {{ Intl.NumberFormat().format(value) }}</strong>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- Recibo -->
          <v-col cols="5">
            <v-card>
              <v-card-subtitle class="d-flex align-center">
                <strong>Nuevo Recibo</strong>
                <v-spacer />
                <v-btn
                    color="primary"
                    size="small"
                    :disabled="!pago.items.length"
                    @click="openPayDialog"
                >
                  <v-icon start>mdi-check</v-icon> Registrar
                </v-btn>
              </v-card-subtitle>
              <v-divider />

              <v-card-text>
                <!-- Tabla de Items -->
                <v-table density="compact" v-if="pago.items.length">
                  <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-right">Cant</th>
                    <th class="text-right">P. Unit</th>
                    <th class="text-right">Total</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="it in pago.items" :key="it.article_id">
                    <td>{{ it.name }}</td>
                    <td class="text-right">{{ it.qty }}</td>
                    <td class="text-right">{{ money(it.unitPrice) }}</td>
                    <td class="text-right">{{ money(it.unitPriceWithTax * it.qty) }}</td>
                  </tr>
                  </tbody>
                </v-table>

                <div v-else class="text-medium-emphasis">No has agregado items.</div>

                <v-divider class="my-4" />

                <!-- Totales -->
                <div class="d-flex justify-space-between">
                  <span>Subtotal</span>
                  <strong>{{ money(receiptTotals.subtotal) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Impuestos</span>
                  <strong>{{ money(receiptTotals.taxTotal) }}</strong>
                </div>
                <div class="d-flex justify-space-between text-h6 mt-2">
                  <span>Total a Pagar</span>
                  <strong>{{ money(receiptTotals.total) }}</strong>
                </div>
              </v-card-text>
            </v-card>

            <!-- Historial del día -->

          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="ordenes">
        <v-card class="pa-4 text-medium-emphasis">
          <v-data-table
              :headers="headers"
              :items="Orders"
              @click:row="openOrder"
          >
            <template v-slot:item.created_at="{ value }">
              {{parseCreatedAtHelper(value)}}
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
      <!-- ======================= VISTA GASTOS ======================= -->
      <v-window-item value="historial">
        <v-card class="pa-4 text-medium-emphasis">
          <div class="text-subtitle-1 mb-2">Transacciones del dia</div>

          <v-data-table
              :headers="headersTransactions"
              :items="Transactions.data"
              @click:row="verPDF"
          >
            <template v-slot:item.time="{ value }">
              {{ new Date(value).toLocaleTimeString() }}
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <v-window-item value="gastos">
        <v-card class="pa-4 text-medium-emphasis">
          <div class="text-subtitle-1 mb-2">Vista de Gastos</div>
          <p>Puedes añadir aquí tu formulario de registro de gastos.</p>
          <v-btn variant="outlined" @click="tab = 'caja'">
            <v-icon start>mdi-arrow-left</v-icon> Volver a Caja
          </v-btn>
        </v-card>
      </v-window-item>

      <!-- ======================= VISTA CIERRES ======================= -->
      <v-window-item value="cierres">
        <v-card class="pa-4 text-medium-emphasis">
          <div class="text-subtitle-1 mb-2">Vista de Cierres</div>
          <p>Aquí irá la tabla de cierres de caja diarios.</p>
          <v-btn variant="outlined" @click="tab = 'caja'">
            <v-icon start>mdi-arrow-left</v-icon> Volver a Caja
          </v-btn>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- ======================= DIALOGO COBRO ======================= -->
    <v-dialog v-model="dialogPay" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center">
          Registrar pago
          <v-spacer />
          <div class="text-caption">{{ nowLabel }}</div>
        </v-card-title>
        <v-divider />

        <v-card-text class="pt-4">
          <v-autocomplete
              v-model="pago.metodo_pago"
              :items="PaymentMethods"
              item-value="id"
              item-title="name"
              label="Método de pago"
              variant="outlined"
              density="comfortable"
              :rules="[val.req()]"
          />
          <v-expand-transition>
            <div v-if="isCash" class="mt-2">
              <v-text-field
                  v-model.number="pago.total_pagado"
                  type="number"
                  label="Con cuánto paga"
                  variant="outlined"
                  density="comfortable"
              />
              <div class="d-flex justify-space-between mt-2">
                <span>Total del recibo</span>
                <strong>{{ money(receiptTotals.total) }}</strong>
              </div>
              <div class="d-flex justify-space-between">
                <span>Cambio</span>
                <strong>{{ money(cambioComputed) }}</strong>
              </div>
            </div>
          </v-expand-transition>

          <div v-if="!isCash" class="text-medium-emphasis mt-2">
            Este método no es efectivo: el total se abonará automáticamente.
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn variant="text" @click="dialogPay = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="confirmRegister" :disabled="!canConfirm">
            <v-icon start>mdi-check</v-icon> Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogPay2" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center">
          Registrar pago
          <v-spacer />
          <div class="text-caption">{{ nowLabel }}</div>
        </v-card-title>
        <v-divider />

        <v-card-text class="pt-4">
          <v-autocomplete
              v-model="pago.metodo_pago"
              :items="PaymentMethods"
              item-value="id"
              item-title="name"
              label="Método de pago"
              variant="outlined"
              density="comfortable"
              :rules="[val.req()]"
          />
          <v-expand-transition>
            <div v-if="isCash" class="mt-2">
              <v-text-field
                  v-model.number="pago.total_pagado"
                  type="number"
                  label="Con cuánto paga"
                  variant="outlined"
                  density="comfortable"
              />
              <div class="d-flex justify-space-between mt-2">
                <span>Total del recibo</span>
                <strong>{{ money(total) }}</strong>
              </div>
            </div>
          </v-expand-transition>

          <div v-if="!isCash" class="text-medium-emphasis mt-2">
            Este método no es efectivo: el total se abonará automáticamente.
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn variant="text" @click="dialogPay = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="saveWorkOrder" >
            <v-icon start>mdi-check</v-icon> Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ======================= DIALOGO CIERRES ======================= -->
    <v-dialog v-model="dialogClosures" max-width="360">
      <v-card>
        <v-card-title>Ver cierres por fecha</v-card-title>
        <v-divider />
        <v-card-text>
          <v-date-picker v-model="closureDate" />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="dialogClosures = false">Cerrar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="goToClosuresDate">Ver</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { useInventoryServices } from '@/services/useInventoryServices'
import { useCcServices } from '@/services/useCcServices'
import { useValidators } from '@/composables/useValidators'
import type { ArticleInterfaz } from '@/types/inventoryinterfaces'
import type { PaymentMethodInterfaz } from '@/types/payment_methodsInterfacez'
import { utilsStore } from '@/store/utilsStore'
import type {WorkOrderInterfaz} from "@/types/work_ordersinterfacez";
import {parseCreatedAtHelper} from "@/helpers/parseCreatedAtHelper"
import type {CashierTransactionsInterfaz} from "@/types/cashierTransactionsInterfaz";


const headers = [
  {
    align: 'start',
    key: 'id',
    sortable: false,
    title: '#',
  },
  { key: 'office_name', title: 'Sucursal' },
  { key: 'user_name', title: 'Usuario Creador' },
  { key: 'customer_name', title: 'Cliente' },
  { key: 'status', title: 'Estado' },
  { key: 'created_at', title: 'Creado' },
]

/* ---------- Estado base ---------- */
const Inventario = ref<ArticleInterfaz[]>([])
const PaymentMethods = ref<PaymentMethodInterfaz[]>([])
const Orders         = ref<WorkOrderInterfaz[]>([])
const Transactions   = ref<CashierTransactionsInterfaz[]>([])
const search = ref('')
const val = useValidators()

const pago = reactive({
  metodo_pago: null as number | null,
  items: [] as Array<any>,
  total_pagado: 0,
})
const total       = ref(null)
const customer_id = ref(null)
const work_id     = ref(null);
/* ---------- Tab & Dialogs ---------- */
const tab = ref<'caja'|'gastos'|'cierres'|'historial'|'ordenes'>('caja')
const dialogPay = ref(false)
const dialogPay2 = ref(false)
const dialogClosures = ref(false)
const closureDate = ref<string | null>(null)

/* ---------- Fecha y hora actual ---------- */
const now = ref(new Date())
const tick = () => (now.value = new Date())
let timer: any
onMounted(async () => {
  timer = setInterval(tick, 1000)
  Inventario.value = await useInventoryServices().getInventory()
  PaymentMethods.value = await useCcServices().getPaymentMethods()
  await getWorkOrders();
  let date = new Date();
  await getTransactions(date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate());
})

const getTransactions = async (date:string) => {
  try {
    Transactions.value = await $fetch<{ ok: boolean; data: CashierTransactionsInterfaz[] }>(`/api/cashier/transactions/${date}/x_office`)
    toast.success("Transacciones cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar las transacciones del dia", { autoClose: 3000 })
    return []
  }
}

onBeforeUnmount(() => clearInterval(timer))
const nowLabel = computed(() =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(now.value)
)

/* ---------- Tabla Inventario (simplificada) ---------- */
const headersInventario = [
  { title: 'SKU', key: 'sku', align: 'start' },
  { title: 'Nombre', key: 'name' },
  { title: 'Precio', key: 'sale_price', align: 'end' }
]
const headersTransactions = [
  { title: 'Hora', key: 'time', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Total', key: 'amount', align: 'end', sortable: true },
  { title: 'Método de Pago', key: 'payment_method.name' },
  { title: 'Usuario', key: 'user.username' },
  { title: 'Recibo #', key: 'receipt_id', align: 'center' },
  { title: 'Nota', key: 'note' }
]

const openOrder = (event:any, data:{item:WorkOrderInterfaz}) => {
  customer_id.value = data.item.customer_id;
  work_id.value     = data.item.id;
  total.value  = data.item.total
  dialogPay2.value   = true
}
const verPDF = (event:any, data:{item:any})=> {
  console.log(data.item)
  window.open(`/api/receipts/${data.item.id}/pdf`, '_blank')
}
const saveWorkOrder = async () => {
  utilsStore().setLoading(true)

  dialogPay2.value = false;
  try {
    await $fetch('/api/receipts/work_order', {
      method: 'POST',
      body: {
        payment_method_id: pago.metodo_pago,
        customer_id: customer_id.value,
        work_order_id: work_id.value,
        notes: null,
      }
    })

    toast.success('El recibo se ha registrado', { autoClose: 2500 })

    // limpiar estado de la caja
    pago.items = []
    pago.total_pagado = 0
    dialogPay2.value = false
  } catch (err: any) {
    const msg = err?.statusMessage || 'Error desconocido al registrar el recibo'
    toast.error(msg, { autoClose: 3000 })
  } finally {
    customer_id.value = null;
    work_id.value     = null
    utilsStore().setLoading(false)
    await getWorkOrders();
    let date = new Date();
    await getTransactions(date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate());
  }
}
const getWorkOrders = async ()=>{
  try {
    Orders.value = await $fetch<{ ok: boolean; data: WorkOrderInterfaz[] }>('/api/work_orders/not_invoiced')
    toast.success("Ordenes cargadas exitosamente", { autoClose: 3000 })
  } catch (err) {
    toast.error("Hubo un error al cargar las ordenes", { autoClose: 3000 })
    return []
  }
}

/* ---------- Utilidades ---------- */
const num = (v: any) => Number.parseFloat(String(v || 0))
const money = (n: number) =>
    n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

/* ---------- Impuestos y Totales ---------- */
/**
 * Devuelve el impuesto unitario total y el desglose por impuesto.
 * breakdown = [{ id, name, rate, amount }]
 */
function computeUnitTaxes(article: ArticleInterfaz) {
  const activeTaxes = (article.taxes || []).filter(t => t.is_active && t.tax)
  const breakdown: Array<{ id:number; name:string; rate:number; amount:number }> = []
  let unitTaxTotal = 0

  for (const t of activeTaxes) {
    const id = t.tax.id
    const name = t.tax.name
    const rate = num(t.tax.rate) // ej: 0.043
    const amount = num(article.sale_price) * rate

    breakdown.push({ id, name, rate, amount })
    unitTaxTotal += amount
  }

  return { unitTaxTotal, breakdown }
}

function addArticleFromTable(_: any, row: any) {
  const article = row?.item ?? row
  const idx = pago.items.findIndex(i => i.article_id === article.id)
  if (idx !== -1) {
    pago.items[idx].qty += 1
    return
  }

  const { unitTaxTotal, breakdown } = computeUnitTaxes(article)

  pago.items.push({
    article_id: article.id,
    name: article.name,
    qty: 1,
    unitPrice: num(article.sale_price),               // sin impuestos
    unitTaxTotal,                                     // impuestos de una unidad
    unitPriceWithTax: num(article.sale_price) + unitTaxTotal,
    taxesBreakdown: breakdown                         // 👈 AQUÍ guardamos detalle
  })
}

const receiptTotals = computed(() => {
  let subtotal = 0
  let taxTotal = 0
  for (const it of pago.items) {
    subtotal += it.unitPrice * it.qty
    const lineTax = (it.unitPriceWithTax - it.unitPrice) * it.qty
    taxTotal += lineTax
  }
  const total = subtotal + taxTotal
  return { subtotal, taxTotal, total }
})

/* ---------- Métodos de pago y cambio ---------- */
const selectedMethod = computed(
    () => PaymentMethods.value.find(m => m.id === pago.metodo_pago) || null
)
const isCash = computed(() => Boolean(selectedMethod.value?.is_cash))

watch([selectedMethod, () => receiptTotals.value.total], () => {
  if (!selectedMethod.value) return
  if (!isCash.value) {
    pago.total_pagado = receiptTotals.value.total
  } else if (isCash.value && pago.total_pagado < receiptTotals.value.total) {
    pago.total_pagado = receiptTotals.value.total
  }
})

const cambioComputed = computed(() =>
    Math.max(0, num(pago.total_pagado) - receiptTotals.value.total)
)

const canConfirm = computed(
    () =>
        !!selectedMethod.value &&
        pago.items.length > 0 &&
        (!isCash.value || num(pago.total_pagado) >= receiptTotals.value.total)
)

/* ---------- Historial (mock) ---------- */
const transactionsToday = ref<{ id:number; title:string; time:string; amount:number }[]>([])
function refreshToday() {
  transactionsToday.value = [] // conectar con endpoint real
}

/* ---------- Acciones ---------- */
function openPayDialog() {
  if (!pago.items.length) return
  dialogPay.value = true
  if (!pago.metodo_pago && PaymentMethods.value.length) {
    pago.metodo_pago = PaymentMethods.value[0].id
  }
}

const confirmRegister = async () => {
  utilsStore().setLoading(true)

  try {
    await $fetch('/api/receipts/save', {
      method: 'POST',
      body: {
        payment_method_id: pago.metodo_pago,
        customer_id: customer_id.value,
        work_order_id: work_id.value,
        notes: null,
        items: pago.items.map(it => ({
          article_id: it.article_id,
          name: it.name,
          qty: it.qty,
          unit_price: it.unitPrice,
          taxes: (it.taxesBreakdown || []).map((t: any) => ({
            tax_id: t.id,
            name: t.name,
            rate: t.rate
          }))
        }))
      }
    })

    toast.success('El recibo se ha registrado', { autoClose: 2500 })

    // limpiar estado de la caja
    pago.items = []
    pago.total_pagado = 0
    dialogPay.value = false
  } catch (err: any) {
    const msg = err?.statusMessage || 'Error desconocido al registrar el recibo'
    toast.error(msg, { autoClose: 3000 })
  } finally {
    customer_id.value = null;
    work_id.value     = null
    utilsStore().setLoading(false)
    let date = new Date();
    await getTransactions(date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate());
  }
}

function goToClosuresDate() {
  dialogClosures.value = false
  tab.value = 'cierres'
}
</script>


<style scoped>
.v-card { border-radius: 16px; }
.v-table th, .v-table td { padding: 8px 10px !important; }
</style>
