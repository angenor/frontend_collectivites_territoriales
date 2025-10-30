<template>
    <div>
        <h1>Page dashboard</h1>
    </div>
</template>

<script>
definePageMeta({
    middleware: () => {
        console.log('Middleware inline exécuté')
    }
})
</script>

<style lang="scss" scoped>

</style>