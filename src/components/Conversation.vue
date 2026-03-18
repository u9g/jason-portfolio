<script setup lang="ts">

const props = defineProps({
    author: String,
    subject: String
})

</script>

<template>
    {{ author }} => {{ subject }}
</template>
