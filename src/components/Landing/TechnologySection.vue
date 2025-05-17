<template>
  <section class="technology-section">
    <div class="container">
      <h2 class="section-title">Learn More About Our Technology</h2>
      <div class="tech-grid">
        <div v-for="solution in solutions" :key="solution.title" class="tech-card">
          <div class="tech-image">
            <img :src="solution.image" :alt="solution.title" class="w-full h-40 object-cover rounded-lg">
          </div>
          <div class="tech-content">
            <h3>{{ solution.title }}</h3>
            <p>{{ solution.description }}</p>
            <button class="tech-btn">{{ solution.button }}</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TechnologySection',
  data() {
    return {
      solutions: [
        {
          title: 'Diabetic Retinopathy',
          image: '/DR.png',
          description: 'Diabetic retinopathy is a leading cause of blindness among diabetic patients. Our advanced retinal screening detects early signs, enabling timely treatment to prevent vision loss.',
          button: 'DR',
        },
        {
          title: 'Age-Related Macular Degeneration',
          image: '/AMD.svg',
          description: 'AMD affects central vision in older adults. Our tele-ophthalmology solutions provide early diagnosis and monitoring to slow progression and preserve quality of life.',
          button: 'AMD',
        },
        {
          title: 'Glaucoma',
          image: '/GM.svg',
          description: 'Glaucoma damages the optic nerve, often without early symptoms. Our screening tools identify risks early, allowing interventions to protect vision.',
          button: 'GM',
        },
        {
          title: 'Retinopathy of Prematurity',
          image: '/ROP.png',
          description: 'ROP affects premature infants, potentially causing blindness. Our specialized imaging and expertise ensure early detection and effective treatment.',
          button: 'ROP',
        },
      ],
    };
  },
};
</script>

<style scoped>
.technology-section {
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

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.tech-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.tech-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.tech-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tech-card:hover .tech-image img {
  transform: scale(1.05);
}

.tech-content {
  padding: 1.5rem;
}

.tech-content h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.tech-content p {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.tech-btn {
  display: inline-block;
  background: #42b983;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tech-btn:hover {
  background: #2c3e50;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .technology-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .tech-image {
    height: 180px;
  }
}
</style>