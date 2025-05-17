<template>
  <section class="team-section">
    <div class="container">
      <h2 class="section-title">Our Team</h2>
      <div class="team-content">
        <p class="team-intro">Our team consists of highly skilled professionals with specialized training in retinal imaging and grading, including:</p>
        
        <div class="team-category">
          <h3 class="category-title">Leadership & Management</h3>
          <ul class="team-list">
            <li>IT Directors</li>
            <li>Team Leadership (Operations)</li>
            <li>Grading Management</li>
            <li>Quality Management</li>
            <li>Project Manager</li>
            <li>Clinical Data Manager</li>
          </ul>
        </div>
        
        <div class="team-category">
          <h3 class="category-title">Grading Specialists</h3>
          <ul class="team-list">
            <li>Expert Graders</li>
            <li>Senior Image Graders</li>
            <li>Image Graders</li>
          </ul>
        </div>
        
        <div class="team-category">
          <h3 class="category-title">Clinical Expertise</h3>
          <p class="category-intro">All team members are:</p>
          <ul class="team-list">
            <li>Fellowship-trained retinologists</li>
            <li>Certified graders</li>
          </ul>
          <p class="category-intro">Proficient in grading retinal imaging modalities, including:</p>
          <ul class="team-list">
            <li>FFA (Fundus Fluorescein Angiography)</li>
            <li>ICGA (Indocyanine Green Angiography)</li>
            <li>OCT (Optical Coherence Tomography)</li>
            <li>OCTA (OCT Angiography)</li>
            <li>CFP (Color Fundus Photography)</li>
            <li>FAF (Fundus Autofluorescence)</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OurTeam'
}
</script>

<style scoped>
.team-section {
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

.team-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.team-intro {
  color: #4a5568;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.team-category {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.team-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.category-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #42b983;
}

.category-intro {
  color: #4a5568;
  font-size: 1.1rem;
  margin: 1rem 0;
}

.team-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.team-list li {
  color: #4a5568;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.5;
}

.team-list li::before {
  content: '•';
  color: #42b983;
  position: absolute;
  left: 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .team-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .team-content {
    padding: 1.5rem;
  }

  .team-category {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .category-title {
    font-size: 1.2rem;
  }
}
</style>