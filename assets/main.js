(() => {
  const form = document.getElementById('consultation-form');
  if (!form) {
    return;
  }

  const successMessage = document.getElementById('consultation-success-message');
  const errorMessage = document.getElementById('consultation-error-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const config = window.APP_CONFIG || {};
  const consultationFormUrl = config.consultationFormUrl || '/api/consultation';
  const paymentUrl = config.paymentUrl;

  if (paymentUrl) {
    const paymentLink = document.querySelector('[data-payment-link]');
    if (paymentLink) {
      paymentLink.setAttribute('href', paymentUrl);
    }
  }

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
