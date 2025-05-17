<template>
  <section class="publications-section">
    <div class="container">
      <h2 class="section-title">Publications</h2>
      <div class="publications-content">
        <div class="publication-controls">
          <button v-for="pub in publications" 
                  :key="pub.id" 
                  @click="selectPublication(pub)"
                  :class="['pub-btn', pub.id === selectedPublication.id ? 'active' : '']">
            {{ pub.id }}
          </button>
        </div>
        <div class="publication-display">
          <h3 class="pub-title">{{ selectedPublication.text }}</h3>
          <div class="pub-images">
            <div class="pub-image-container">
              <img :src="selectedPublication.image" :alt="selectedPublication.alt" class="w-full h-auto max-w-md mx-auto">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PublicationsSection',
  data() {
    return {
      publications: [
        { id: 'DR', text: 'Diabetic Retinopathy (DR)', image: '/dr abstract.png', alt: 'DR Abstract' },
        { id: 'ROP', text: 'Retinopathy of Prematurity (ROP)', image: '/rop abstract.png', alt: 'ROP Abstract' },
        { id: 'AMD', text: 'Age-Related Macular Degeneration (AMD)', image: '/amd abstract.png', alt: 'AMD Abstract' },
      ],
      selectedPublication: { id: 'DR', text: 'Diabetic Retinopathy (DR)', image: '/dr abstract.png', alt: 'DR Abstract' },
    };
  },
  methods: {
    selectPublication(pub) {
      this.selectedPublication = pub;
    },
  },
};
</script>

<style scoped>
.publications-section {
  padding: 6rem 0;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 4rem;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: #42b983;
  margin: 1rem auto;
  border-radius: 2px;
}

.publications-content {
  max-width: 1200px;
  margin: 0 auto;
}

.publication-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pub-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #42b983;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pub-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pub-btn.active {
  background: #2c3e50;
}

.publication-display {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.pub-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
}

.pub-images {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.pub-image-container {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  max-width: 600px;
  width: 100%;
}

.pub-image-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.pub-image-container img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .publications-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .publication-display {
    padding: 1.5rem;
  }

  .pub-image-container {
    max-width: 100%;
  }
}
</style>