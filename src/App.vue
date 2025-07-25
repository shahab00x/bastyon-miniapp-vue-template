<script setup lang="ts">
// App root component
</script>

<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <RouterView />
    <TheFooter />
  </main>
</template>

<style>
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
}

.dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #f0f0f0;
  --text-secondary: #a0a0a0;
  --border-color: #444444;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: #1890ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #40a9ff;
}

.btn:disabled {
  background-color: #d9d9d9;
  color: #999999;
  cursor: not-allowed;
}
</style>
