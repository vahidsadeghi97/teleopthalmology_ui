<template>
  <section class="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mb-6 text-center">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Follow Us on Social Media</h2>
    <p class="text-gray-600 mb-4">Stay connected with us on social media for the latest updates, insights, and community news.</p>
    <div class="flex flex-row gap-4 justify-center">
      <a v-for="social in socialMedia" :key="social.name" :href="social.href" :aria-label="social.ariaLabel">
        <img :src="social.icon" :alt="social.name + ' Icon'" class="w-12 h-12 rounded-full hover:opacity-75">
      </a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SocialMediaSection',
  data() {
    return {
      socialMedia: [
        { name: 'Telegram', href: '#', icon: '/telegram.jpg', ariaLabel: 'Follow us on Telegram' },
        { name: 'Instagram', href: '#', icon: '/instagram.jpg', ariaLabel: 'Follow us on Instagram' },
        { name: 'WhatsApp', href: '#', icon: '/whatsapp.png', ariaLabel: 'Follow us on WhatsApp' },
        { name: 'YouTube', href: '#', icon: '/youtube.png', ariaLabel: 'Follow us on YouTube' },
        { name: 'LinkedIn', href: '#', icon: '/linked in.png', ariaLabel: 'Follow us on LinkedIn' },
      ],
    };
  },
};
</script>