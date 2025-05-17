<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <img src="/logo.png" alt="RETINEX Logo" class="logo-image">
        </div>
        <nav class="main-nav">
          <a href="#mission" class="nav-link">Mission</a>
          <a href="#solutions" class="nav-link">Solutions</a>
          <a href="#team" class="nav-link">Team</a>
          <a href="#contact" class="nav-link">Contact</a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 40px;
  width: auto;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #42b983;
  background: rgba(66, 185, 131, 0.1);
}

@media (max-width: 768px) {
  .header {
    padding: 0.5rem 0;
  }

  .main-nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>