<template>
  <div class="about">
    <div class="content-wrapper">
      <h1 class="title">Access Denied</h1>
      <p class="subtitle">You don't have permission to view this content</p>
      
      <div class="animation-container">
        <div class="lock-icon">
          <div class="lock-top"></div>
          <div class="lock-body"></div>
        </div>
        <div class="shockwave"></div>
      </div>
      
      <button class="action-btn" @click="goBack">
        Return to Safety
        <svg class="arrow-icon" viewBox="0 0 24 24">
          <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
        </svg>
      </button>
    </div>
    
    <div class="particles-container">
      <div v-for="i in 30" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      window.history.back();
    },
    particleStyle(i) {
      const size = Math.random() * 10 + 5;
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        backgroundColor: `hsl(${Math.random() * 60}, 100%, 50%)`,
        opacity: Math.random() * 0.5 + 0.1
      };
    }
  }
}
</script>

<style>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.title {
  font-size: 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: titleGlow 2s infinite alternate;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.animation-container {
  position: relative;
  margin: 3rem auto;
  width: 150px;
  height: 150px;
}

.lock-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.lock-top {
  width: 60px;
  height: 30px;
  background: #ff4d4d;
  border-radius: 15px 15px 0 0;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.6);
}

.lock-body {
  width: 80px;
  height: 60px;
  background: linear-gradient(145deg, #ff4d4d, #e64444);
  border-radius: 10px;
  position: relative;
  top: -10px;
  box-shadow: 0 5px 20px rgba(255, 77, 77, 0.4);
}

.shockwave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 77, 77, 0.2);
  animation: shockwave 3s infinite;
  pointer-events: none;
}

.action-btn {
  background: linear-gradient(90deg, #ff4d4d, #ff8c00);
  border: none;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  margin: 2rem auto;
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.4);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 77, 77, 0.6);
}

.action-btn:active {
  transform: translateY(1px);
}

.arrow-icon {
  width: 24px;
  height: 24px;
  fill: white;
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.action-btn:hover .arrow-icon {
  transform: translateX(5px);
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float 15s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
  }
}

@keyframes shockwave {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
  }
  100% {
    text-shadow: 0 0 20px rgba(255, 77, 77, 0.8), 0 0 30px rgba(255, 140, 0, 0.6);
  }
}

@media (min-width: 1024px) {
  .content-wrapper {
    padding-top: 10vh;
  }
  
  .title {
    font-size: 5rem;
  }
  
  .subtitle {
    font-size: 1.8rem;
  }
}
</style>