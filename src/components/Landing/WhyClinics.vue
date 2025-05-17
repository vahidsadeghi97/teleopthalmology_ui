<template>
  <section class="why-clinics-section">
    <div class="container">
      <h2 class="section-title">Why medical clinics should perform retinal exams</h2>
      <div class="content-wrapper">
        <p class="description">Early detection and treatment of diabetic retinopathy can reduce the risk of blindness by as much as 90%. Typically, less than half of diabetic patients receive timely retinal exams. The reason? Difficulty getting to the eye doctor has been the major problem. The solution? Bring the retinal screening to the patient in primary care, an important step toward preventing diabetic blindness.</p>
        <button class="learn-more-btn">Learn More</button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'WhyClinics',
};
</script>

<style scoped>
.why-clinics-section {
  padding: 4rem 0;
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

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.description {
  font-size: 1.25rem;
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.learn-more-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(66, 185, 131, 0.1);
}

.learn-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(66, 185, 131, 0.2);
  background: #3aa876;
}

@media (max-width: 768px) {
  .why-clinics-section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .description {
    font-size: 1.1rem;
  }
}
</style>