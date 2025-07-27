<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'

interface Props {
  address: string
  amount?: number
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  amount: 0,
  title: 'Receive Payment',
  description: 'Scan this QR code to send payment',
})

const emit = defineEmits(['copied'])
const qrCanvas = ref<HTMLCanvasElement>()
const truncatedAddress = computed(() => {
  if (!props.address)
    return ''
  return `${props.address.slice(0, 6)}...${props.address.slice(-4)}`
})

async function generateQR() {
  if (!props.address || !qrCanvas.value)
    return

  const paymentData = {
    address: props.address,
    amount: props.amount,
    currency: 'PKOIN',
  }

  try {
    await QRCode.toCanvas(qrCanvas.value, JSON.stringify(paymentData), {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  }
  catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(props.address)
    emit('copied', 'address')
  }
  catch (error) {
    console.error('Failed to copy address:', error)
  }
}

async function copyPaymentData() {
  try {
    const paymentData = {
      address: props.address,
      amount: props.amount,
      currency: 'PKOIN',
    }
    await navigator.clipboard.writeText(JSON.stringify(paymentData))
    emit('copied', 'payment data')
  }
  catch (error) {
    console.error('Failed to copy payment data:', error)
  }
}

onMounted(() => {
  if (props.address)
    setTimeout(generateQR, 100)
})

watch(() => [props.address, props.amount], () => {
  if (props.address)
    setTimeout(generateQR, 100)
})
</script>

<template>
  <div class="qr-display">
    <div v-if="!address" class="py-8 text-center">
      <div class="mb-4 text-red-500">
        Wallet not initialized
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="text-center">
        <h3 class="mb-2 text-lg font-semibold">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ description }}
        </p>
      </div>

      <div class="qr-container flex justify-center">
        <div class="rounded-lg bg-white p-4 shadow-lg">
          <canvas ref="qrCanvas" class="h-auto max-w-full" />
        </div>
      </div>

      <div class="text-center">
        <div class="rounded bg-gray-100 p-2 text-sm font-mono">
          {{ truncatedAddress }}
        </div>
        <div v-if="amount > 0" class="mt-2 text-lg text-green-600 font-bold">
          {{ amount }} PKOIN
        </div>
      </div>

      <div class="flex justify-center space-x-2">
        <button
          class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          @click="copyAddress"
        >
          Copy Address
        </button>
        <button
          class="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
          @click="copyPaymentData"
        >
          Copy Payment Data
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-display {
  max-width: 100%;
}
</style>
