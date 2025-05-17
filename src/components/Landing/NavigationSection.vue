<template>
  <section class="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mb-6 text-center">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Explore More</h2>
    <div class="grid grid-cols-3 gap-4">
      <a v-for="link in navLinks" :key="link.id" :href="link.href" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">{{ link.text }}</a>
      <a href="#honors" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">Honors</a>
      <a href="#publications" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">Publications</a>
      <a href="#events" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">Events</a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'NavigationSection',
  data() {
    return {
      navLinks: [
        { id: 1, text: 'Solution', href: '#solution' },
        { id: 2, text: 'Why RETINEX', href: '#why-retinex' },
        { id: 3, text: 'Clinical Services', href: '#clinical-services' },
        { id: 4, text: 'Partnership', href: '#partnering' },
        { id: 5, text: 'Client Login', href: '#client-login' },
        { id: 6, text: 'Contact Us', href: '#contact-us' },
      ],
    };
  },
};
</script>