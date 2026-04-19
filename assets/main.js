(() => {
  const config = window.APP_CONFIG || {};
  const consultationFormUrl = config.consultationFormUrl || '/api/consultation';
  const paymentUrl = config.paymentUrl;

  const trackEvent = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
  };

  const trackedCtas = document.querySelectorAll('[data-track]');
  trackedCtas.forEach((cta) => {
    cta.addEventListener('click', () => {
      const trackType = cta.getAttribute('data-track');
      const location = cta.getAttribute('data-track-location') || 'unknown';

      if (trackType === 'consult-cta') {
        trackEvent('click_consult_cta', { location });
      }

      if (trackType === 'payment-cta') {
        trackEvent('click_payment_cta', { location });
      }
    });
  });

  const paymentLink = document.getElementById('payment-cta') || document.querySelector('[data-payment-link]');
  if (paymentLink && paymentUrl) {
    paymentLink.setAttribute('href', paymentUrl);
    paymentLink.setAttribute('target', '_blank');
    paymentLink.setAttribute('rel', 'noopener');
  }

  const form = document.getElementById('consultation-form');
  if (!form) {
    return;
  }

  const successMessage = document.getElementById('consultation-success-message');
  const errorMessage = document.getElementById('consultation-error-message');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '전송 중...';
    }

    if (successMessage) {
      successMessage.hidden = true;
    }
    if (errorMessage) {
      errorMessage.hidden = true;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(consultationFormUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation form.');
      }

      form.reset();
      if (successMessage) {
        successMessage.hidden = false;
      }
      trackEvent('submit_consult_form_success');
    } catch (error) {
      console.error(error);
      if (errorMessage) {
        errorMessage.hidden = false;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
})();
