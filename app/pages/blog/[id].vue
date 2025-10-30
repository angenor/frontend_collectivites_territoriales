<template>
    <div>
        <h1>Page blog spécifique</h1>
        <p>Dynamic route ID: {{ route.params.id }}</p>

        <button @click="goToContact" class=" bg-amber-300 p-3">Aller page contact</button>
    </div>
</template>

<script setup>
    const route = useRoute()
    const router = useRouter();

    console.log(route.params.id)
    function goToContact(){
        // router.back()
        router.push('/contact')
    }
</script>

<style lang="scss" scoped>

</style>