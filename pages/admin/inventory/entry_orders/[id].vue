<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      <v-btn color="secondary" @click="navigateTo('/admin/inventory/entry_orders/')" icon ><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-spacer></v-spacer>

    </v-card-title>
    <div v-if="pending">Cargando orden...</div>
    <div v-else-if="error">Error al cargar la orden ...</div>
    <div v-else>
      <div class="entry-order-doc">
        <header class="doc-header">
          <div class="brand-block">
            <div class="brand-title">Orden de Entrada</div>
            <div class="brand-sub">Orden #{{order.id}}</div>
          </div>

          <div class="meta-block">
            <div class="meta-row">
              <span class="meta-label">Referencia del documento:</span>
              <span class="meta-value">{{ order?.code ?? '—' }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Fecha:</span>
              <span class="meta-value">{{ formatDate(order?.date) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Sucursal:</span>
              <span class="meta-value">
                {{ order?.branch.name }}
              </span>
            </div>
            <div class="meta-row" v-if="order?.supplier">
              <span class="meta-label">Proveedor:</span>
              <span class="meta-value">
                {{ order?.supplier?.name }}
              </span>
            </div>
          </div>
        </header>

        <section class="notes" v-if="order?.notes">
          <div class="notes-title">Notas</div>
          <div class="notes-body">{{ order.notes }}</div>
        </section>

        <section class="items">
          <table class="items-table">
            <thead>
            <tr>
              <th style="width: 56px;">#</th>
              <th>Code</th>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Cost</th>
              <th class="text-right">Subtotal</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, idx) in order.details" :key="idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td>{{ row.article.sku }}</td>
              <td>
                <div class="desc-main">{{row.description}}</div>
                <div class="desc-sub" v-if="row.article.brand">Marca: {{ row.article.brand.name }}</div>
                <div class="desc-sub" v-if="row.article.bar_code">Barcode: {{ row.articule.bar_code }}</div>
              </td>
              <td class="text-right">{{ toFixed(row.quantity) }}</td>
              <td class="text-right">{{ money(row.unit_cost) }}</td>
              <td class="text-right">{{ money(row.subtotal) }}</td>
            </tr>

            <tr v-if="order.details.length === 0">
              <td colspan="6" class="empty">No hay cuerpo</td>
            </tr>
            </tbody>

            <tfoot v-if="order.details.length > 0">
            <tr>
              <td colspan="3" class="no-border"></td>
              <td class="text-right total-label">Total Qty</td>
              <td class="text-right total-value" colspan="2">{{ toFixed(Number(totalQty)) }}</td>
            </tr>
            <tr>
              <td colspan="3" class="no-border"></td>
              <td class="text-right total-label">Total Amount</td>
              <td class="text-right total-value" colspan="2">{{ money(order.total_amount) }}</td>
            </tr>
            </tfoot>
          </table>
        </section>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
const route = useRoute();
const orderId = route.params.id

const totalQty = computed(() => {
  let details = order.value?.details ?? []
  return details.reduce((acc, r) => acc + Number(r.quantity || 0), 0)
})

const order = computed(() => {
  return data?data.value.data:null
})

const { data, pending, error } = await useAsyncData('entry-order', () =>
    $fetch(`/api/inventory/orders/${orderId}`)
)


const money = (v: number | string | null | undefined)=> {
  const n = Number(v ?? 0)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}
const toFixed = (v: number | string | null | undefined, d = 2)=> {
  const n = Number(v ?? 0)
  return n.toFixed(d)
}

const formatDate = (val: any) => {
  const dt = val ? new Date(val) : null
  if (!dt || Number.isNaN(dt.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(dt)
}

type AnyRecord = Record<string, any>
</script>

<style scoped>
/* Layout general tipo documento */
.entry-order-doc {
  max-width: 940px;
  margin: 24px auto;
  padding: 24px;
  background: #fff;
  color: #222;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

.doc-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 2px solid #ececec;
}

.brand-block .brand-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: .4px;
}
.brand-block .brand-sub {
  margin-top: 4px;
  font-size: 13px;
  color: #666;
}

.meta-block {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fafafa;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13.5px;
  padding: 4px 0;
}
.meta-label { color: #666; }
.meta-value { font-weight: 600; }

.notes {
  margin: 14px 0 6px 0;
}
.notes-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
}
.notes-body {
  white-space: pre-wrap;
  border: 1px dashed #e3e3e3;
  border-radius: 6px;
  padding: 10px 12px;
  background: #fcfcfc;
  font-size: 13.5px;
}

/* Tabla de Ítems */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 13.5px;
}
.items-table thead th {
  text-align: left;
  background: #f6f6f6;
  border-bottom: 1px solid #e8e8e8;
  padding: 10px 8px;
  font-weight: 700;
}
.items-table tbody td {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px;
  vertical-align: top;
}
.items-table tfoot td {
  padding: 10px 8px;
}
.empty {
  text-align: center;
  color: #888;
  font-style: italic;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.no-border { border: none !important; }
.total-label { font-weight: 600; color: #666; }
.total-value { font-weight: 700; }

.desc-main { font-weight: 600; }
.desc-sub { font-size: 12px; color: #777; }

.signatures {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 28px;
  padding-top: 10px;
}
.sig { text-align: center; }
.sig-line {
  margin: 28px 8px 6px;
  height: 1px;
  background: #999;
}
.sig-label { font-size: 12px; color: #555; }

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
.actions button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #f7f7f7;
  cursor: pointer;
}
.actions button:hover {
  background: #efefef;
}

/* Responsivo */
@media (max-width: 720px) {
  .doc-header {
    grid-template-columns: 1fr;
  }
}

/* Estilos de impresión */
@media print {
  .entry-order-doc {
    border: none;
    border-radius: 0;
    margin: 0;
    padding: 0;
  }
  .no-print { display: none !important; }
  .items-table thead th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
