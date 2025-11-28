<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Marcas de Proveedores
      <v-spacer></v-spacer>

      <v-text-field
          v-model="search"
          density="compact"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn size="xs" color="secondary" icon tile @click="dialogoNewBrand = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table
        :headers="headers"
        :search="search"
        :items="Marcas"
    >
      <template v-slot:item.id="{ item }">
        <div class="d-flex row">
          <v-btn density="comfortable" class="ml-2" icon="mdi-account-edit" color="secondary" @click="openDialogoEdit(item)"></v-btn>
          <v-btn density="comfortable" class="ml-2 text-white" icon="mdi-plus" color="primary" @click="openDialogoAddProveedor(item)"></v-btn>
          <v-btn density="comfortable" class="ml-2 text-white" icon="mdi-eye" color="accent" @click="openDialogoSupplier(item)"></v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="dialogoNewBrand" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          <div v-if="typeSubmit">Creando Nueva Marca</div><div v-else>Editando Marca: {{nombreMarca}}</div>
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoNewBrand = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="FormNewBrand" @submit.prevent="onSubmitNewBrand">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="nombreMarca"
                  label="Nombre de la Marca *"
                  :rules="[val.req(), val.max(30)]"
                  counter="30"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar Marca
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoAddProveedor" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Agregando Proveedor a:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoAddProveedor = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{nombreMarca}}</v-card-subtitle>
        <v-divider></v-divider>

        <v-form ref="FormAddProveedor" @submit.prevent="onSubmitAddProveedor">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-select
                  v-model="proveedor_id"
                  :items="Proveedores"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Seleccionar Proveedor *"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
          </v-row>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Registrar Proveedor
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoSupplier" max-width="600">
      <v-card class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Proveedores de la Marca:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoSupplier = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{nombreMarca}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-list
            :items="suppliersBrands"
            item-title="name"
            item-value="id"
        ></v-list>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import {useValidators} from "@/composables/useValidators";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";
import type {BrandsInterfaz, SupplierInterfaz, SupplierBrandsInterfaz} from "@/types/supplierInterfaz";
import {useSupplierServices} from "@/services/useSupplierServices"

onMounted(async ()=>{
  Marcas.value      = await useSupplierServices().getBrands();
  Proveedores.value = await useSupplierServices().getSuppliers();
})
const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre de la Marca',
  },
  { key: 'id', title: 'Acciones' },
]
const val = useValidators();
const dialogoNewBrand = ref(false);
const dialogoAddProveedor = ref(false);
const dialogoSupplier     = ref(false);
const search = ref('');
const nombreMarca = ref('');
const FormNewBrand = ref(null);
const FormAddProveedor = ref(null);
const Marcas       = ref<BrandsInterfaz[]>();
const Proveedores  = ref<SupplierInterfaz[]>();
const typeSubmit   = ref(true);
const idMarca      = ref(0);
const proveedor_id = ref(null);
const suppliersBrands = ref<SupplierBrandsInterfaz[]>([]);

const openDialogoAddProveedor = (data:BrandsInterfaz)=>{
  nombreMarca.value = data.name;
  idMarca.value     = data.id;
  dialogoAddProveedor.value = true;
}
const openDialogoEdit = (data: BrandsInterfaz)=>{
  nombreMarca.value = data.name;
  typeSubmit.value = false;
  idMarca.value    = data.id;
  dialogoNewBrand.value = true;
}
const openDialogoSupplier = (data:BrandsInterfaz)=>{
  suppliersBrands.value = data.suppliers;
  nombreMarca.value     = data.name;
  dialogoSupplier.value = true;
}
const onSubmitAddProveedor = async ()=>{
  const result = await FormAddProveedor.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true);
  dialogoAddProveedor.value = false;

  try{
    const Payroll = await $fetch(`/api/suppliers/supplier_brand`, {
      method: 'POST',
      body:{
        brand_id:     idMarca.value,
        supplier_id:  proveedor_id.value
      }
    });
    toast.success('Se ha agregado la relación marca-proveedor', { autoClose: 3000 });
    nombreMarca.value = '';
    proveedor_id.value = null;
    Marcas.value = await useSupplierServices().getBrands();
  }catch (err){
    if (err.statusCode === 409 || err.statusCode === 404 || err.statusCode === 400)
      toast.error(err.statusMessage, { autoClose: 3000 });
    else
      toast.error('No se pudo crear la relación', { autoClose: 3000 });

    dialogoAddProveedor.value = true;
  }finally {
    utilsStore().setLoading(false);
    typeSubmit.value = true;
  }
}
const onSubmitNewBrand = async () => {
  const result = await FormNewBrand.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true);
  dialogoNewBrand.value = false;
  try{
    if (typeSubmit.value){
      const Payroll = await $fetch(`/api/suppliers/brand`, {
        method: 'POST',
        body:{
          name:     nombreMarca.value,
        }
      });
      toast.success('Se ha registrado exitosamente la marca', { autoClose: 3000 });
    }else{
      const Payroll = await $fetch(`/api/suppliers/brand/`+idMarca.value, {
        method: 'PUT',
        body:{
          name:     nombreMarca.value,
        }
      });
      toast.success('Se ha editado exitosamente la marca', { autoClose: 3000 });
    }
    nombreMarca.value = '';
    Marcas.value = await useSupplierServices().getBrands();
  }catch (err){
    toast.error('No se pudo crear la marca', { autoClose: 3000 });
    dialogoNewBrand.value = true;
  }finally {
    utilsStore().setLoading(false);
    typeSubmit.value = true;
  }
}
</script>

<style scoped>

</style>
