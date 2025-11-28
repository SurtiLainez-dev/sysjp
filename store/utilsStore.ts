import {defineStore} from "pinia";

export const utilsStore = defineStore('util_store', ()=>{
    const loading = ref(false);

    const setLoading = (val: boolean) => {
      loading.value = val
    }
    return{
        loading,
        setLoading
    }
})
