<template>
  <v-container fluid class="pa-6 fac-page">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card class="rounded-xl elevation-2">
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 px-6 py-5">
            <div>
              <div class="text-h5 font-weight-bold">Nueva Factura Genérica</div>
              <div class="text-medium-emphasis text-body-2">
                Crea un documento tipo factura con cálculo de taxes y monto para Square.
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
                  prepend-icon="mdi-content-save-outline"
                  :loading="guardando"
                  @click="guardarFactura"
              >
                Guardar
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="px-6 py-6">
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                    v-model="form.fecha"
                    label="Fecha"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                    v-model="form.fecha_maximo_envio"
                    label="Fecha máximo de envío"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                    v-model="metodoPago"
                    :items="metodosPago"
                    label="Método de pago"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="3" class="d-flex align-center">
                <v-switch
                    v-model="form.paga_con_tarjeta"
                    color="primary"
                    inset
                    hide-details
                    label="¿Pago con tarjeta?"
                />
              </v-col>
            </v-row>

            <v-row class="mt-1">
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="form.cliente"
                    label="Cliente"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                    v-model="form.direccion_envio"
                    label="Dirección de envío"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                    auto-grow
                    hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-row class="mt-1">
              <v-col cols="12" md="8">
                <v-textarea
                    v-model="form.observacion"
                    label="Observación"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                    auto-grow
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-card variant="tonal" class="rounded-lg resumen-top pa-4">
                  <div class="text-body-2 text-medium-emphasis mb-1">Total de la Factura</div>
                  <div class="text-h4 font-weight-bold">
                    {{ money(total) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Taxes incluidos: {{ money(taxes) }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex align-center justify-space-between mt-6 mb-3 flex-wrap ga-2">
              <div>
                <div class="text-h6 font-weight-bold">Detalle de artículos</div>
                <div class="text-body-2 text-medium-emphasis">
                  Agrega los registros que formarán parte de la factura.
                </div>
              </div>

              <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="agregarFila"
              >
                Agregar fila
              </v-btn>
            </div>

            <div class="table-wrap">
              <v-table class="detalle-table">
                <thead>
                <tr>
                  <th class="text-left" style="width: 70px">#</th>
                  <th class="text-left" style="min-width: 130px">Cod.</th>
                  <th class="text-left" style="min-width: 260px">Artículo</th>
                  <th class="text-left" style="min-width: 140px">Precio</th>
                  <th class="text-left" style="min-width: 140px">Cantidad</th>
                  <th class="text-left" style="min-width: 170px">Desc. unidad</th>
                  <th class="text-left" style="min-width: 170px">Total descuento</th>
                  <th class="text-left" style="min-width: 170px">Total registro</th>
                  <th class="text-center" style="width: 90px">Quitar</th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="(item, index) in form.cuerpo" :key="item.uid">
                  <td>{{ index + 1 }}</td>

                  <td>
                    <v-text-field
                        v-model="item.cod"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="Código"
                    />
                  </td>

                  <td>
                    <v-text-field
                        v-model="item.articulo"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="Nombre del artículo"
                    />
                  </td>

                  <td>
                    <v-text-field
                        v-model="item.precio"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                  </td>

                  <td>
                    <v-text-field
                        v-model="item.cantidad"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        min="0"
                        step="0.01"
                        placeholder="0"
                    />
                  </td>

                  <td>
                    <v-text-field
                        v-model="item.descuento_unidad"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                  </td>

                  <td class="font-weight-medium">
                    {{ money(totalDescuentoFila(item)) }}
                  </td>

                  <td class="font-weight-bold">
                    {{ money(totalRegistroFila(item)) }}
                  </td>

                  <td class="text-center">
                    <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        color="error"
                        @click="eliminarFila(index)"
                    />
                  </td>
                </tr>

                <tr v-if="!form.cuerpo.length">
                  <td colspan="9" class="text-center py-8 text-medium-emphasis">
                    No hay registros. Agrega al menos una fila.
                  </td>
                </tr>
                </tbody>
              </v-table>
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
                            :model-value="`${(TAX_RATE * 100).toFixed(2)} %`"
                            label="Tax Virginia"
                            variant="outlined"
                            density="comfortable"
                            readonly
                        />
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-text-field
                            :model-value="`${(SQUARE_RATE * 100).toFixed(2)} %`"
                            label="Comisión Square"
                            variant="outlined"
                            density="comfortable"
                            readonly
                        />
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-text-field
                            :model-value="money(SQUARE_FIXED)"
                            label="Cargo fijo Square"
                            variant="outlined"
                            density="comfortable"
                            readonly
                        />
                      </v-col>
                    </v-row>

                    <div class="text-body-2 text-medium-emphasis">
                      Cuando la factura se paga con tarjeta, el sistema calcula automáticamente
                      cuánto debes colocar en Square para que el neto recibido sea igual al subtotal
                      de la factura, antes de taxes.
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
                      <strong>{{ money(totalDescuento) }}</strong>
                    </div>

                    <div class="resumen-line">
                      <span>Sub total</span>
                      <strong>{{ money(subTotal) }}</strong>
                    </div>

                    <div class="resumen-line">
                      <span>Taxes (5.3%)</span>
                      <strong>{{ money(taxes) }}</strong>
                    </div>

                    <div class="resumen-line resumen-line-total">
                      <span>Total</span>
                      <strong>{{ money(total) }}</strong>
                    </div>

                    <div class="resumen-line" v-if="form.paga_con_tarjeta">
                      <span>Base neta deseada</span>
                      <strong>{{ money(baseNetaParaSquare) }}</strong>
                    </div>

                    <div class="resumen-line" v-if="form.paga_con_tarjeta">
                      <span>Fee Square estimado</span>
                      <strong>{{ money(squareFeeCalculado) }}</strong>
                    </div>

                    <div
                        class="resumen-line resumen-line-square"
                        v-if="form.paga_con_tarjeta"
                    >
                      <span>Total a colocar en Square</span>
                      <strong>{{ money(totalAColocarSquare) }}</strong>
                    </div>

                    <div v-else class="text-body-2 text-medium-emphasis mt-3">
                      Si activas “Pago con tarjeta”, aquí se mostrará el monto que debes
                      cobrar en Square para que te quede limpio el subtotal.
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-6 ga-3 flex-wrap">
              <v-btn
                  variant="outlined"
                  color="grey-darken-1"
                  :disabled="guardando"
                  @click="router.push('/fac_generica')"
              >
                Cancelar
              </v-btn>

              <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-content-save-outline"
                  :loading="guardando"
                  @click="guardarFactura"
              >
                Guardar factura
              </v-btn>
            </div>
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

const TAX_RATE = 0.053
const SQUARE_RATE = 0.035
const SQUARE_FIXED = 0.15

type DetalleItem = {
  uid: string
  cod: string
  articulo: string
  precio: number | string
  cantidad: number | string
  descuento_unidad: number | string
}

type FormFactura = {
  fecha: string
  cliente: string
  direccion_envio: string
  fecha_maximo_envio: string
  paga_con_tarjeta: boolean
  observacion: string
  cuerpo: DetalleItem[]
}

const guardando = ref(false)

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
})

const metodosPago = [
  { title: "Efectivo", value: "efectivo" },
  { title: "Tarjeta", value: "tarjeta" },
]

const hoy = new Date()
const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

const form = reactive<FormFactura>({
  fecha: fechaHoy,
  cliente: "",
  direccion_envio: "",
  fecha_maximo_envio: "",
  paga_con_tarjeta: false,
  observacion: "",
  cuerpo: [],
})

const metodoPago = computed({
  get: () => (form.paga_con_tarjeta ? "tarjeta" : "efectivo"),
  set: (value: string) => {
    form.paga_con_tarjeta = value === "tarjeta"
  },
})

function crearFila(): DetalleItem {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    cod: "",
    articulo: "",
    precio: 0,
    cantidad: 1,
    descuento_unidad: 0,
  }
}

function agregarFila() {
  form.cuerpo.push(crearFila())
}

function eliminarFila(index: number) {
  form.cuerpo.splice(index, 1)
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function totalDescuentoFila(item: DetalleItem): number {
  return round2(num(item.descuento_unidad) * num(item.cantidad))
}

function totalRegistroFila(item: DetalleItem): number {
  const total = num(item.precio) * num(item.cantidad) - totalDescuentoFila(item)
  return round2(total < 0 ? 0 : total)
}

const totalDescuento = computed(() => {
  return round2(form.cuerpo.reduce((acc, item) => acc + totalDescuentoFila(item), 0))
})

const subTotal = computed(() => {
  return round2(form.cuerpo.reduce((acc, item) => acc + totalRegistroFila(item), 0))
})

const taxes = computed(() => {
  return round2(subTotal.value * TAX_RATE)
})

const total = computed(() => {
  return round2(subTotal.value + taxes.value)
})

const baseNetaParaSquare = computed(() => {
  return round2(subTotal.value)
})

const totalAColocarSquare = computed(() => {
  if (!form.paga_con_tarjeta) return 0
  return round2((baseNetaParaSquare.value + SQUARE_FIXED) / (1 - SQUARE_RATE))
})

const squareFeeCalculado = computed(() => {
  if (!form.paga_con_tarjeta) return 0
  return round2(totalAColocarSquare.value - baseNetaParaSquare.value)
})

function money(value: number | string) {
  const amount = num(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function validarFormulario() {
  if (!form.cuerpo.length) {
    mostrarMensaje("Debes agregar al menos una fila", "error")
    return false
  }

  const filasValidas = form.cuerpo.filter((item) => {
    return item.articulo.trim() !== "" || item.cod.trim() !== "" || num(item.precio) > 0
  })

  if (!filasValidas.length) {
    mostrarMensaje("Debes ingresar al menos un artículo válido", "error")
    return false
  }

  const tieneArticuloSinNombre = filasValidas.some((item) => !item.articulo.trim())
  if (tieneArticuloSinNombre) {
    mostrarMensaje("Todos los registros deben tener nombre de artículo", "error")
    return false
  }

  const tieneCantidadInvalida = filasValidas.some((item) => num(item.cantidad) <= 0)
  if (tieneCantidadInvalida) {
    mostrarMensaje("La cantidad debe ser mayor que 0", "error")
    return false
  }

  const tienePrecioInvalido = filasValidas.some((item) => num(item.precio) < 0)
  if (tienePrecioInvalido) {
    mostrarMensaje("El precio no puede ser negativo", "error")
    return false
  }

  return true
}

function mostrarMensaje(text: string, color: "success" | "error" | "warning" = "success") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

async function guardarFactura() {
  if (guardando.value) return
  if (!validarFormulario()) return

  try {
    guardando.value = true

    const cuerpoLimpio = form.cuerpo
        .filter((item) => item.articulo.trim() !== "" || item.cod.trim() !== "" || num(item.precio) > 0)
        .map((item, index) => ({
          cod: item.cod.trim() || null,
          articulo: item.articulo.trim(),
          precio: round2(num(item.precio)),
          cantidad: round2(num(item.cantidad)),
          descuento_unidad: round2(num(item.descuento_unidad)),
          orden: index + 1,
        }))

    await $fetch("/api/fac_generica/guardar", {
      method: "POST",
      body: {
        fecha: form.fecha ? new Date(`${form.fecha}T12:00:00`) : new Date(),
        cliente: form.cliente.trim() || null,
        direccion_envio: form.direccion_envio.trim() || null,
        fecha_maximo_envio: form.fecha_maximo_envio
            ? new Date(`${form.fecha_maximo_envio}T12:00:00`)
            : null,
        paga_con_tarjeta: form.paga_con_tarjeta,
        observacion: form.observacion,
        cuerpo: cuerpoLimpio,

        total_descuento: totalDescuento.value,
        sub_total: subTotal.value,
        taxes: taxes.value,
        total: total.value,
        base_neta_para_square: baseNetaParaSquare.value,
        total_a_colocar_square: totalAColocarSquare.value,
        square_fee_calculado: squareFeeCalculado.value,
      },
    })

    mostrarMensaje("Factura guardada correctamente", "success")

    setTimeout(() => {
      router.push("/fac_generica")
    }, 500)
  } catch (error: any) {
    const message =
        error?.data?.statusMessage ||
        error?.statusMessage ||
        error?.message ||
        "Ocurrió un error al guardar la factura"

    mostrarMensaje(message, "error")
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  if (!form.cuerpo.length) {
    agregarFila()
  }
})
</script>

<style scoped>
.fac-page {
  background: #f6f7fb;
  min-height: 100vh;
}

.resumen-top {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.16));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
}

.detalle-table {
  min-width: 1300px;
}

.detalle-table :deep(th) {
  font-size: 13px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.72);
  background: #fafafa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}

.detalle-table :deep(td) {
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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

@media (max-width: 960px) {
  .fac-page {
    padding-bottom: 36px;
  }
}
</style>
