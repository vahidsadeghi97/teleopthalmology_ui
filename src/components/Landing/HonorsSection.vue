<template>
  <section id="honors" class="honors-section">
    <div class="container">
      <h2 class="section-title">Our Honors</h2>
      <div class="awards-navigation">
        <button 
          v-for="award in awards" 
          :key="award.id" 
          @click="selectAward(award)"
          :class="['award-button', { active: award.id === selectedAward.id }]"
        >
          <span class="award-number">{{ award.id }}</span>
        </button>
      </div>
      <div class="award-content">
        <div class="award-text">
          <p>{{ selectedAward.text }}</p>
        </div>
        <div class="award-image-container">
          <img 
            :src="selectedAward.image" 
            :alt="selectedAward.alt" 
            class="award-image"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HonorsSection',
  data() {
    return {
      awards: [
        { id: 1, text: 'MAPINA Award for IRAVO Meeting 2025 Second Rank', image: '/iravo.png', alt: 'IRAVO Honor Award' },
        { id: 2, text: 'Award-Winning Work in mHealth 2025', image: '/mhealth.png', alt: 'mHealth Honor Award' },
      ],
      selectedAward: { id: 1, text: 'MAPINA Award for IRAVO Meeting 2025 Second Rank', image: '/iravo.png', alt: 'IRAVO Honor Award' },
    };
  },
  methods: {
    selectAward(award) {
      this.selectedAward = award;
    },
  },
};
</script>

<style scoped>
.honors-section {
  padding: 6rem 0;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
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
  margin-bottom: 3rem;
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

.awards-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.award-button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.award-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: #cbd5e0;
}

.award-button.active {
  background: #42b983;
  color: white;
  box-shadow: 0 4px 6px rgba(66, 185, 131, 0.2);
}

.award-number {
  font-size: 1.25rem;
}

.award-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.award-text {
  text-align: center;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  max-width: 800px;
}

.award-image-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.award-image-container:hover {
  transform: scale(1.02);
}

.award-image {
  width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .awards-navigation {
    gap: 0.75rem;
  }

  .award-button {
    width: 3rem;
    height: 3rem;
  }

  .award-content {
    padding: 1.5rem;
  }

  .award-text {
    font-size: 1.1rem;
  }
}
</style>