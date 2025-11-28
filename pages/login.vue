<template>
  <v-container style="height: 100vh"
      fluid
      class="d-flex align-center justify-center min-h-screen bg-grey-lighten-4"
  >
    <v-card v-if="vista === 'login'"
        class="login-card"
        elevation="12"
        width="480"
        height="570"
    >
      <!-- Panel azul -->
      <v-sheet class="login-hero pa-8">
        <div class="d-flex flex-column align-center mb-8">
          <!-- Logo -->
          <v-img
              src="/logo.png"
              width="200"
              height="200"
              alt="Logo JP"
              class="rounded"
          />
        </div>

        <div class="text-h5 mb-6 font-weight-bold text-center">SYS-JP LOGIN</div>

        <v-form @submit.prevent="submit">
          <v-text-field
              v-model="email"
              label="Email"
              variant="underlined"
              prepend-inner-icon="mdi-email-outline"
              color="white"
              base-color="white"
              hide-details="auto"
              class="mb-4"
          />

          <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              variant="underlined"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
              color="white"
              base-color="white"
              hide-details="auto"
          />
          <br>
          <div class="d-flex justify-end mt-2 mb-6">
            <v-btn variant="text" size="small" @click="cambiarVista('pin')" class="text-white text-opacity-80">
              Cambiar a Pin
            </v-btn>
          </div>

          <v-btn
              type="submit"
              variant="outlined"
              block
              class="text-white"
          >
            INGRESAR
          </v-btn>
        </v-form>
      </v-sheet>
    </v-card>

    <v-card v-else-if="vista === 'pin'"
        class="login-card"
        elevation="12"
        width="480"
        height="820"
    >
      <!-- Panel azul -->
      <v-sheet class="login-hero pa-8">
        <div class="d-flex flex-column align-center mb-8">
          <!-- Logo -->
          <v-img
              src="/logo.png"
              width="250"
              height="250"
              alt="Logo JP"
              class="rounded"
          />
        </div>

        <div class="text-h5 mb-6 font-weight-bold text-center">SYS-JP PIN</div>

        <v-row dense>
          <v-col
              v-for="n in numPin"
              :key="n"
              cols="4"
              class="d-flex justify-center"
          >
            <v-btn
                @click="verificarPin(n)"
                class="num-btn"
                elevation="4"
                height="100px"
                width="100px"
                :disabled="n.length ===0 "
            >
              {{ n }}
            </v-btn>
          </v-col>
        </v-row>
        <br>
        <div class="d-flex justify-end mt-2 mb-6">
          <v-btn variant="text" size="small" @click="cambiarVista('login')" class="text-white text-opacity-80">
            CAMBIAR A LOGIN
          </v-btn>
        </div>
      </v-sheet>
    </v-card>


    <v-overlay v-model="authStore().loading" class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {authStore} from "@/store/authStore";

definePageMeta({
  layout: 'layout_login'
})
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const vista = ref('pin');
const numPin = ref(['1','2','3','4','5','6','7','8','9','','0','']);

const rules = {
  required: (v) => (!!v && v.length > 0) || 'Requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido'
}
const pin = ref('')
const submit = async () => {
  loading.value = true
  try {
    // TODO: llama a tu API de login
    await new Promise(r => setTimeout(r, 800))
    // navigateTo('/dashboard')
  } finally {
    loading.value = false
  }
}

const cambiarVista = (Vista:string) => {
  vista.value = Vista
}

const verificarPin = async (val:string) =>{
  if (val.length > 0){
    pin.value += val

    if (pin.value.length === 4) {
      const user = await authStore().loginPin(pin.value)
      pin.value = '';
    }
  }
}
// const save = async ()=>{
//   try {
//     await $fetch('/api/users/save',{
//       method: 'post',
//       body:{
//         username: 'willySantos',
//         password: '1234',
//         employee_id: 1,
//         is_admin: true
//       }
//     })
//
//     alert("si")
//   } catch (err: any){
//     alert("error")
//   } finally {
//     alert("sisi")
//   }
// }
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh; /* altura completa */
}

.login-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.login-hero {
  position: relative;
  background: #000000;
  color: white;
  height:100%; /* panel más alto */
}

/* Corte diagonal más abajo */
.login-hero::after {
  //content: "";
  //position: absolute;
  //left: 0;
  //bottom: 0;
  //width: 100%;
  //height: 30%; /* más bajo */
  //background: white;
  //clip-path: polygon(0 65%, 100% 100%, 0 100%);
}

.login-hero > * {
  position: relative;
  z-index: 1;
}

.fab {
  position: absolute;
  right: 20px;
  bottom: 20px;
  border-radius: 50%;
}
</style>
