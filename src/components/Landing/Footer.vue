<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/logo.png" alt="RETINEX Logo" class="logo-image">
          <p class="company-description">Empowering vision through advanced tele-ophthalmology solutions.</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h3>Quick Links</h3>
            <a href="#mission">Mission</a>
            <a href="#solutions">Solutions</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="link-group">
            <h3>Services</h3>
            <a href="#grading">Image Grading</a>
            <a href="#analysis">AI Analysis</a>
            <a href="#consulting">Consulting</a>
          </div>
          <div class="link-group">
            <h3>Legal</h3>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} RETINEX. All rights reserved.</p>
        <div class="social-links">
          <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
          <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
          <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  padding: 4rem 0 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-logo {
  max-width: 300px;
}

.logo-image {
  height: 40px;
  margin-bottom: 1rem;
}

.company-description {
  color: #a0aec0;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-group h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-group a {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-group a:hover {
  color: #42b983;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  color: #a0aec0;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: #a0aec0;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  color: #42b983;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 0 1.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>