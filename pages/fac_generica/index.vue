<template>
  <v-container fluid class="pa-6">
    <v-card class="rounded-xl elevation-2">
      <v-card-title class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <div class="text-h5 font-weight-bold">Facturas Genéricas</div>
          <div class="text-body-2 text-medium-emphasis">
            Listado de documentos creados
          </div>
        </div>

        <div class="d-flex ga-2 flex-wrap align-center">
          <v-text-field
              v-model="search"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 280px"
          />

          <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="router.push('/fac_generica/new')"
          >
            Nueva Factura
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="table-wrap">
          <v-table hover class="tabla-facturas">
            <thead>
            <tr>
              <th class="text-left">#</th>
              <th class="text-left">Número</th>
              <th class="text-left">Cliente</th>
              <th class="text-left">Fecha</th>
              <th class="text-left">Subtotal</th>
              <th class="text-left">Taxes</th>
              <th class="text-left">Total</th>
              <th class="text-left">Square</th>
              <th class="text-center">Acciones</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="item in facturasFiltradas"
                :key="item.id"
            >
              <td>{{ item.id }}</td>

              <td>
                {{ item.numero || "-" }}
              </td>

              <td>
                {{ item.cliente || "-" }}
              </td>

              <td>
                {{ formatDate(item.fecha) }}
              </td>

              <td>
                {{ money(item.sub_total) }}
              </td>

              <td>
                {{ money(item.taxes) }}
              </td>

              <td class="font-weight-bold">
                {{ money(item.total) }}
              </td>

              <td>
                  <span v-if="Number(item.total_a_colocar_square || 0) > 0">
                    {{ money(item.total_a_colocar_square) }}
                  </span>
                <span v-else>-</span>
              </td>

              <td class="text-center">
                <div class="d-flex justify-center ga-2 flex-wrap">
                  <v-btn
                      size="small"
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-eye-outline"
                      @click="abrirFactura(item.id)"
                  >
                    Ver
                  </v-btn>

                  <v-btn
                      size="small"
                      color="warning"
                      variant="outlined"
                      prepend-icon="mdi-pencil-outline"
                      @click="editarFactura(item.id)"
                  >
                    Editar
                  </v-btn>
                </div>
              </td>
            </tr>

            <tr v-if="!facturasFiltradas.length">
              <td colspan="9" class="text-center py-6 text-medium-emphasis">
                No hay facturas registradas
              </td>
            </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const router = useRouter()

const facturas = ref<any[]>([])
const search = ref("")

async function cargarFacturas() {
  try {
    const res: any = await $fetch("/api/fac_generica")
    facturas.value = res?.data || []
  } catch (error) {
    console.error("Error cargando facturas:", error)
    facturas.value = []
  }
}

const facturasFiltradas = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return facturas.value

  return facturas.value.filter((f) => {
    const numero = String(f.numero || "").toLowerCase()
    const cliente = String(f.cliente || "").toLowerCase()
    const id = String(f.id || "")
    const fecha = formatDate(f.fecha).toLowerCase()

    return (
        numero.includes(term) ||
        cliente.includes(term) ||
        id.includes(term) ||
        fecha.includes(term)
    )
  })
})

function abrirFactura(id: number) {
  router.push(`/fac_generica/${id}`)
}

function editarFactura(id: number) {
  router.push(`/fac_generica/edit/${id}`)
}

function money(v: any) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v || 0))
}

function formatDate(date: string) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-US")
}

onMounted(() => {
  cargarFacturas()
})
</script>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.tabla-facturas {
  min-width: 1100px;
}

.tabla-facturas :deep(th) {
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
}

.tabla-facturas :deep(td) {
  vertical-align: middle;
}
</style>
