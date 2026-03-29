<template>
  <v-container fluid class="pa-6 fac-view-page">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card class="rounded-xl elevation-2">
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 px-6 py-5">
            <div>
              <div class="text-h5 font-weight-bold">Detalle de Factura Genérica</div>
              <div class="text-body-2 text-medium-emphasis">
                Visualiza toda la información de la factura
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-btn
                  variant="outlined"
                  color="grey-darken-1"
                  prepend-icon="mdi-arrow-left"
                  @click="router.push('/fac_generica')"
              >
                Regresar
              </v-btn>

              <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-file-pdf-box"
                  :disabled="!factura"
                  @click="abrirPdf"
              >
                Abrir PDF
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="px-6 py-6">
            <div v-if="loading" class="py-12">
              <v-progress-linear indeterminate color="primary" rounded />
              <div class="text-center mt-4 text-medium-emphasis">Cargando factura...</div>
            </div>

            <div v-else-if="!factura" class="py-12 text-center text-medium-emphasis">
              No se encontró la factura
            </div>

            <template v-else>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                      :model-value="factura.numero || '-'"
                      label="Número"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      :model-value="formatDate(factura.fecha)"
                      label="Fecha"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      :model-value="factura.paga_con_tarjeta ? 'Tarjeta' : 'Efectivo'"
                      label="Método de pago"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      :model-value="factura.id"
                      label="ID"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" md="6">
                  <v-text-field
                      :model-value="factura.cliente || '-'"
                      label="Cliente"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                      :model-value="formatDate(factura.fecha_maximo_envio)"
                      label="Fecha máximo de envío"
                      variant="outlined"
                      density="comfortable"
                      readonly
                  />
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" md="8">
                  <v-textarea
                      :model-value="factura.direccion_envio || '-'"
                      label="Lugar de entrega"
                      variant="outlined"
                      density="comfortable"
                      rows="2"
                      auto-grow
                      readonly
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-card variant="tonal" class="rounded-lg resumen-top pa-4">
                    <div class="text-body-2 text-medium-emphasis mb-1">Total de la Factura</div>
                    <div class="text-h4 font-weight-bold">
                      {{ money(totalMostrado) }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                      Taxes incluidos: {{ money(factura.taxes) }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12">
                  <v-textarea
                      :model-value="factura.observacion || '-'"
                      label="Observación"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      auto-grow
                      readonly
                  />
                </v-col>
              </v-row>

              <div class="mt-6 mb-3">
                <div class="text-h6 font-weight-bold">Detalle de artículos</div>
                <div class="text-body-2 text-medium-emphasis">
                  Registros incluidos en esta factura
                </div>
              </div>

              <div class="single-scroll-wrap">
                <table class="detalle-table">
                  <thead>
                  <tr>
                    <th>#</th>
                    <th>Cod.</th>
                    <th>Artículo</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Desc. unidad</th>
                    <th>Total descuento</th>
                    <th>Total registro</th>
                  </tr>
                  </thead>

                  <tbody>
                  <tr v-for="(item, index) in factura.cuerpo || []" :key="item.id || index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.cod || "-" }}</td>
                    <td>{{ item.articulo || "-" }}</td>
                    <td>{{ money(item.precio) }}</td>
                    <td>{{ num(item.cantidad).toFixed(2) }}</td>
                    <td>{{ money(item.descuento_unidad) }}</td>
                    <td>{{ money(item.total_descuento) }}</td>
                    <td class="font-weight-bold">{{ money(item.total_registro) }}</td>
                  </tr>

                  <tr v-if="!(factura.cuerpo || []).length">
                    <td colspan="8" class="empty-row">
                      No hay registros en la factura
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <v-row class="mt-6">
                <v-col cols="12" md="7">
                  <v-card class="rounded-lg elevation-0 resumen-card h-100">
                    <v-card-text>
                      <div class="text-subtitle-1 font-weight-bold mb-3">
                        Parámetros de cálculo
                      </div>

                      <v-row>
                        <v-col cols="12" sm="4">
                          <v-text-field
                              :model-value="`${(num(factura.tasa_tax) * 100).toFixed(2)} %`"
                              label="Tax Virginia"
                              variant="outlined"
                              density="comfortable"
                              readonly
                          />
                        </v-col>

                        <v-col cols="12" sm="4">
                          <v-text-field
                              :model-value="`${(num(factura.tasa_square) * 100).toFixed(2)} %`"
                              label="Comisión Square"
                              variant="outlined"
                              density="comfortable"
                              readonly
                          />
                        </v-col>

                        <v-col cols="12" sm="4">
                          <v-text-field
                              :model-value="money(factura.fee_square_fijo)"
                              label="Cargo fijo Square"
                              variant="outlined"
                              density="comfortable"
                              readonly
                          />
                        </v-col>
                      </v-row>

                      <div class="text-body-2 text-medium-emphasis">
                        Esta factura muestra el total normal con taxes y, si fue marcada como
                        pago con tarjeta, también cuánto debías colocar en Square.
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="5">
                  <v-card class="rounded-lg elevation-0 resumen-card">
                    <v-card-text>
                      <div class="text-subtitle-1 font-weight-bold mb-4">
                        Resumen
                      </div>

                      <div class="resumen-line">
                        <span>Total descuento</span>
                        <strong>{{ money(factura.total_descuento) }}</strong>
                      </div>

                      <div class="resumen-line">
                        <span>Sub total</span>
                        <strong>{{ money(factura.sub_total) }}</strong>
                      </div>

                      <div class="resumen-line">
                        <span>Taxes</span>
                        <strong>{{ money(factura.taxes) }}</strong>
                      </div>

                      <template v-if="factura.paga_con_tarjeta">
                        <div class="resumen-line">
                          <span>Fee Square estimado</span>
                          <strong>{{ money(factura.square_fee_calculado || 0) }}</strong>
                        </div>

                        <div class="resumen-line resumen-line-total">
                          <span>Total</span>
                          <strong>{{ money(factura.total_a_colocar_square) }}</strong>
                        </div>

                        <div class="resumen-line resumen-line-square">
                          <span>Total a colocar en Square</span>
                          <strong>{{ money(factura.total_a_colocar_square) }}</strong>
                        </div>
                      </template>

                      <template v-else>
                        <div class="resumen-line resumen-line-total">
                          <span>Total</span>
                          <strong>{{ money(factura.total) }}</strong>
                        </div>

                        <div class="text-body-2 text-medium-emphasis mt-3">
                          Esta factura no fue marcada como pago con tarjeta.
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-6 ga-3 flex-wrap">
                <v-btn
                    variant="outlined"
                    color="grey-darken-1"
                    @click="router.push('/fac_generica')"
                >
                  Volver
                </v-btn>

                <v-btn
                    color="primary"
                    prepend-icon="mdi-file-pdf-box"
                    @click="abrirPdf"
                >
                  Abrir PDF
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        location="top right"
        timeout="3200"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const factura = ref<any | null>(null)

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
})

const totalMostrado = computed(() => {
  if (!factura.value) return 0
  return factura.value.paga_con_tarjeta
      ? num(factura.value.total_a_colocar_square)
      : num(factura.value.total)
})

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function money(value: number | string) {
  const amount = num(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-US")
}

function mostrarMensaje(text: string, color: "success" | "error" | "warning" = "success") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

async function cargarFactura() {
  try {
    loading.value = true

    const id = route.params.id
    const res: any = await $fetch(`/api/fac_generica/${id}`)
    factura.value = res?.data || null
  } catch (error: any) {
    factura.value = null
    mostrarMensaje(
        error?.data?.statusMessage ||
        error?.statusMessage ||
        error?.message ||
        "No se pudo cargar la factura",
        "error"
    )
  } finally {
    loading.value = false
  }
}

function abrirPdf() {
  const id = route.params.id
  window.open(`/api/fac_generica/${id}/pdf`, "_blank")
}

onMounted(() => {
  cargarFactura()
})
</script>

<style scoped>
.fac-view-page {
  background: #f6f7fb;
  min-height: 100vh;
}

.resumen-top {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.16));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.single-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  background: #fff;
}

.detalle-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
}

.detalle-table th {
  font-size: 13px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.72);
  background: #fafafa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  text-align: left;
  padding: 16px 14px;
}

.detalle-table td {
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 14px;
  white-space: nowrap;
}

.detalle-table tbody tr:last-child td {
  border-bottom: none;
}

.empty-row {
  text-align: center;
  padding: 32px 14px !important;
  color: rgba(0, 0, 0, 0.5);
}

.resumen-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.resumen-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
  font-size: 15px;
}

.resumen-line-total {
  font-size: 18px;
  font-weight: 700;
}

.resumen-line-square {
  font-size: 17px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}
</style>
