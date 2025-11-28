<template>
  <v-card flat tile>
    <v-card v-if="!vista" flat tile>
      <v-card-title class="d-flex align-center pe-2">
        Planillas
        <v-spacer></v-spacer>
      </v-card-title>
      <v-row class="pa-2">
        <v-col cols="12" md="6">
          <v-text-field
              v-model="busqueda.ano"
              label="Año de la busqueda *"
              counter="30"
              variant="outlined"
              density="comfortable"
              required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
              v-model="busqueda.mes"
              :items="mesesData"
              label="Parametro de busqueda *"
              variant="outlined"
              density="comfortable"
              required
              @update:modelValue="getPayrolls"
          />
        </v-col>
      </v-row>
      <v-data-table
          :headers="headers"
          :items="Payrolls"
          @click:row="seletItem"
      >
        <template v-slot:item.start_period="{ item  }">
          del {{item.start_period}} al {{item.end_period}} de {{mesesData.find(i=>i.value === item.month).title}} de {{item.year}}
        </template>
        <template v-slot:item.net_total="{ value  }">
          $ {{value}}
        </template>
      </v-data-table>
    </v-card>

    <v-card flat tile v-else>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn rounded color="secondary" @click="vista = !vista" icon><v-icon>mdi-arrow-left</v-icon></v-btn>
        <v-spacer></v-spacer>
        Planilla #{{Payroll.id}}
      </v-card-title>
      <v-divider class="my-2" />
      <payroll_view :payroll="Payroll"/>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import {ref} from "vue"
import {usePayrollsServices} from "@/services/usePayrollsServices";
import mesesData from "@/data/mesesData";
import type {PayrollItemInterfaz, PayrollInterfaz} from "@/types/employeeInterfaz";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";
import payroll_view from "@/components/views/payroll_view.vue";
import Payroll_view from "@/components/views/payroll_view.vue";
const Payrolls = ref<PayrollInterfaz>([]);
const Payroll  = ref<PayrollInterfaz | null>(null);
const busqueda = ref({
  ano: '',
  mes: 0
})
const vista = ref(false);
const headers = [
  {
    align: 'start',
    key: 'employee.name',
    sortable: false,
    title: 'Nombre del Colaborador',
  },
  { key: 'office.name', title: 'Oficina' },
  { key: 'start_period', title: 'Periodo de Pago' },
  { key: 'net_total', title: 'Total' },
  { key: 'type_pay', title: 'Forma de Pago' },
]
onMounted(async ()=>{
  let fecha = new Date();
  busqueda.value.ano = fecha.getFullYear();
  busqueda.value.mes = (fecha.getMonth() + 1);
  Payrolls.value = await usePayrollsServices().getPayrolls(busqueda.value.ano, busqueda.value.mes);
  utilsStore().setLoading(false);
})

const seletItem = async (event:any, data:{item:PayrollInterfaz}) => {
  utilsStore().setLoading(true);
  try {
    const res = await $fetch<{ ok: boolean; data: PayrollInterfaz }>(`/api/employees/payrolls/${data.item.id}`)
    toast.success("Planilla cargada exitosamente", { autoClose: 3000 });
    Payroll.value = res.data;
    vista.value = true;
  }catch (err) {
    toast.error("Hubo un error al carga la planilla", {autoClose: 3000})
  }finally {
    utilsStore().setLoading(false);
  }
}

const getPayrolls = async () => {
  if (busqueda.value.mes !== 0)
    Payrolls.value = await usePayrollsServices().getPayrolls(busqueda.value.ano, busqueda.value.mes);
  else
    Payrolls.value = await usePayrollsServices().getAllPayrolls();
}
</script>

<style scoped>

</style>
