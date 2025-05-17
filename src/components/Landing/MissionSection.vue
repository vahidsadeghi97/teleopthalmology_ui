<template>
  <section id="mission" class="mission-section">
    <div class="container">
      <h2 class="section-title">Our Mission: Empowering Vision</h2>
      <div class="mission-content">
        <div class="mission-text">
          <p class="mission-description">Our mission is to empower vision through advanced tele-ophthalmology solutions...</p>
          <a href="/data-transmission-site.html" target="_blank" class="mission-button">Access Data Transmission Site</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MissionSection',
};
</script>

<style scoped>
.mission-section {
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

.mission-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mission-text {
  max-width: 800px;
  text-align: center;
}

.mission-description {
  font-size: 1.25rem;
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.mission-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(66, 185, 131, 0.1);
}

.mission-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(66, 185, 131, 0.2);
  background: #3aa876;
}

@media (max-width: 768px) {
  .mission-section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .mission-description {
    font-size: 1.1rem;
  }
}
</style>