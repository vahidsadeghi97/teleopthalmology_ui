<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Teleophthalmology Platform</h1>
        <p class="hero-subtitle">Advanced Eye Care Through Digital Innovation</p>
        <div class="hero-buttons">
          <router-link to="/login" class="btn btn-primary">Get Started</router-link>
          <a href="#about" class="btn btn-secondary">Learn More</a>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Mission Section -->
      <section id="about" class="section">
        <MissionSection />
      </section>

      <!-- Why Choose Us -->
      <section class="section bg-light">
        <WhyClinics />
      </section>

      <!-- Our Solution -->
      <section class="section">
        <SolutionSection />
      </section>

      <!-- Project Timeline -->
      <section class="section bg-light">
        <ProjectTimeline />
      </section>

      <!-- Technology Stack -->
      <section class="section">
        <TechnologySection />
      </section>

      <!-- Team Section -->
      <section class="section bg-light">
        <OurTeam />
      </section>

      <!-- Honors & Recognition -->
      <section class="section">
        <HonorsSection />
      </section>

      <!-- Consulting & Partnering -->
      <section class="section bg-light">
        <ConsultingPartnering />
      </section>

      <!-- Publications -->
      <section class="section">
        <PublicationsSection />
      </section>

      <!-- Events -->
      <section class="section bg-light">
        <EventsSection />
      </section>

      <!-- Image Upload Demo -->
      <section class="section">
        <ImageUpload />
      </section>

      <!-- Contact Section -->
      <section class="section bg-light">
        <ContactSection />
      </section>

      <!-- Newsletter -->
      <section class="section">
        <NewsletterSection />
      </section>

      <!-- Social Media -->
      <section class="section bg-light">
        <SocialMediaSection />
      </section>

      <!-- Navigation -->
      <section class="section">
        <NavigationSection />
      </section>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Landing/Header.vue';
import MissionSection from '@/components/Landing/MissionSection.vue';
import WhyClinics from '@/components/Landing/WhyClinics.vue';
import SolutionSection from '@/components/Landing/SolutionSection.vue';
import ProjectTimeline from '@/components/Landing/ProjectTimeline.vue';
import OurTeam from '@/components/Landing/OurTeam.vue';
import HonorsSection from '@/components/Landing/HonorsSection.vue';
import ConsultingPartnering from '@/components/Landing/ConsultingPartnering.vue';
import TechnologySection from '@/components/Landing/TechnologySection.vue';
import PublicationsSection from '@/components/Landing/PublicationsSection.vue';
import EventsSection from '@/components/Landing/EventsSection.vue';
import ImageUpload from '@/components/Landing/ImageUpload.vue';
import ContactSection from '@/components/Landing/ContactSection.vue';
import NewsletterSection from '@/components/Landing/NewsletterSection.vue';
import SocialMediaSection from '@/components/Landing/SocialMediaSection.vue';
import NavigationSection from '@/components/Landing/NavigationSection.vue';
import Footer from '@/components/Landing/Footer.vue';

export default {
  name: 'LandingPage',
  components: {
    Header,
    MissionSection,
    WhyClinics,
    SolutionSection,
    ProjectTimeline,
    OurTeam,
    HonorsSection,
    ConsultingPartnering,
    TechnologySection,
    PublicationsSection,
    EventsSection,
    ImageUpload,
    ContactSection,
    NewsletterSection,
    SocialMediaSection,
    NavigationSection,
    Footer,
  },
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-section {
  min-height: 80vh;
  background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/path-to-your-pattern.svg') repeat;
  opacity: 0.1;
}

.hero-content {
  max-width: 800px;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #369f6b;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.main-content {
  flex: 1;
}

.section {
  padding: 5rem 2rem;
}

.bg-light {
  background-color: #f8fafc;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .section {
    padding: 3rem 1rem;
  }
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Section Transitions */
.section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Intersection Observer for section animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  // Observe all sections
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
});
</script>