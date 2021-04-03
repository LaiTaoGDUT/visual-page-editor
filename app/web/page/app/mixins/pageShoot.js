import html2canvas from 'html2canvas';

export default {
  methods: {
    async genShoot() {
      const canvas = await html2canvas(document.querySelector('.painter-canvas-inner'));
      return canvas.toDataURL();
    },
  }
}