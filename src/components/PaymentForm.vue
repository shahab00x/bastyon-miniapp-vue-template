<script setup lang="ts">
import { PriceService, SdkService } from '../composables'

const amount = ref(0)
const address = ref('')
const usdAmount = ref('$0.00')
const isLoading = ref(false)

// Update USD amount when PKOIN amount changes
watch(amount, async (newAmount) => {
  if (newAmount > 0) {
    isLoading.value = true
    try {
      const usdValue = await PriceService.convertPkoinToUSD(newAmount)
      usdAmount.value = PriceService.formatUSD(usdValue)
    }
    catch (error) {
      console.error('Error converting to USD:', error)
    }
    finally {
      isLoading.value = false
    }
  }
  else {
    usdAmount.value = '$0.00'
  }
}, { immediate: true })

// Get user's address on component mount
onMounted(async () => {
  try {
    // Request account permission
    await SdkService.checkAndRequestPermissions(['account'])

    // Get user's address
    const appInfo = await SdkService.getAppInfo()
    if (appInfo && appInfo.user && appInfo.user.address)
      address.value = appInfo.user.address
  }
  catch (error) {
    console.error('Error getting user address:', error)
  }
})
</script>

<template>
  <div class="payment-form">
    <div class="form-group">
      <label for="address">Your Address</label>
      <input
        id="address"
        v-model="address"
        type="text"
        placeholder="Enter your PKOIN address"
        class="form-input"
      >
    </div>

    <div class="form-group">
      <label for="amount">Amount (PKOIN)</label>
      <input
        id="amount"
        v-model.number="amount"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter amount"
        class="form-input"
      >
      <div class="usd-conversion">
        <span v-if="isLoading">Converting...</span>
        <span v-else>≈ {{ usdAmount }} USD</span>
      </div>
    </div>

    <QrCodeGenerator :amount="amount" :address="address" />
  </div>
</template>

<style scoped>
.payment-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

.usd-conversion {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: right;
}
</style>
