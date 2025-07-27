<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { walletService } from '../composables/walletService'

const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
})
const recipientAddress = ref('')
const amount = ref(0)
const description = ref('')
const isSending = ref(false)
const error = ref('')
const success = ref(false)
const transactionId = ref('')

const showQRScanner = ref(false)
const videoRef = ref<HTMLVideoElement>()

const canSend = computed(() => {
  return recipientAddress.value
    && amount.value > 0
    && amount.value <= props.balance
    && !isSending.value
})

async function sendPayment() {
  if (!canSend.value)
    return

  try {
    isSending.value = true
    error.value = ''
    success.value = false

    const txId = await walletService.sendTransaction({
      toAddress: recipientAddress.value,
      amount: amount.value,
      description: description.value || 'QR Payment',
    })

    transactionId.value = txId
    success.value = true

    // Reset form
    recipientAddress.value = ''
    amount.value = 0
    description.value = ''
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send payment'
  }
  finally {
    isSending.value = false
  }
}

function scanQR() {
  showQRScanner.value = true
  // In a real implementation, you would initialize the camera here
  // For this example, we'll simulate QR detection
  setTimeout(() => {
    // Mock QR code detection
    const mockPaymentData = {
      address: 'mock_wallet_address_for_testing',
      amount: 10.5,
      currency: 'PKOIN',
    }
    onQRDetected(JSON.stringify(mockPaymentData))
  }, 2000)
}

function closeQRScanner() {
  showQRScanner.value = false
}

function onQRDetected(data: string) {
  const paymentRequest = walletService.parsePaymentData(data)
  if (paymentRequest) {
    recipientAddress.value = paymentRequest.toAddress
    amount.value = paymentRequest.amount
    description.value = paymentRequest.description || ''
    closeQRScanner()
  }
  else {
    error.value = 'Invalid QR code data'
  }
}

onUnmounted(() => {
  closeQRScanner()
})
</script>

<template>
  <div class="send-payment">
    <div class="mb-6 text-center">
      <h3 class="mb-2 text-xl font-bold">
        Send Payment
      </h3>
      <p class="text-sm text-gray-600">
        Available Balance: <span class="font-bold">{{ balance }} PKOIN</span>
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="sendPayment">
      <div>
        <label class="mb-2 block text-sm font-medium">Recipient Address</label>
        <input
          v-model="recipientAddress"
          type="text"
          placeholder="Enter wallet address or scan QR"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium">Amount (PKOIN)</label>
        <input
          v-model.number="amount"
          type="number"
          step="0.001"
          min="0.001"
          :max="balance"
          placeholder="0.000"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium">Description (Optional)</label>
        <input
          v-model="description"
          type="text"
          placeholder="Payment description"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="flex space-x-2">
        <button
          type="button"
          class="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          @click="scanQR"
        >
          📷 Scan QR
        </button>
        <button
          type="submit"
          :disabled="!canSend || isSending"
          class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300 hover:bg-blue-600"
        >
          {{ isSending ? 'Sending...' : 'Send Payment' }}
        </button>
      </div>

      <div v-if="error" class="text-center text-sm text-red-500">
        {{ error }}
      </div>

      <div v-if="success" class="text-center text-sm text-green-500">
        Payment sent successfully! Transaction ID: {{ transactionId }}
      </div>
    </form>

    <!-- QR Scanner Modal -->
    <div v-if="showQRScanner" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="mx-4 max-w-md w-full rounded-lg bg-white p-4">
        <h4 class="mb-4 text-lg font-bold">
          Scan QR Code
        </h4>
        <div class="qr-scanner">
          <video
            ref="videoRef"
            class="h-64 w-full rounded bg-black"
            autoplay
            playsinline
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-48 w-48 border-2 border-white border-dashed" />
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <button
            class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            @click="closeQRScanner"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-scanner {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-scanner video {
  max-width: 100%;
  max-height: 300px;
}
</style>
