<template>
  <v-card flat tile>
    <v-card-title class="d-flex align-center pe-2">
      Inventario
      <v-spacer></v-spacer>
      <v-text-field
          v-model="search"
          density="compact"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          placeholder="buscar..."
          hide-details
          single-line
      ></v-text-field>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
        :headers="headers"
        :search="search"
        :items="Inventario"
        @click:row="goToArticle"
    >
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type {ArticleInterfaz} from "@/types/inventoryinterfaces";
import {useInventoryServices} from "@/services/useInventoryServices";
import {articleStore} from "@/store/articleStore";

const headers = [
  {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Nombre',
  },
  { key: 'sku', title: 'Sku' },
  { key: 'bar_code', title: 'Cod. Barra' },
  { key: 'model_code', title: 'Modelo' },
  { key: 'category.name', title: 'Categoria' },
  { key: 'brand.name', title: 'Marca' },
]
const Inventario = ref<ArticleInterfaz[]>([])
const search = ref('');

onMounted(async ()=>{
  Inventario.value = await useInventoryServices().getInventory();
  articleStore().setEditArticlePhoto(false);
})

const goToArticle = (event:any, data:{item:ArticleInterfaz})=>{
  articleStore().setArticlePhoto(data.item.photo);
  articleStore().setEditArticlePhoto(false);
  navigateTo('/admin/inventory/article/'+data.item.sku)
}
</script>

<style scoped>

</style>
