<template>
    <div>
        <h1 class="bg-red-500 text-5xl font-bold">Page home</h1>
        <h2 class="animate__animated animate__zoomInDown">Je suis un titre h2</h2>

    </div>
</template>

<script setup>
    // useHead({
    //     link:[
    //         { 
    //             rel: "stylesheet",
    //             href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    //         }     
    //     ]
    // })

    definePageMeta({
        middleware: 'log'
    })
</script>

<style lang="scss" scoped>

</style>