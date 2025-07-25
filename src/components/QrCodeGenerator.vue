<script setup lang="ts">
import QRCode from 'qrcode'
import { PriceService } from '../composables'

const props = defineProps<{
  amount: number
  address: string
  notes?: string
}>()

const qrCodeUrl = ref('')
const usdAmount = ref('$0.00')

// Generate QR code when amount, address, or notes change
watch(
  () => [props.amount, props.address, props.notes],
  async ([newAmount, newAddress, newNotes]) => {
    if (newAmount > 0 && newAddress) {
      const paymentData = {
        address: newAddress,
        amount: newAmount,
        notes: newNotes || '',
        timestamp: Date.now(),
      }

      try {
        qrCodeUrl.value = await QRCode.toDataURL(JSON.stringify(paymentData), {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })

        // Update USD amount
        const usdValue = await PriceService.convertPkoinToUSD(newAmount)
        usdAmount.value = PriceService.formatUSD(usdValue)
      }
      catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
    else {
      qrCodeUrl.value = ''
      usdAmount.value = '$0.00'
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="qr-code-container">
    <div v-if="qrCodeUrl" class="qr-code">
      <img :src="qrCodeUrl" alt="Payment QR Code">
      <div class="payment-details">
        <div class="amount">
          {{ amount }} PKOIN
        </div>
        <div class="usd-amount">
          ≈ {{ usdAmount }} USD
        </div>
      </div>
    </div>
    <div v-else class="no-qr-code">
      Please enter an amount and address to generate a QR code
    </div>
  </div>
</template>

<style scoped>
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg-secondary);
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-code img {
  max-width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.payment-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.amount {
  font-size: 1.25rem;
  font-weight: bold;
}

.usd-amount {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.no-qr-code {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
