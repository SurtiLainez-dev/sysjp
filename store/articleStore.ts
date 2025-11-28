// @ts-ignore
import {defineStore} from "pinia";

export const articleStore = defineStore('article_store', ()=>{
    const articlePhoto = ref<null | string>(null);
    const editArticlePhoto = ref(false);
    const setArticlePhoto = (val: string) => {
        articlePhoto.value = val
    }
    const setEditArticlePhoto = (val:boolean)=>{
        editArticlePhoto.value = val;
    }
    return{
        articlePhoto,
        editArticlePhoto,
        setArticlePhoto,
        setEditArticlePhoto
    }
})
