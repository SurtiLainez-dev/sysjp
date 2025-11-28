<template>
<v-card flat tile>
  <v-card-title class="d-flex align-center pe-2">
    Registro Diario
    <v-spacer></v-spacer>
  </v-card-title>
  <v-card-subtitle>Parametros de busqueda</v-card-subtitle>
  <v-row class="pa-2">
    <v-col cols="12" md="4">
      <v-text-field
          v-model="busqueda.ano"
          label="Año"
          counter="30"
          variant="outlined"
          density="comfortable"
          required
      />
    </v-col>
    <v-col cols="12" md="4">
      <v-select
          v-model="busqueda.mes"
          :items="mesesData"
          label="Mes"
          variant="outlined"
          density="comfortable"
          required
          @update:modelValue="getAccounts"
      />
    </v-col>
    <v-col cols="12" md="4">
      <v-select
          v-model="busqueda.dia"
          :items="diasData"
          label="Día"
          variant="outlined"
          density="comfortable"
          required
          @update:modelValue="getAccounts"
      />
    </v-col>
  </v-row>
  <v-row class="pa-2">
    <v-col class="d-flex justify-end">
      <v-btn rounded color="primary" class="ma-2" icon @click="print"><v-icon>mdi-printer</v-icon></v-btn>
    </v-col>
  </v-row>
  <v-divider></v-divider>
  <div class="ld-wrapper" id="print-area">
    <header class="ld-header">
      <div class="ld-company">JOHANA PACHECO HAIR BEAUTY STUDIO</div>
      <div class="ld-title">General Journa</div>
    </header>

    <v-table class="ld-table" density="comfortable">
      <thead>
      <tr>
        <th class="ld-th ld-col-date">Date</th>
        <th class="ld-th ld-col-office">Office</th>
        <th class="ld-th ld-col-office">Code</th>
        <th class="ld-th ld-col-acc">Account Name</th>
        <th class="ld-th ld-col-amount">Debit</th>
        <th class="ld-th ld-col-amount">Credit</th>
      </tr>
      </thead>
      <tbody>
        <template v-for="(entry, eidx) in Registers" :key="eidx">
          <tr class="ld-row" v-if="entry.lines && entry.lines.length" >
            <td class="ld-td ld-col-date" :rowspan="entry.lines.length + (entry.memo ? 1 : 0)">
              {{ new Date(entry.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' }) }}
            </td>
            <td class="ld-td ld-col-office" :rowspan="entry.lines.length + (entry.memo ? 1 : 0)" style="border-left: none; border-right: none">
              {{ entry.office?.name || '-' }}
            </td>
            <td class="ld-td ld-col-code" style="border: none" >{{ entry.lines[0]?.account?.code || '-' }}</td>
            <td class="ld-td ld-col-acc" style="border: none">
              <div class="ld-acc">
                {{ entry.lines[0]?.account?.name || '-' }}
                <span v-if="entry.lines[0]?.account?.code" class="ld-acc-code">· {{ entry.lines[0].account.code }}</span>
              </div>
            </td>
            <td class="ld-td ld-col-amount" style="border: none">{{ fmt(entry.lines[0]?.debit) || '$0.00' }}</td>
            <td class="ld-td ld-col-amount" style="border: none">{{ fmt(entry.lines[0]?.credit) || '$0.00' }}</td>
          </tr>

          <tr class="ld-row" v-for="(ln, lIdx) in entry.lines.slice(1)" :key="lIdx">
            <td class="ld-td ld-col-code" style="border: none">{{ entry.lines[0]?.account?.code || '-' }}</td>
            <td class="ld-td ld-col-acc" style="border: none">
              <div class="ld-acc" style="border: none">
                {{ ln.account?.name || '-' }}
                <span v-if="ln.account?.code" class="ld-acc-code">· {{ ln.account.code }}</span>
              </div>
            </td>
            <td class="ld-td ld-col-amount" style="border: none">{{ fmt(ln.debit) }}</td>
            <td class="ld-td ld-col-amount" style="border: none">{{ fmt(ln.credit) }}</td>
          </tr>

          <tr v-if="entry.memo" class="ld-row ld-row-narration">
            <td class="ld-td ld-col-acc ld-narration" colspan="4" style="border-bottom-color: #ddd; border-top: none; border-left: none">
              * {{ entry.memo }}
            </td>
          </tr>
        </template>
      </tbody>
    </v-table>

  </div>
</v-card>
</template>

<script lang="ts" setup>
import {ref, onMounted} from "vue"
import mesesData from "@/data/mesesData";
import diasData from "@/data/diasData";
import type {TransactionInterfaz} from "@/types/transactionInterfacez";
import {useCcServices} from "@/services/useCcServices";
import {toast} from "vue3-toastify";

const busqueda = ref({
  ano: 0,
  mes: 0,
  dia: 0
});
const Registers = ref<TransactionInterfaz[]>([])
onMounted(async ()=>{
  let date = new Date();
  busqueda.value.ano = date.getFullYear();
  busqueda.value.mes = (date.getMonth()+1);
  busqueda.value.dia = 15;
  let mes = busqueda.value.mes
  if (mes > 0 && mes <10)
    mes = '0'+mes

  let fecha          = busqueda.value.ano+'-'+mes+'-'+busqueda.value.dia;
  Registers.value    = await useCcServices().getRegisters(fecha);
})

const getAccounts = async () => {
  let mes = busqueda.value.mes
  if (mes > 0 && mes <10)
    mes = '0'+mes

  let fecha          = busqueda.value.ano+'-'+mes+'-'+busqueda.value.dia;

  if (mes !== 0)
    Registers.value = await useCcServices().getRegisters(fecha)
  else
    toast.warning("Selecciona otra opción", {autoClose: 3000})
}
const fmt = (n?: number) =>
    n && n !== 0
        ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(n)
        : '';
const print = ()=>{
  const area = document.getElementById("print-area");
  if (!area) return;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Impresión</title>
        <style>
          /* Aquí puedes incluir tus estilos o reutilizar los de tu app */
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        ${area.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
</script>

<style scoped>
.ld-wrapper {
  background: #fff;
  padding: 12px;
}

.ld-header {
  text-align: center;
  margin-bottom: 10px;
}
.ld-company {
  font-weight: 600;
  letter-spacing: 0.5px;
}
.ld-title {
  font-size: 18px;
  font-weight: 700;
  margin-top: 2px;
}

.ld-table {
  border: 1px solid #ddd;
}
.ld-th, .ld-td {
  vertical-align: top !important;
  font-size: 14px;
}
.ld-th {
  background: #f5f5f5;
  font-weight: 700 !important;
}
.ld-table .ld-td{
  font-size: 12px;
}
.ld-th.ld-col-date,
.ld-td.ld-col-date {
  text-align: center !important;
  border-right: none !important;
}
.ld-col-acc  { width: auto;  }
.ld-col-amount { width: 160px; text-align: right; }

.ld-acc {
  white-space: pre-wrap;
}
.lvl-0 { padding-left: 0;   font-weight: 600; } /* cuenta principal */
.lvl-1 { padding-left: 18px; }
.lvl-2 { padding-left: 36px; }

.ld-note {
  font-size: 12px;
  color: #666;
}

.ld-narration {
  font-style: italic;
  color: #444;
  font-size: 12px;
  font-weight: bold;
}

/* Modo impresión */
@media print {
  .ld-wrapper { padding: 0; }
  .ld-table { border-color: #000; }
  .ld-th, .ld-td { border-color: #000; }
}
</style>
