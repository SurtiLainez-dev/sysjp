<template>
  <v-responsive class="border rounded">
    <v-app>
      <v-navigation-drawer
          expand-on-hover
          permanent
          rail
          v-model="utilsStore().drawer"
      >
        <v-list>
          <v-list-item
              value="/"
              @click="goUrl('/')"
              prepend-avatar="/logo.png"
              :title="authStore().Username"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-group value="Operativo" v-if="authStore().Is_admin">
            <template v-slot:activator="{ props }">
              <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-cog"
                  title="Operativo"
              ></v-list-item>
            </template>

            <v-list-group density="compact" value="Oficinas">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Oficinas"></v-list-item>
              </template>
              <v-list-item density="compact" value="crear" @click="goUrl('/admin/oficinas/nueva')"    title="Crear"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/oficinas/')" value="Oficinas"  title="Oficinas"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="Colaboradores">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Colaboradores"></v-list-item>
              </template>
              <v-list-item density="compact" value="crear" @click="goUrl('/admin/employees/nuevo')"    title="Crear"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/employees/')" value="Colaboradores"  title="Colaboradores"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="users">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Usuarios"></v-list-item>
              </template>
              <v-list-item density="compact" value="crearuser" @click="goUrl('/admin/users/')"    title="Usuarios"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="proveedors">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Proveedores"></v-list-item>
              </template>
              <v-list-item density="compact" value="nuevoproveedor" @click="goUrl('/admin/suppliers/new')"    title="Nuevo"></v-list-item>
              <v-list-item density="compact" value="proveedores" @click="goUrl('/admin/suppliers/')"    title="Proveedores"></v-list-item>
              <v-list-item density="compact" value="marcas" @click="goUrl('/admin/suppliers/brans')"    title="Marcas"></v-list-item>
            </v-list-group>
          </v-list-group>

          <v-list-group value="Contabilidad" v-if="authStore().Is_admin">
            <template v-slot:activator="{ props }">
              <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-bank"
                  title="Contabilidad"
              ></v-list-item>
            </template>
            <v-list-group density="compact" value="CC">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="CC"></v-list-item>
              </template>
              <v-list-item density="compact" value="cuentas" @click="goUrl('/admin/contabilidad/accounts')"    title="Cuentas"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/contabilidad/registers')"  value="libro_diario"  title="Libro Dirario"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/contabilidad/libro_mayor')"  value="libro_mayor"  title="Libro Mayor"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="Bancos">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Bancos"></v-list-item>
              </template>
              <v-list-item density="compact" value="bancos" @click="goUrl('/admin/contabilidad/banks')"    title="Bancos"></v-list-item>
              <v-list-item density="compact" value="nueva_cuenta" @click="goUrl('/admin/contabilidad/new_bank_account')"    title="Nueva Cuenta"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/contabilidad/bank_accounts')"  value="cuentas"  title="Cuentas"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="Planillas">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Planillas"></v-list-item>
              </template>
              <v-list-item density="compact" value="nueva_planilla" @click="goUrl('/admin/contabilidad/payrolls/new_payroll')"    title="Nueva"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/contabilidad/payrolls/')"  value="planillas"  title="Planillas"></v-list-item>
            </v-list-group>
            <v-list-group density="compact" value="Impuestos">
              <template v-slot:activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="Impuestos"></v-list-item>
              </template>
              <v-list-item density="compact" value="nuevo_impuestos" @click="goUrl('/admin/contabilidad/taxes/new_tax')"    title="Nuevo"></v-list-item>
              <v-list-item density="compact" @click="goUrl('/admin/contabilidad/taxes/')"  value="impuestoss"  title="Impuestos"></v-list-item>
            </v-list-group>
            <v-list-item density="compact" @click="goUrl('/admin/contabilidad/payment_methods')"
                         value="contabilidad-forma-pagos"  title="Formas de Pago"></v-list-item>
            <v-list-item density="compact" @click="goUrl('/admin/contabilidad/cashiers')"
                         value="contabilidad-forma-pagos"  title="Cajas"></v-list-item>
          </v-list-group>
          <v-list-group value="Inventory" v-if="authStore().Is_admin">
            <template v-slot:activator="{ props }">
              <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-apps-box"
                  title="Inventario"
              ></v-list-item>
            </template>
            <v-list-item density="compact" @click="goUrl('/admin/inventory/new_article')"  value="inventory-new-articulo"  title="Crear un Articulo"></v-list-item>
            <v-list-item density="compact" @click="goUrl('/admin/inventory/')"  value="inventory"  title="Inventario"></v-list-item>
            <v-list-item density="compact" @click="goUrl('/admin/inventory/entry_orders/')"  value="inventory_entry_orders"  title="Ordenes de Entrada"></v-list-item>
            <v-list-item density="compact" @click="goUrl('/admin/inventory/entry_orders/new')"  value="inventory_entry_orders_new"  title="Crear Orden de Entrada"></v-list-item>
          </v-list-group>

          <v-list-item density="compact" @click="goUrl('/work_orders/new')"
                       prepend-icon="mdi-file-document"
                       value="work-orden-new"  title="Nueva Orden de Trabajo"></v-list-item>
          <v-list-item density="compact" @click="goUrl('/work_orders/open')"
                       prepend-icon="mdi-folder-open"
                       value="work-orden-open"  title="Ord. de Trabajo (open)"></v-list-item>
          <v-list-item density="compact" @click="goUrl('/work_orders/close')"
                       prepend-icon="mdi-folder"
                       value="work-order-check"  title="Ord. de Trabajo (Closed)"></v-list-item>

          <v-list-item density="compact" @click="goUrl('/work_orders/customers/')"
                       prepend-icon="mdi-account-group"
                       value="work-order-custumers"  title="Ord. Trabajo (clientes)"></v-list-item>

          <v-list-item density="compact" @click="goUrl('/cashier')"
                       prepend-icon="mdi-cash-register"
                       value="cashier"  title="Caja"></v-list-item>

        </v-list>
      </v-navigation-drawer>

      <v-app-bar color="primary">
        <v-toolbar-title>Sys - JP</v-toolbar-title>

        <v-btn icon="mdi-logout" @click="logout" variant="text"></v-btn>
      </v-app-bar>

      <v-main >
        <v-container >
          <slot />

          <v-overlay v-model="utilsStore().loading" class="align-center justify-center">
            <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
          </v-overlay>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<script lang="ts" setup>
import {utilsStore} from "@/store/utilsStore";
import {authStore} from "@/store/authStore";
import {toast} from "vue3-toastify";


const logout = async () => {
  utilsStore().setLoading(true);
  try{
    await $fetch('/api/auth/logout',{method: 'post'});
    toast.success("Se ha cerrado sesión correctamente", { autoClose: 3000 })
  }catch (err:any){
    toast.error("Error", { autoClose: 3000 })
  }finally {
    await navigateTo('/login');
    utilsStore().setLoading(false);
  }
}

const goUrl = (go) => {
  navigateTo(go)
}
</script>

<style scoped>

</style>
