<template>
  <v-card class="rounded-sm" elevation="2">
    <div @click="triggerFileInput(false)" style="cursor: pointer;">
      <div v-if="articlePhoto">
        <v-img
            class="text-white"
            height="300px"
            :src="articlePhoto"
            cover
        >
          <div class="d-flex flex-column h-100">
            <v-card-title class="d-flex ga-2 px-2">
              <v-btn icon="mdi-arrow-left" @click="navigateTo('/admin/inventory/')" color="primary" variant="text"></v-btn>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-upload" @click="triggerFileInput(true)" color="secondary" variant="text"></v-btn>
              <v-btn icon="mdi-eye" @click="dialogoOpenPhoto = true" color="secondary" variant="text"></v-btn>
            </v-card-title>

            <v-spacer></v-spacer>

          </div>
        </v-img>
      </div>


      <v-hover v-else v-slot="{ isHovering }">
        <div
            class="d-flex flex-column align-center justify-center bg-grey-lighten-3"
            style="aspect-ratio: 16/10;"
        >
          <v-icon
              :color="isHovering ? 'grey-darken-2' : 'grey-darken-1'"
              size="64"
          >
            mdi-camera-plus
          </v-icon>
          <span class="text-caption text-grey-darken-1 mt-2">Click to add photo</span>
        </div>
      </v-hover>

      <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="onFileSelected"
      />
    </div>

    <v-card-text class="pt-4">

      <!-- Título + badge Service -->
      <div class="d-flex align-center justify-space-between">
        <div class="text-subtitle-1 font-weight-semibold">{{ title }}</div>
        <v-chip v-if="is_service"  color="indigo" variant="tonal" size="small" class="text-capitalize">
          Es un servicio
        </v-chip>
        <v-chip v-else  color="green" variant="tonal" size="small" class="text-capitalize">
          Es un articulo
        </v-chip>
      </div>
    </v-card-text>

    <div class="text-body-2 text-medium-emphasis mt-1 ml-3">
      {{ subtitle?subtitle:'Sin detalles de este articulo' }}
    </div>
    <v-divider></v-divider>
    <div class="d-flex align-center flex-wrap gap-2 mt-2 ml-2">
      <v-chip color="indigo" class="text-body-2 ma-1">Categoria: {{ category }}</v-chip>
      <v-chip color="pink" class="text-body-2 ma-1">Marca: {{ brand }}</v-chip>
    </div>

    <v-card class="mx-auto">
      <v-list lines="two">
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar>
              <v-icon color="indigo" icon="mdi-currency-usd"></v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>Precio de Costo</v-list-item-title>
          <v-list-item-subtitle>$ {{Intl.NumberFormat().format(articule.cost_price)}}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-list lines="two">
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar>
              <v-icon color="indigo" icon="mdi-currency-usd"></v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>Precio de Venta</v-list-item-title>
          <v-list-item-subtitle>$ {{Intl.NumberFormat().format(articule.sale_price)}}</v-list-item-subtitle>
        </v-list-item>
        <v-list selectable>
          <v-list-item @click="abrirDialogoEdirPrecio">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon color="indigo" icon="mdi-swap-horizontal"></v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>Cambiar Precios</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="articleStore().editArticlePhoto" @click="onSubmitPhoto" color="pink">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon color="green" icon="mdi-content-save"></v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>Registrar Foto Nueva</v-list-item-title>
          </v-list-item>
          <v-list-item @click="dialogoHistory = true">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon color="indigo" icon="mdi-history"></v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>Ver Historial Completo</v-list-item-title>
          </v-list-item>
          <v-list-item @click="dialogoEdit = true">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon color="pink" icon="mdi-pencil"></v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>Editar</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-list>
    </v-card>

    <v-dialog v-model="dialogoPrecio" max-width="600">
      <v-card >
        <v-card-title class="d-flex align-center pe-2">
          Asignado Precio a:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoPrecio = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{articule.name}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-form ref="formEditPrecio" class="pa-2" @submit.prevent="onSubmitEditPrecio">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-select
                  v-model="editPrecio.supplier_id"
                  :items="Suppliers"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Seleccionar Proveedor *"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                  v-model="editPrecio.cost"
                  label="Precio de Costo *"
                  :rules="[val.isMoney]"
                  suffix="USD"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                  v-model="editPrecio.sale"
                  label="Precio *"
                  variant="outlined"
                  :rules="[val.req(), val.isMoney, val.isGreaterThan(0)]"
                  density="comfortable"
                  type="number"
                  suffix="USD"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-select
                  v-model="editPrecio.taxes"
                  :items="Taxes"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Seleccione los Impuestos *"
                  variant="outlined"
                  density="comfortable"
                  chips
                  multiple
              />
            </v-col>
          </v-row>
          <v-card tile class="mx-auto">
            <v-list-item>
              <v-list-item-title>Tabla de Impuestos</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-subtitle v-for="item in totalsTaxesRate" >
              {{item.name}} ({{item.rate}}%) - ${{Intl.NumberFormat().format(item.tax)}}
            </v-list-item-subtitle>
              <v-list-item-title>Precio Neto $ {{Intl.NumberFormat().format(editPrecio.sale)}}</v-list-item-title>
              <v-list-item-title>Total de Impuestos $ {{Intl.NumberFormat().format(taxTotal)}}</v-list-item-title>
              <v-list-item-title>Precio de Venta $ {{Intl.NumberFormat().format(Number(editPrecio.sale) + taxTotal)}}</v-list-item-title>
            </v-list-item>
          </v-card>

          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Registrar Precio
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoEdit" max-width="600">
      <v-card >
        <v-card-title class="d-flex align-center pe-2">
          Editando Articulo:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoEdit = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{articule.name}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-form ref="formEditArt" class="pa-2" @submit.prevent="onSubmitEditArt">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-select
                  v-model="editArt.category_id"
                  :items="Categories"
                  :item-value="'id'"
                  :item-title="'name'"
                  label="Seleccionar Categoria *"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-text-field
                  v-model="editArt.name"
                  label="Nombre *"
                  :rules="[val.req()]"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-textarea
                  v-model="editArt.description"
                  label="Detalle *"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-text-field
                  v-model="editArt.bar_code"
                  label="Codigo de Barras"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-text-field
                  v-model="editArt.model_code"
                  label="Modelo"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>

          </v-row>
          <v-checkbox
              hint="Dejarlo marcado al menos que sea un servicio como por ejemelo corte de cabello, etc..."
              persistent-hint
              v-model="editArt.is_cc"
              label="¿Afecta el Catalogo Contable?"/>
          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Registrar Edición
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogoHistory" max-width="600">
      <v-card >
        <v-card-title class="d-flex align-center pe-2">
          Historial de:
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoHistory = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-subtitle>{{articule.name}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-text-field
            v-model="searchHistory"
            density="compact"
            label="Buscar"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            placeholder="buscar..."
            hide-details
            single-line
        ></v-text-field>
        <v-data-table :items="articule.history" :headers="headers">
          <template v-slot:item.created_at="{ value }">
            {{parseCreatedAtHelper(value)}}
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogoOpenPhoto" max-width="600">
      <v-card >
        <v-card-title class="d-flex align-center pe-2">
          Foto del Articulo
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoOpenPhoto = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-img
            v-if="dialogoOpenPhoto"
            class="text-white"
            :src="articlePhoto"
            cover
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import {articleStore} from "@/store/articleStore";
import type {ArticleInterfaz, CategoryInterfaz} from "@/types/inventoryinterfaces";
import type {SupplierInterfaz} from "@/types/supplierInterfaz";
import {useSupplierServices} from "@/services/useSupplierServices";
import {useValidators} from "@/composables/useValidators";
import type {TaxInterfaz} from "@/types/transactionInterfacez";
import {useCcServices} from "@/services/useCcServices";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";
import {useInventoryServices} from "@/services/useInventoryServices";
import {parseCreatedAtHelper} from "@/helpers/parseCreatedAtHelper"

const emit = defineEmits<{
  (e: 'reserve'): void
  (e: 'photo-selected', payload: { file: File; preview: string | ArrayBuffer | null }): void
  (e: 'select-availability', time: string): void
}>()
const props = defineProps<{
  title: string,
  is_service: boolean
  subtitle: string | null,
  category: string,
  brand: string,
  articule: ArticleInterfaz
}>()
const {articule} = toRefs(props)
const editPrecio = ref({
  supplier_id: null,
  cost: 0,
  sale: 0,
  taxes:[]
});
const editArt    = ref({
  name: articule.value.name,
  description: articule.value.description,
  is_cc: articule.value.is_cc,
  model_code: articule.value.model_code,
  bar_code: articule.value.bar_code,
  category_id: articule.value.category_id
})
onMounted(async ()=>{
  Categories.value = await useInventoryServices().getCategories();
})
const headers = [
  {
    align: 'start',
    key: 'description',
    sortable: false,
    title: 'Detalle',
  },
  { key: 'created_at', title: 'Fecha' }
]
const val = useValidators();
const fileInput = ref<HTMLInputElement | null>(null)
const dialogoPrecio  = ref(false);
const dialogoHistory = ref(false);
const dialogoOpenPhoto = ref(false);
const dialogoEdit      = ref(false);
const Suppliers     = ref<SupplierInterfaz[]>([])
const Taxes         = ref<TaxInterfaz[]>([])
const articlePhoto = computed(()=>{
  return articleStore().articlePhoto
})
const formEditPrecio = ref(null);
const formEditArt    = ref(null);
const searchHistory = ref('')
const artPhoto      = ref(null);
const Categories    = ref<CategoryInterfaz>([])

const totalsTaxesRate = computed(()=>{
  if (editPrecio.value.taxes.length === 0 || editPrecio.value.cost < 0 || editPrecio.value.sale <= 0) return [];
  else{
    // @ts-ignore
    let taxTotals = [];
    let taxWitTotal  = 0;
    let tax       = 0;
    selectedTaxes.value.forEach((item:TaxInterfaz)=>{
      if (item.rate > 0 && item.rate < 1){
        tax = 1+Number(item.rate);
        taxWitTotal = (editPrecio.value.sale*tax)
        taxTotals.push({
          name: item.name,
          rate: (item.rate * 100).toFixed(2),
          tax: (taxWitTotal - editPrecio.value.sale).toFixed(2)
        })
      }
    })
    // @ts-ignore
    return taxTotals;
  }
})
const selectedTaxes   = computed(() =>{
  if (Taxes.value.length > 0 && editPrecio.value.taxes.length > 0)
    return Taxes.value.filter((tax:TaxInterfaz) => editPrecio.value.taxes.includes(tax.id))
  else return []
})
const taxTotal        = computed(()=>{
  return totalsTaxesRate.value.reduce((sum:any, tax:{tax:number})=>sum+Number(tax.tax || 0),0)
})

const abrirDialogoEdirPrecio = async ()=>{
  if (Suppliers.value.length === 0)
    Suppliers.value = await useSupplierServices().getSuppliers();
  if (Taxes.value.length === 0)
    Taxes.value     = await useCcServices().getTaxes();

  dialogoPrecio.value = true;
}
const triggerFileInput = (isOpen:boolean)=> {
  if (!isOpen){
    if (!articlePhoto.value)
      fileInput.value?.click()
  }
  else fileInput.value?.click();
}
const onFileSelected = (event: Event)=> {
  const file = (event.target as HTMLInputElement).files?.[0];
  artPhoto.value = file;
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    emit('photo-selected', { file, preview: reader.result })
  }
  reader.readAsDataURL(file)
}
const onSubmitEditArt = (async ()=>{
  const result = await formEditArt.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  dialogoEdit.value = false;
  utilsStore().setLoading(true)
  try{
    const edit = await $fetch(`/api/inventory/article/${articule.value.sku}`, {
      method: 'PUT',
      body:{
        name:       editArt.value.name,
        description: editArt.value.description,
        model_code:  editArt.value.model_code,
        bar_code:    editArt.value.bar_code,
        is_cc:       editArt.value.is_cc
      }
    });

    navigateTo('/admin/inventory/')
    toast.success('Se ha registrado exitosamente los nuevos datos del articulo', { autoClose: 3000 });
  }catch (err){
    dialogoEdit.value = true;
    toast.error('No se pudo editar el articulo', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
  }
})
const onSubmitEditPrecio = (async ()=>{
  const result = await formEditPrecio.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  dialogoPrecio.value = false;
  utilsStore().setLoading(true)
  try{
    const editPr = await $fetch('/api/inventory/article/edit_price', {
      method: 'POST',
      body:{
        id:         articule.value.id,
        cost_price: editPrecio.value.cost,
        sale_price: editPrecio.value.sale,
        tax_ids:    editPrecio.value.taxes
      }
    });

    navigateTo('/admin/inventory/')
    toast.success('Se ha registrado exitosamente los nuevos datos del precio', { autoClose: 3000 });
  }catch (err){
    dialogoPrecio.value = true;
    toast.error('No se pudo editar el precio', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
  }
})
const onSubmitPhoto = async ()=>{
  const form = new FormData()
  console.log(artPhoto.value)
  form.append('photo', artPhoto.value);
  form.append('id', String(articule.value.id));

  utilsStore().setLoading(true)
  try{
    const uploadHoto = await $fetch(`/api/inventory/article/upload_photo`, {
      method: 'POST',
      body:form
    });

    navigateTo('/admin/inventory/')
    toast.success('Se ha registrado la foto exitosamente', { autoClose: 3000 });
  }catch (err){
    toast.error('No se pudo agregar la foto', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
  }
}
</script>

<style scoped>

</style>
