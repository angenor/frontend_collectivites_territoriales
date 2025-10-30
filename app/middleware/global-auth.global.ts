export default defineNuxtRouteMiddleware((to, from) =>{
    console.log('Navigating from globale', from.fullPath, ' to ', to.fullPath);
})