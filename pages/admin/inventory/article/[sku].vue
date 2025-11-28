<template>
  <v-card flat tile>
    <div v-if="pending">Loading article...</div>
    <div v-else-if="error">Error loading article</div>
    <div v-else>
      <v-container width="60vw" fluid>
<!--        <v-card-title class="d-flex align-center pe-2">-->
<!--          <v-btn color="secondary" icon tile @click="navigateTo('/admin/inventory/')"><v-icon>mdi-arrow-left</v-icon></v-btn>-->
<!--          <v-spacer></v-spacer>-->
<!--          {{article.name}}-->
<!--          <br>-->
<!--          <v-card-subtitle>{{article.sku}}</v-card-subtitle>-->
<!--        </v-card-title>-->
        <ArticleCard
            :title="article.name"
            :is_service="article.category.is_service"
            :subtitle="article.description"
            :category="article.category.name"
            :brand="article.brand.name"
            :articule="article"
            @updated="refresh()"
            @photo-selected="handlePhoto"
        />
      </v-container>
    </div>
  </v-card>
</template>

<script lang="ts" setup>

import ArticleCard from "@/components/views/ArticleCard.vue";
import {articleStore} from "@/store/articleStore";
const route = useRoute();
const articleId = route.params.sku

const { data, pending, error } = await useAsyncData('article', () =>
    $fetch(`/api/inventory/article/${articleId}`)
)
const article = computed(() => data?.value?.data ?? null)
const articlePhoto = computed({
  get:() => articleStore().articlePhoto,
  set:(val) => {articleStore().setArticlePhoto(val)}
})
const handlePhoto = ({ file, preview }: { file: File, preview: string | ArrayBuffer | null }) => {
  articlePhoto.value = preview as string
  articleStore().setEditArticlePhoto(true);
}
</script>

<style scoped>

</style>
