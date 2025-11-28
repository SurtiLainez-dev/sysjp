<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Nueva Orden de Entrada
      <v-spacer></v-spacer>
    </v-card-title>

    <v-form ref="FormNewEntryOrder" class="pa-2" @submit.prevent="osSubmitOrder">
      <v-row class="mt-3">
        <v-col cols="12" md="4">
          <v-autocomplete
              v-model="order.supplier_id"
              :items="Suppliers"
              :item-value="'id'"
              :item-title="'name'"
              label="Seleccionar un Proveedor *"
              :rules="[val.req()]"
              variant="outlined"
              autocomplete="off"
              @update:modelValue="loadInventoryXsupplier"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
              v-model="order.office_id"
              :items="Offices"
              :item-value="'id'"
              :item-title="'name'"
              label="Seleccionar una Oficina *"
              :rules="[val.req()]"
              variant="outlined"
              autocomplete="off"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
              label="Referencia del Documento *"
              counter="50"
              v-model="order.code"
              autocomplete="off"
              :rules="[val.req(), val.minLen(4), val.max(50)]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              label="Notas"
              counter="150"
              v-model="order.notes"
              autocomplete="off"
              :rules="[val.max(150)]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
              label="Descuento"
              prefix="USD"
              v-model="order.disccount"
              autocomplete="off"
              :rules="[val.req(), val.isMoney]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
              label="Total"
              disabled
              prefix="USD"
              v-model="order.total"
              autocomplete="off"
              :rules="[val.req(), val.isMoney]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-btn color="secondary" v-if="order.supplier_id" @click="dialogoSearch = true" block tile>Agregar Articulo</v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="primary" v-if="order.supplier_id" type="submit" block tile>Registrar Orden</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-table >
      <thead>
      <tr>
        <th class="text-left">Articulo</th>
        <th class="text-left">Cant.</th>
        <th class="text-left">Precio</th>
        <th class="text-left">total</th>
        <th class="text-left"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in order.items" :key="item.id">
        <td>{{ item.name }}</td>
        <td>
          <v-text-field
              class="mt-5"
              type="number"
              @keyup="calcularTotalItem(item)"
              v-model="item.quantity"
              variant="outlined"
              density="comfortable"
          />
        </td>
        <td>
          <v-text-field
              class="mt-5"
              type="number"
              v-model="item.unit_cost"
              variant="outlined"
              @keyup="calcularTotalItem(item)"
              suffix="USD"
              density="comfortable"
          />
        </td>
        <td>$ {{Intl.NumberFormat().format(item.subtotal)}}</td>
        <td>
          <v-btn rounded color="red" @click="deleteItem(item.id)" icon><v-icon>mdi-close</v-icon></v-btn>
        </td>
      </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="dialogoSearch" max-width="800">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Inventario del Proveedor Seleccionado
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoSearch = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table
            :headers="headers"
            :search="search"
            :items="Inventory"
            @click:row="selectArticle"
        >
        </v-data-table>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import {useValidators} from "@/composables/useValidators";
import type {SupplierInterfaz} from "@/types/supplierInterfaz";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {useSupplierServices} from "@/services/useSupplierServices";
import {useEmployeeServices} from "@/services/useEmployeeServices";
import type {ArticleInterfaz} from "@/types/inventoryinterfaces";
import {useInventoryServices} from "@/services/useInventoryServices";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";

const order = ref({
  supplier_id: null,
  office_id:   null,
  code:        '',
  total:       0,
  notes:       '',
  items:       [],
  disccount:   0
})
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
  { key: 'sku', title: 'Sku' },
  { key: 'bar_code', title: 'Cod. Barra' },
  { key: 'brand.name', title: 'Marca' },
];
const FormNewEntryOrder = ref(null);
const val = useValidators();
const Suppliers = ref<SupplierInterfaz[]>([])
const Offices   = ref<OficinaInterfaz[]>([])
const Inventory = ref<ArticleInterfaz[]>([])
const dialogoSearch = ref(false)
const search        = ref('')
onMounted(async ()=>{
  Suppliers.value = await useSupplierServices().getSuppliers();
  Offices.value   = await useEmployeeServices().getOffices();
})

const calcularTotalItem = async (item:itemArticle)=>{
  if ((item.quantity && item.quantity > 0) && (item.unit_cost && item.unit_cost > 0)) {
    item.subtotal = (item.quantity * item.unit_cost);
    calcularTotalOrden(order.value.items)
  }
}
const calcularTotalOrden = (items: itemArticle[]) => {
  order.value.total =  items.reduce((acc, item) => acc + (item.subtotal || 0), 0)
  if (order.value.disccount > 0){
    order.value.total = (order.value.total - order.value.disccount).toFixed(2)
  }
}
const deleteItem = async (id:number)=>{
  order.value.items = order.value.items.filter(
      (item: ArticleInterfaz) => item.id !== id
  )
}
const loadInventoryXsupplier = async ()=>{
  Inventory.value = await useInventoryServices().getInventoryXsupplier(order.value.supplier_id);
}
const osSubmitOrder = async () => {
  if (order.value.items.length === 0)
    toast.error('Tiene que existir un item en lo orden de entrada', { autoClose: 3000 })
  else{
    const result = await FormNewEntryOrder.value?.validate()
    if (!result?.valid) {
      toast.error('Revisa los campos del formulario', { autoClose: 3000 })
      return
    }

    utilsStore().setLoading(true)
    try {
      await $fetch('/api/inventory/orders/entry_orders',{
        method: 'POST',
        body:{
          code:        order.value.code,
          supplier_id: order.value.supplier_id,
          office_id:   order.value.office_id,
          notes:       order.value.notes,
          total:       order.value.total,
          items:       order.value.items,
          disccount:   order.value.disccount
        }
      })

      toast.success('La orden ha sido registrada exitosamente', { autoClose: 2500 })
      navigateTo('/admin/inventory/entry_orders/')
    } catch (err: any){
      const msg = err?.statusMessage || "Error desconocido al registrar usuario"
      toast.error(msg, { autoClose: 3000 })
      return null
    }finally {
      utilsStore().setLoading(false)
    }
  }
}
const selectArticle = (event:any, data:{item:ArticleInterfaz}) =>{
  if (data.item.is_cc){
    if (!order.value.items.some((item:ArticleInterfaz)=>item.id===data.item.id)){
      order.value.items.push({
        id: data.item.id,
        name: data.item.name,
        quantity: 0,
        unit_cost: 0,
        subtotal: 0,
        is_cc:    data.item.is_cc
      });
      dialogoSearch.value = false;
    }else toast.warning('Este articulo ya fue seleccionado', { autoClose: 3000 })
  }else toast.warning('Este articulo es un servicio, no se puede contabilizar', { autoClose: 3000 })
}


interface itemArticle{
  id:        number,
  name:      string,
  quantity:  number,
  unit_cost: number,
  subtotal:  number,
  is_cc:     boolean
}
</script>

<style scoped>

</style>
