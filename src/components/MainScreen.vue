<script setup lang="ts">
import Conversation from './Conversation.vue';

let id = 0
const emails = [
    [id++, "Cerium", "Software Engineer"],
    [id++, "MidnightSky", "Software Engineer"]
] as [number, string, string][]
</script>

<template>
    <div v-for="email in emails" :key="email[0]">
        <Conversation :author="email[1]" :subject="email[2]"/>
    </div>
</template>
