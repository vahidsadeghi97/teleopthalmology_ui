<template>
  <section class="contact-section">
    <div class="container">
      <h2 class="section-title">Contact Us</h2>
      <div class="contact-content">
        <div class="contact-info">
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <h3>Address</h3>
              <p>123 Medical Center Drive<br>Suite 456<br>Healthcare City, HC 12345</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-phone"></i>
            <div>
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <div>
              <h3>Email</h3>
              <p>info@retex.com</p>
            </div>
          </div>
        </div>
        <form class="contact-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" class="form-input" placeholder="Your name">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-input" placeholder="Your email">
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" class="form-input" rows="5" placeholder="Your message"></textarea>
          </div>
          <button type="submit" class="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ContactSection'
}
</script>

<style scoped>
.contact-section {
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

.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item i {
  font-size: 1.5rem;
  color: #42b983;
  margin-top: 0.25rem;
}

.info-item h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.info-item p {
  color: #4a5568;
  line-height: 1.6;
}

.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.submit-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.submit-btn:hover {
  background: #3aa876;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .contact-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .contact-form {
    padding: 1.5rem;
  }
}
</style>