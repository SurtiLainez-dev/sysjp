<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Creando un Articulo Nuevo
      <v-spacer></v-spacer>
      <v-btn size="xs" color="secondary" icon tile @click="dialogoNewCategory = true"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>
    <v-form ref="FormNewArticle" class="pa-2" @submit.prevent="onSubmitNewArticle">
      <v-row class="mt-3">
        <v-col cols="12" md="4">
          <v-autocomplete
              v-model="article.category_id"
              :items="Categories"
              :item-value="'id'"
              :item-title="'name'"
              label="Seleccionar una Categoria *"
              :rules="[val.req()]"
              variant="outlined"
              autocomplete="off"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-autocomplete
              v-model="article.brand_id"
              :items="Brands"
              :item-value="'id'"
              :item-title="'name'"
              autocomplete="off"
              label="Seleccionar una Marca *"
              :rules="[val.req()]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
              label="Nombre del Articulo"
              counter="50"
              v-model="article.name"
              autocomplete="off"
              :rules="[val.req(), val.minLen(5), val.max(50)]"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
              label="Descripción *"
              v-model="article.description"
              counter="12"
              :rules="[val.max(100)]"
              autocomplete="off"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
              label="Modelo"
              v-model="article.model"
              counter="20"
              :rules="[val.max(20)]"
              variant="outlined"
              autocomplete="off"
              density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              label="Codigo de Barra"
              v-model="article.bar_code"
              counter="20"
              :rules="[val.max(100)]"
              autocomplete="off"
              variant="outlined"
              density="comfortable"
          />
        </v-col>
        <v-checkbox
            hint="Dejarlo marcado al menos que sea un servicio como por ejemelo corte de cabello, etc..."
            persistent-hint
            v-model="article.is_cc"
            label="¿Afecta el Catalogo Contable?"/>
      </v-row>

      <div class="d-flex ga-2 justify-end mt-2">
        <v-btn color="primary" type="submit" tile>
          Registrar Articulo
        </v-btn>
      </div>
    </v-form>


    <v-dialog v-model="dialogoNewCategory" max-width="600">
      <v-card v-if="dialogoNewCategory" class="pa-3">
        <v-card-title class="d-flex align-center pe-2">
          Creando una Categoria
          <v-spacer></v-spacer>
          <v-btn rounded size="xs" color="red" @click="dialogoNewCategory = false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="FormNewCategory" @submit.prevent="onSubmitNewCategory">
          <v-row class="mt-3">
            <v-col cols="12" md="12">
              <v-text-field
                  v-model="category.name"
                  label="Nombre de la Categoria"
                  :rules="[val.req(), val.max(20)]"
                  counter="20"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="12">
              <v-textarea
                  v-model="category.description"
                  label="Descripción de la Categoria"
                  :rules="[val.req(), val.max(100)]"
                  counter="100"
                  variant="outlined"
                  density="comfortable"
              />
            </v-col>
          </v-row>
          <v-checkbox v-model="category.is_service" label="¿Es un servicio?"></v-checkbox>
          <div class="d-flex ga-2 justify-end mt-2">
            <v-btn color="primary" type="submit" tile>
              Guardar Categoria
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import {useInventoryServices} from "@/services/useInventoryServices";
import {useValidators} from "@/composables/useValidators";
import {toast} from "vue3-toastify";
import {utilsStore} from "@/store/utilsStore";
import type {CategoryInterfaz} from "@/types/inventoryinterfaces";
import type {BrandsInterfaz} from "@/types/supplierInterfaz";
import {useSupplierServices} from "@/services/useSupplierServices";

const category           = ref({
  name: '',
  description: '',
  is_service: false,
})
const article            = ref({
  category_id: null,
  brand_id:    null,
  name:        '',
  description: '',
  model: '',
  bar_code: '',
  is_cc: true
})
const dialogoNewCategory = ref(false)
const FormNewCategory    = ref(null);
const FormNewArticle     = ref(null);
const val                = useValidators();
const Categories         = ref<CategoryInterfaz[]>([]);
const Brands             = ref<BrandsInterfaz[]>([])

onMounted(async ()=>{
  Brands.value     = await useSupplierServices().getBrands();
  Categories.value = await useInventoryServices().getCategories();
})

const onSubmitNewArticle = async ()=>{
  const result = await FormNewArticle.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  utilsStore().setLoading(true)
  try{
    const Art = await $fetch(`/api/inventory/article`, {
      method: 'POST',
      body:{
        name:        article.value.name,
        description: article.value.description,
        brand_id:    article.value.brand_id,
        category_id: article.value.category_id,
        model:       article.value.model,
        bar_code:    article.value.bar_code,
        is_cc:       article.value.is_cc
      }
    });

    toast.success('Se ha registrado exitosamente el articulo', { autoClose: 3000 });
    navigateTo('/admin/inventory/')
  }catch (err){
    toast.error('No se pudo crear el articulo', { autoClose: 3000 })
  }finally {
    utilsStore().setLoading(false);
  }
}
const onSubmitNewCategory = async ()=>{
  const result = await FormNewCategory.value?.validate()
  if (!result?.valid) {
    toast.error('Revisa los campos del formulario', { autoClose: 3000 })
    return
  }
  dialogoNewCategory.value = false
  utilsStore().setLoading(true)
  try{
    const Payroll = await $fetch(`/api/inventory/category/save`, {
      method: 'POST',
      body:{
        name:        category.value.name,
        description: category.value.description,
        is_service:  category.value.is_service
      }
    });

    category.value.name        = '';
    category.value.description = '';
    category.value.is_service  = false;
    toast.success('Se ha registrado exitosamente la categoria', { autoClose: 3000 });
    Categories.value = useInventoryServices().getCategories();
  }catch (err){
    toast.error('No se pudo crear la categoria', { autoClose: 3000 })
    dialogoNewCategory.value = true;
  }finally {
    utilsStore().setLoading(false);
  }
}
</script>

<style scoped>

</style>
