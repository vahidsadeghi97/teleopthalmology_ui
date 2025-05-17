<template>
  <section class="newsletter-section">
    <div class="container">
      <div class="newsletter-content">
        <h2 class="section-title">Stay Updated</h2>
        <p class="newsletter-description">
          Subscribe to our newsletter to receive updates on the latest developments in tele-ophthalmology and AI technology.
        </p>
        <form @submit.prevent="subscribe" class="newsletter-form">
          <div class="form-group">
            <input 
              type="email" 
              v-model="email" 
              placeholder="Enter your email address"
              required
              class="email-input"
            >
            <button type="submit" class="subscribe-btn">Subscribe</button>
          </div>
          <p v-if="message" :class="['message', messageType]">{{ message }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'NewsletterSection',
  data() {
    return {
      email: '',
      message: '',
      messageType: ''
    }
  },
  methods: {
    subscribe() {
      // Here you would typically make an API call to your backend
      this.message = 'Thank you for subscribing!'
      this.messageType = 'success'
      this.email = ''
      
      // Clear message after 3 seconds
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.newsletter-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.newsletter-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  opacity: 0.9;
}

.newsletter-form {
  width: 100%;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.email-input {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.email-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

.subscribe-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  background: white;
  color: #42b983;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.subscribe-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message {
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.message.success {
  background: rgba(255, 255, 255, 0.1);
}

.message.error {
  background: rgba(255, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .newsletter-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .form-group {
    flex-direction: column;
  }

  .subscribe-btn {
    width: 100%;
  }
}
</style>