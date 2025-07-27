<script setup lang="ts">
import QRCode from 'qrcode'

interface Props {
  value: string
  width?: number
  height?: number
  cornerSquareOptions?: {
    type: string
    color: string
  }
  cornerDotOptions?: {
    type: string
    color: string
  }
  dotsOptions?: {
    type: string
    color: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  width: 256,
  height: 256,
  cornerSquareOptions: () => ({ type: 'square', color: '#000000' }),
  cornerDotOptions: () => ({ type: 'square', color: '#000000' }),
  dotsOptions: () => ({ type: 'square', color: '#000000' }),
})

const qrCodeRef = ref<HTMLCanvasElement>()
const qrDataURL = ref('')

async function generateQRCode() {
  try {
    if (qrCodeRef.value) {
      await QRCode.toCanvas(qrCodeRef.value, props.value, {
        width: props.width,
        height: props.height,
        margin: 2,
        color: {
          dark: props.dotsOptions.color,
          light: '#FFFFFF',
        },
      })
    }

    // Also generate data URL for fallback
    qrDataURL.value = await QRCode.toDataURL(props.value, {
      width: props.width,
      height: props.height,
      margin: 2,
      color: {
        dark: props.dotsOptions.color,
        light: '#FFFFFF',
      },
    })
  }
  catch (error) {
    console.error('Error generating QR code:', error)
  }
}

watch(() => props.value, generateQRCode, { immediate: true })
watch(() => props.width, generateQRCode)
watch(() => props.height, generateQRCode)

onMounted(() => {
  generateQRCode()
})
</script>

<template>
  <div class="qr-code-container">
    <canvas
      ref="qrCodeRef"
      :width="width"
      :height="height"
      class="qr-canvas"
    />
    <!-- Fallback image if canvas fails -->
    <img
      v-if="qrDataURL && !qrCodeRef"
      :src="qrDataURL"
      :width="width"
      :height="height"
      alt="QR Code"
      class="qr-image"
    >
  </div>
</template>

<style scoped>
.qr-code-container {
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
}

.qr-canvas,
.qr-image {
  display: block;
  border-radius: 8px;
}
</style>
