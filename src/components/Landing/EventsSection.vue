<template>
  <section class="events-section">
    <div class="container">
      <h2 class="section-title">Events</h2>
      <div class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card">
          <div class="event-image">
            <img :src="event.image" :alt="event.title">
          </div>
          <div class="event-content">
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-description">{{ event.description }}</p>
            <div class="event-details">
              <span class="event-date">{{ event.date }}</span>
              <span class="event-location">{{ event.location }}</span>
            </div>
            <a :href="event.link" class="event-link" target="_blank">Learn More</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EventsSection',
  data() {
    return {
      events: [
        {
          id: 1,
          title: 'AI in Healthcare Conference',
          description: 'Join us at the annual AI in Healthcare Conference where we will showcase our latest advancements in retinal image analysis.',
          date: 'June 15-17, 2024',
          location: 'San Francisco, CA',
          image: '/ai-healthcare-conference.jpg',
          link: '#'
        },
        {
          id: 2,
          title: 'Ophthalmology Innovation Summit',
          description: 'Presenting our breakthrough technology in tele-ophthalmology and its impact on improving patient care.',
          date: 'July 22-24, 2024',
          location: 'Boston, MA',
          image: '/ophthalmology-summit.jpg',
          link: '#'
        }
      ]
    }
  }
}
</script>

<style scoped>
.events-section {
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

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.event-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.event-content {
  padding: 1.5rem;
}

.event-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.event-description {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.event-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  color: #718096;
  font-size: 0.9rem;
}

.event-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.event-link:hover {
  background: #3aa876;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .events-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style>