<template>
  <section class="timeline-section">
    <div class="container">
      <h2 class="section-title">Project Timeline</h2>
      <div class="timeline">
        <div v-for="(phase, index) in phases" 
             :key="index" 
             class="timeline-item"
             :class="{ 'timeline-item-right': index % 2 === 1 }">
          <div class="timeline-content">
            <div class="timeline-icon">
              <i :class="phase.icon"></i>
            </div>
            <div class="timeline-details">
              <h3 class="timeline-title">{{ phase.title }}</h3>
              <p class="timeline-description">{{ phase.description }}</p>
              <div class="timeline-duration">
                <i class="far fa-clock"></i>
                <span>{{ phase.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProjectTimeline',
  data() {
    return {
      phases: [
        {
          title: 'Initial Consultation and Planning',
          description: 'Understanding your requirements and developing a comprehensive project plan.',
          duration: '2-3 weeks',
          icon: 'fas fa-handshake'
        },
        {
          title: 'Protocol Development',
          description: 'Creating detailed protocols and workflows for image acquisition and analysis.',
          duration: '3-4 weeks',
          icon: 'fas fa-file-medical'
        },
        {
          title: 'Technical Setup',
          description: 'Implementing the necessary infrastructure and software solutions.',
          duration: '4-6 weeks',
          icon: 'fas fa-cogs'
        },
        {
          title: 'Project Execution',
          description: 'Carrying out the planned activities with regular progress monitoring.',
          duration: '8-12 weeks',
          icon: 'fas fa-tasks'
        },
        {
          title: 'Project Completion and Evaluation',
          description: 'Final review, documentation, and assessment of project outcomes.',
          duration: '2-3 weeks',
          icon: 'fas fa-check-circle'
        }
      ]
    };
  }
};
</script>

<style scoped>
.timeline-section {
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

.timeline {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.timeline::before {
  content: '';
  position: absolute;
  width: 4px;
  background: #42b983;
  top: 0;
  bottom: 0;
  left: 50%;
  margin-left: -2px;
  border-radius: 2px;
}

.timeline-item {
  padding: 2rem 0;
  position: relative;
  width: 50%;
  padding-right: 3rem;
}

.timeline-item-right {
  margin-left: 50%;
  padding-right: 0;
  padding-left: 3rem;
}

.timeline-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.timeline-icon {
  position: absolute;
  width: 50px;
  height: 50px;
  background: #42b983;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  right: -75px;
  z-index: 1;
}

.timeline-item-right .timeline-icon {
  right: auto;
  left: -75px;
}

.timeline-details {
  padding-left: 1rem;
}

.timeline-title {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.timeline-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.timeline-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
}

.timeline-duration i {
  color: #42b983;
}

@media (max-width: 768px) {
  .timeline::before {
    left: 31px;
  }

  .timeline-item {
    width: 100%;
    padding-left: 80px;
    padding-right: 0;
  }

  .timeline-item-right {
    margin-left: 0;
    padding-left: 80px;
  }

  .timeline-icon {
    left: 0;
    right: auto;
  }

  .timeline-item-right .timeline-icon {
    left: 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }
}
</style>