<template>
  <section class="solution-section">
    <div class="container">
      <h2 class="section-title">Our Comprehensive Grading Services</h2>
      <p class="section-description">RETINEX tele-ophtalmology is a comprehensive image reading center that specializes in reliable, timely, reproducible and systematic analysis of images. We provide customised grading services for your clinical trials. Our fellowship-trained retinologists, certified graders, and developed AI-based models provide grading services for various eye images including:</p>
      <div class="techniques-grid">
        <div v-for="technique in imagingTechniques" :key="technique.abbr" class="technique-card">
          <div class="image-container">
            <img :src="technique.image" :alt="technique.name + ' Image'" class="technique-image">
          </div>
          <p class="technique-name">{{ technique.name }} ({{ technique.abbr }})</p>
        </div>
      </div>
      <p class="section-footer">We employ the use of a 24-hour secure server and computers of high caliber and precision.</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SolutionSection',
  data() {
    return {
      imagingTechniques: [
        { name: 'Color Fundus Photography', abbr: 'CFP', image: '/CFP.png' },
        { name: 'Fundus Auto Fluorescence', abbr: 'FAF', image: '/FAF.png' },
        { name: 'Quantitative Autofluorescence', abbr: 'QAF', image: '/QAF.png' },
        { name: 'Fluorescein Angiography', abbr: 'FA', image: '/FA.png' },
        { name: 'Indocyanine Green Angiography', abbr: 'ICGA', image: '/ICGA.png' },
        { name: 'Optical Coherence Tomography', abbr: 'OCT', image: '/OCT.png' },
        { name: 'Fundus controlled Microperimetry', abbr: 'MP', image: '/MP.png' }
      ]
    };
  }
};
</script>

<style scoped>
.solution-section {
  padding: 4rem 0;
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
  margin-bottom: 2rem;
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

.section-description {
  text-align: center;
  font-size: 1.25rem;
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.technique-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.technique-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.image-container {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.technique-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.technique-card:hover .technique-image {
  transform: scale(1.05);
}

.technique-name {
  text-align: center;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1rem;
}

.section-footer {
  text-align: center;
  color: #4a5568;
  font-size: 1.1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .solution-section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-description {
    font-size: 1.1rem;
  }

  .techniques-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>