<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Nueva Planilla

      <v-spacer></v-spacer>
      <v-btn size="xs" color="green" icon tile @click="addLineItems"><v-icon>mdi-plus</v-icon></v-btn>
      <v-btn size="xs" color="grey" icon tile class="ml-2" @click="deletLastLineItem"><v-icon>mdi-eraser</v-icon></v-btn>
      <v-btn size="xs" color="secondary" icon class="ml-2" tile @click="dialogoNewTypeRoll = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-form ref="formNewPlanilla" class="pa-2" @submit.prevent="valPayRoll">
      <v-row class="mt-3">
        <!-- Office -->
        <v-col cols="12" md="6">
          <v-autocomplete
              label="Sucursal (Office)"
              v-model="planilla.office_id"
              :items="Offices"
              item-title="name"
              autocomplete="off"
              item-value="id"
              :rules="[val.req()]"
              variant="outlined"
              density="comfortable"
              @update:modelValue="getOffices"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
              label="Selecciona un Colaborador"
              v-model="planilla.colaborador_id"
              :items="Employees"
              item-title="name"
              autocomplete="off"
              :rules="[val.req()]"
              :disabled="Employees.length === 0"
              item-value="id"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="3" md="3">
          <v-text-field
              v-model="planilla.year"
              label="Año"
              :rules="[val.isNumber, val.req(), val.isFourDigits]"
              counter="4"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="3" md="3">
          <v-text-field
              v-model="planilla.month"
              label="Mes"
              type="number"
              min="1"
              :rules="[val.isNumber, val.max(2), val.isBetween(1, 12)]"
              max="12"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="3" md="3">
          <v-text-field
              v-model="planilla.start"
              label="Incio del Periodo"
              :rules="[val.isNumber, val.max(2), val.isBetween(1, 31)]"
              type="number"
              min="1"
              max="31"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="3" md="3">
          <v-text-field
              v-model="planilla.end"
              label="Final del Periodo"
              type="number"
              min="1"
              :rules="[val.isNumber, val.max(2), val.isBetween(1, 31)]"
              max="31"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="4" md="4">
          <v-text-field
              v-model="planilla.deducciones"
              label="Total de Deducciones"
              prefix="$. "
              disabled
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="4" md="4">
          <v-text-field
              v-model="planilla.agregados"
              label="Total de Agregados"
              prefix="$. "
              disabled
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="4" md="4">
          <v-text-field
              v-model="planilla.total"
              label="Total del Pago"
              prefix="$. "
              disabled
              :rules="[val.isGreaterThan(1)]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
      </v-row>
      <v-card-subtitle>Cuerpo de la Planilla</v-card-subtitle>
      <v-row v-for="(item, key) in planilla.items" no-gutters>
        <v-col cols="4" md="4">
          <v-autocomplete
              autocomplete="off"
              :label="'Tipo de item de la linea'+(key+1)"
              v-model="item.type_payroll_id"
              :items="TypePayrolls"
              item-title="name"
              class="ma-1"
              :rules="[val.req()]"
              @update:modelValue="(e)=>asignarTypeItemPlanilla(item, e)"
              item-value="id"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="5" md="5">
          <v-text-field
              class="ma-1"
              :rules="[val.req()]"
              v-model="item.description"
              :label="'Detalle de la linea '+(key+1)"
              variant="outlined"
              autocomplete="off"
              density="comfortable"
          />
        </v-col>
        <v-col cols="3" md="3">
          <v-text-field
              class="ma-1"
              @update:modelValue="validarPrimerItem"
              v-model="item.amount"
              :label="'Total de la linea'+(key+1)"
              prefix="$."
              autocomplete="off"
              :rules="[val.isMoney, val.isGreaterThan(1)]"
              variant="outlined"
              density="comfortable"
              @keyup.enter="validarPrimerItem"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn tile color="green" type="submit" >Registrar Planilla</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-dialog v-model="dialogoNewTypeRoll" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Creando Nuevo Item de Pago
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoNewTypeRoll = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="FormNewTipoPago" @submit.prevent="onSubmitTipoPago">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-select
                  :items="types"
                  v-model="type.type"
                  label="Tipo de Item"
                  :item-value="'value'"
                  :rules="[val.req()]"
                  :item-title="'text'"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="type.name"
                  label="Nombre"
                  counter="25"
                  :rules="[val.req(),val.max(25)]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
            <v-col v-if="type.type === 'SUBTRACT' " cols="12" md="12">
              <v-checkbox v-model="type.is_otros_gastos" label="¿Otros Ingresos?"/>
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar Nuevo Item de Pago
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoFinal" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Finalizando Planilla
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoFinal = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="FormFinalPlanilla" @submit.prevent="onSubmitPlanilla">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-select
                  :items="paysType"
                  v-model="planilla.payType"
                  label="Seleccione forma de pago"
                  variant="outlined"
                  :rules="[val.req()]"
                  density="comfortable"
              />
            </v-col>
            <v-col v-if="planilla.payType && planilla.payType !== 'CASH'" cols="12" md="12">
              <v-select
                  :items="Banks"
                  v-model="planilla.bankAccount"
                  label="Seleccione un banco"
                  :item-value="'id'"
                  :rules="[val.req()]"
                  :item-title="item => `${item.number} - ${item.bank.name}`"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="12">
              <v-textarea v-model="planilla.notas"
                          label="Notas"
                          :rules="[val.req()]"
                          placeholder="Escribir una nota para la partida"
                          variant="outlined"
                          density="comfortable"></v-textarea>
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar Nuevo Item de Pago
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import {useEmployeeServices} from "@/services/useEmployeeServices";
import {onMounted} from "vue";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import type {EmployeeInterfaz, TypePayrollInterfaz, PayrollItemInterfaz} from "@/types/employeeInterfaz";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";
import type {BankAccountInterfaz} from "@/types/bankInterfaz";
import {useBankServices} from "@/services/useBankServices";
import {useValidators} from "@/composables/useValidators"

const val = useValidators();
const types = [
  {value:'ADD', text:'Suma (+)'},
  {value:'SUBTRACT', text:'Resta (-)'},
]
const paysType = ['CASH','TRANSFER','CARD','CHECK','ZELLE']
const type = ref({
  type: null,
  name: '',
  is_otros_gastos: false
})
const planilla = ref({
  office_id: null,
  colaborador_id: null,
  year: 0,
  month: 0,
  start: 1,
  end: 2,
  deducciones: 0,
  agregados: 0,
  total: 0,
  items:[
    {type_payroll_id: null, description: '', amount:0, effect: null, account_id: null, type:null}
  ],
  payType: null,
  bankAccount: null,
  notas: ''
})
const FormNewTipoPago   = ref<any>(null)
const formNewPlanilla   = ref<any>(null)
const FormFinalPlanilla = ref<any>(null)
const Offices           = ref<OficinaInterfaz[]>([]);
const Employees         = ref<EmployeeInterfaz[]>([]);
const TypePayrolls      = ref<TypePayrollInterfaz[]>([]);
const Banks             = ref<BankAccountInterfaz[]>([]);


const dialogoNewTypeRoll = ref(false);
const dialogoFinal       = ref(false);
onMounted(async ()=>{
  Offices.value = await useEmployeeServices().getOffices();
  let fecha = new Date();
  planilla.value.year = fecha.getFullYear();
  planilla.value.month = (fecha.getMonth() + 1);
  TypePayrolls.value   = await useEmployeeServices().getTypePayrolls();
  Banks.value          = await useBankServices().getAccounts();
})

const asignarTypeItemPlanilla = (item:PayrollItemInterfaz, n: number) => {
  let Type:TypePayrollInterfaz = TypePayrolls.value.find((data:TypePayrollInterfaz)=>data.id === item.type_payroll_id);
  item.effect = Type.effect;
  if (Type.effect === 'ADD') {
    item.account = Type.default_debit_account_id;
    item.type    = 'DEBIT'
  }else {
    item.account = Type.default_credit_account_id;
    item.type    = 'CREDIT'
  }
  calcularSaldo();
  validarPrimerItem();
}
const calcularSaldo = () => {
  let totalAgregados =  planilla.value.items.reduce((sum, item) => {
    return item.effect === 'ADD' ? sum + Number(item.amount || 0) : sum
  }, 0);
  let totalDeducciones =  planilla.value.items.reduce((sum, item) => {
    return item.effect === 'SUBTRACT' ? sum + Number(item.amount || 0) : sum
  }, 0);
  planilla.value.agregados = totalAgregados;
  planilla.value.deducciones = totalDeducciones
  planilla.value.total = planilla.value.agregados - planilla.value.deducciones;
}
const getOffices = async ()=>{
  Employees.value = await useEmployeeServices().getEmployeesXoffices(planilla.value.office_id);
}

const addLineItems = () => {
  planilla.value.items.push({type_id: null, detalle: '', key: planilla.value.items.length + 1, total:0})
}
const deletLastLineItem = () => {
  if (planilla.value.items.length > 1) {
    planilla.value.items.pop();
    calcularSaldo()
  }else
    toast.warning('No puedes borrar todas las lineas, tienes que deja al menos 1', { autoClose: 3000 })
}
const onSubmitTipoPago = async ()=>{
  const result = await FormNewTipoPago.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true)
  dialogoNewTypeRoll.value = false;

  try {
    const newTypePayroll = await $fetch(`/api/employees/payrolls/type_payroll`, {
      method: 'POST',
      body: {
        effect:         type.value.type?.trim(),
        name:           type.value.name?.trim() || null,
        otros_ingresos: type.value.is_otros_gastos,
      }
    });
    type.value.name = '';
    type.value.is_otros_ingresos = false
    TypePayrolls.value   = await useEmployeeServices().getTypePayrolls();
  } catch (err) {
    toast.error('No se pudo crear el tipo de item', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
  }
}
const onSubmitPlanilla = async ()=>{
  const result = await FormFinalPlanilla.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true)
  dialogoFinal.value = false;
  let bankAccount = Banks.value.find((account:BankAccountInterfaz)=>account.id === planilla.value.bankAccount)
  let accounts    = [];
  accounts.push({
    account_id: bankAccount.account_id,
    amount:     planilla.value.total,
    type: 'CREDIT'
  })
  planilla.value.items.forEach((item:any)=>{
    accounts.push({account_id:item.account,amount:item.amount, type:item.type});
  })
  try {
    const Payroll = await $fetch(`/api/employees/payrolls/save`, {
      method: 'POST',
      body: {
        office_id:      planilla.value.office_id,
        colaborador_id: planilla.value.colaborador_id,
        year:           Number(planilla.value.year),
        month:          Number(planilla.value.month),
        start_period:   Number(planilla.value.start),
        end_period:     Number(planilla.value.end),
        deducciones:    planilla.value.deducciones,
        agregados:      planilla.value.agregados,
        total:          planilla.value.total,
        items:          planilla.value.items,
        payType:        planilla.value.payType,
        bankAccount:    planilla.value.bankAccount,
        notas:          planilla.value.notas,
        accounts:       accounts
      }
    });
    toast.success('Se ha registrado exitosamente la planilla de pago', { autoClose: 3000 })
  } catch (err) {
    toast.error('No se pudo crear el tipo de item', { autoClose: 3000 })
  } finally {
    utilsStore().setLoading(false)
    navigateTo('/admin/contabilidad/payrolls/')
  }
}
const valPayRoll = async () => {
  const result = await formNewPlanilla.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  calcularSaldo();
  dialogoFinal.value = true;
}
const validarPrimerItem = () => {
  if (planilla.value.items[0].effect !== 'ADD') {
    toast.warning('El primer item tiene que ser tipo ADD', {autoClose: 3000})
    planilla.value.items[0].amount = 0;
    planilla.value.items[0].type_payroll_id = null;
  }else calcularSaldo();
}
</script>

<style scoped>

</style>
