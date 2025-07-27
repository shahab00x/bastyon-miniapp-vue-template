<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Verse {
  verse: number
  text: string
}

interface Chapter {
  chapter: number
  verses: Verse[]
}

interface Book {
  name: string
  abbreviation: string
  chapters: Chapter[]
}

interface BibleData {
  metadata: {
    version: string
    language: string
    totalBooks: number
    totalChapters: number
    totalVerses: number
  }
  books: Book[]
}

defineOptions({
  name: 'BibleApp',
})

const bibleData = ref<BibleData | null>(null)
const selectedBook = ref<Book | null>(null)
const selectedChapter = ref<Chapter | null>(null)
const selectedVerse = ref<Verse | null>(null)
const isLoading = ref(true)
const searchQuery = ref('')
const currentView = ref<'books' | 'chapter' | 'verse'>('books')

// Load Bible data from JSON
onMounted(async () => {
  try {
    const response = await fetch('/bible.json')
    bibleData.value = await response.json()
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load Bible data:', error)
    isLoading.value = false
  }
})

// Filter books based on search query
const filteredBooks = computed(() => {
  if (!bibleData.value || !searchQuery.value) return bibleData.value?.books || []
  
  const query = searchQuery.value.toLowerCase()
  return bibleData.value.books.filter(book => 
    book.name.toLowerCase().includes(query) || 
    book.abbreviation.toLowerCase().includes(query)
  )
})

// Navigation functions
const selectBook = (book: Book) => {
  selectedBook.value = book
  selectedChapter.value = null
  selectedVerse.value = null
  currentView.value = 'chapter'
}

const selectChapter = (chapter: Chapter) => {
  selectedChapter.value = chapter
  selectedVerse.value = null
  currentView.value = 'verse'
}

const goBack = () => {
  if (currentView.value === 'verse') {
    currentView.value = 'chapter'
    selectedVerse.value = null
  } else if (currentView.value === 'chapter') {
    currentView.value = 'books'
    selectedChapter.value = null
    selectedBook.value = null
  }
}

const shareVerse = (book: Book, chapter: Chapter, verse: Verse) => {
  const text = `${book.name} ${chapter.chapter}:${verse.verse} - ${verse.text}`
  
  // Use Web Share API if available
  if (navigator.share) {
    navigator.share({
      title: 'Bible Verse',
      text: text,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text)
    alert('Verse copied to clipboard!')
  }
}
</script>

<template>
  <div class="bible-app">
    <!-- Header -->
    <header class="bible-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="icon">📖</span>
          Holy Bible
        </h1>
        <p class="app-subtitle">King James Version</p>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="breadcrumb-nav" v-if="currentView !== 'books'">
      <button @click="goBack" class="back-btn">
        ← Back
      </button>
      <span class="breadcrumb">
        {{ selectedBook?.name }}
        <span v-if="selectedChapter"> - Chapter {{ selectedChapter.chapter }}</span>
      </span>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading Bible...</p>
    </div>

    <!-- Books View -->
    <div v-else-if="currentView === 'books'" class="books-view">
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search books..."
          class="search-input"
        />
      </div>
      
      <div class="books-grid">
        <div 
          v-for="book in filteredBooks" 
          :key="book.name"
          class="book-card"
          @click="selectBook(book)"
        >
          <h3 class="book-name">{{ book.name }}</h3>
          <p class="book-abbr">{{ book.abbreviation }}</p>
          <p class="book-chapters">{{ book.chapters.length }} chapters</p>
        </div>
      </div>
    </div>

    <!-- Chapter View -->
    <div v-else-if="currentView === 'chapter' && selectedBook" class="chapter-view">
      <div class="chapters-grid">
        <div 
          v-for="chapter in selectedBook.chapters" 
          :key="chapter.chapter"
          class="chapter-card"
          @click="selectChapter(chapter)"
        >
          <h3 class="chapter-number">Chapter {{ chapter.chapter }}</h3>
          <p class="chapter-verses">{{ chapter.verses.length }} verses</p>
        </div>
      </div>
    </div>

    <!-- Verse View -->
    <div v-else-if="currentView === 'verse' && selectedChapter" class="verse-view">
      <div class="verses-list">
        <div 
          v-for="verse in selectedChapter.verses" 
          :key="verse.verse"
          class="verse-card"
        >
          <div class="verse-content">
            <span class="verse-number">{{ verse.verse }}</span>
            <p class="verse-text">{{ verse.text }}</p>
            <button 
              @click="shareVerse(selectedBook!, selectedChapter!, verse)"
              class="share-btn"
              title="Share verse"
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
      <p>📖 Holy Bible App - Offline Access</p>
      <p class="footer-note">Powered by Bastyon Mini-App Template</p>
    </footer>
  </div>
</template>

<style scoped>
.bible-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bible-header {
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem 1rem;
  text-align: center;
}

.app-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}

.app-subtitle {
  opacity: 0.8;
  margin: 0.5rem 0 0 0;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.breadcrumb {
  font-weight: 500;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-section {
  padding: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.books-grid, .chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.book-card, .chapter-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

.book-card:hover, .chapter-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.book-name, .chapter-number {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.book-abbr, .book-chapters, .chapter-verses {
  opacity: 0.8;
  margin: 0;
}

.verse-view {
  padding: 1rem;
}

.verses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verse-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
}

.verse-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.verse-number {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.verse-text {
  flex: 1;
  margin: 0;
  line-height: 1.6;
}

.share-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.share-btn:hover {
  opacity: 1;
}

.app-footer {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  margin-top: auto;
}

.footer-note {
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .books-grid, .chapters-grid {
    grid-template-columns: 1fr;
  }
  
  .verse-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
