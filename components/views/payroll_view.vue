<template>
<v-card flat tile>
  <v-container fluid class="py-4">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">
          PLANILLA #{{ payroll?.id }} del {{payroll.start_period}} al {{payroll.end_period}}
          {{ mesesData.find(item=>item.value === payroll.month).title }} de {{ payroll?.year }}
        </h2>
        <div class="text-sm text-muted">
          Sucursal: <b>{{ payroll.office.name }}</b> · Colaborador: <b>{{ payroll.employee.name }}</b>
        </div>
      </div>
    </div>

    <v-row>
      <!-- 1) Resumen -->
      <v-col cols="12" md="12" lg="5">
        <v-card class="h-full">
          <v-card-title>Resumen</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item title="Año / Mes" :subtitle="`${payroll?.year} / ${payroll?.month}`" />
              <v-list-item title="Periodo"
                           :subtitle="`${payroll?.start_period} — ${payroll?.end_period}`" />
              <v-list-item title="Forma de pago" :subtitle="payroll.type_pay" />
              <v-list-item title="Oficina" :subtitle="payroll.office.name" />
              <v-list-item title="Empleado" :subtitle="payroll.employee.name" />
              <v-list-item title="Resumen" :subtitle="payroll.notes" />
              <v-list-item title="Creado" :subtitle="fdate(payroll.created_at)" />
            </v-list>
            <v-divider class="my-2" />
            <div class="grid grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-xs text-muted">Ingresos</div>
                <div class="text-lg font-semibold">{{ fmt(payroll.gross_total) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Deducciones</div>
                <div class="text-lg font-semibold">{{ fmt(payroll.deductions_total) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Neto</div>
                <div class="text-lg font-semibold">{{ fmt(payroll.net_total) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="h-full">
          <v-card-title>Registros de la planilla</v-card-title>
          <v-data-table
              :items="items"
              :headers="[
              { title: 'Tipo', value: 'type.name' },
              { title: 'Efecto', value: 'type.effect' },
              { title: 'Descripción', value: 'description' },
              { title: 'Monto', value: 'amount', align: 'end' }
            ]"
              density="compact"
              class="elevation-0">
            <template v-slot:item.amount="{item}">
              {{ fmt(item.amount) }}
            </template>
            <template v-slot:bottom="{item}">
              <v-divider />
              <div class="p-3 flex justify-between text-sm ma-4">
                <div class="flex gap-6">
                  <span><b>Ingresos:</b> {{ fmt(payroll.gross_total) }}</span> -
                  <span><b>Deducciones:</b> {{ fmt(payroll.deductions_total) }}</span>
                </div>
                <div><b>Neto:</b> {{ fmt(payroll.net_total) }}</div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

    </v-row>

    <v-row class="mt-2">
      <!-- 3) Asiento contable -->
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Asiento contable
            <v-spacer />
            <div class="text-sm text-muted">Débitos: {{ fmt(debitSum) }} · Créditos: {{ fmt(creditSum) }}</div>
          </v-card-title>

          <v-data-table
              :items="lines"
              :headers="[
              { title: 'Cuenta', value: 'account.name' },
              { title: 'Código', value: 'account.code' },
              { title: 'Débito', value: 'debit', align: 'end' },
              { title: 'Crédito', value: 'credit', align: 'end' }
            ]"
              density="compact"
              class="elevation-0"
          >
            <template v-slot:item.debit="{item}">
              {{fmt(item.debit)}}
            </template>
            <template v-slot:item.credit="{item}">
              {{fmt(item.credit)}}
            </template>

            <template v-slot:bottom="{item}">
              <v-divider/>
              <div class="p-3 flex justify-end text-sm ma-4">
                <div class="grid grid-cols-2 gap-6">
                  <div><b>Total Débitos:</b> {{ fmt(debitSum) }}</div>
                  <div><b>Total Créditos:</b> {{ fmt(creditSum) }}</div>
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</v-card>
</template>

<script lang="ts" setup>
import {defineProps} from "vue";
import type {PayrollInterfaz} from "@/types/employeeInterfaz";
import mesesData from "@/data/mesesData";

const props = defineProps<{
  payroll: PayrollInterfaz
}>()
const items = computed(() => props.payroll?.items ?? [])
const meta = computed(() => ({
  created_at: props.payroll?.created_at,
  updated_at: props.payroll?.updated_at,
  notes: props.payroll?.notes,
  trxCod: props.payroll?.transaction?.cod,
  trxDate: props.payroll?.transaction?.date,
}))

type MoneyLike = number | string
const lines = computed(() => props.payroll?.transaction?.lines ?? [])
const debitSum = computed(() =>
    lines.value.reduce((s: number, l: any) => s + Number(l.debit ?? 0), 0)
)
const creditSum = computed(() =>
    lines.value.reduce((s: number, l: any) => s + Number(l.credit ?? 0), 0)
)
const fmt = (n: MoneyLike) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n ?? 0))
const fdate = (d?: string | Date) =>
    d ? new Date(d).toLocaleDateString() : '-'
</script>

<style scoped>

</style>
