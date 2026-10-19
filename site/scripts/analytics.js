// Google Analytics 4. Only loaded when analytics.gaMeasurementId is set in site/config.mjs.
const id = document.currentScript?.dataset.ga || document.querySelector('script[data-ga]')?.dataset.ga;
if (id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
}
