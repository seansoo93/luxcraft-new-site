document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const phoneInput = form.querySelector('input[name="phone"]');
  const errorMessage = form.querySelector('[data-phone-error]');

  if (!phoneInput || !errorMessage) return;

  const showError = () => {
    errorMessage.classList.add('is-visible');
    phoneInput.classList.add('contact-phone-error');
    phoneInput.setAttribute('aria-invalid', 'true');
  };

  const clearError = () => {
    errorMessage.classList.remove('is-visible');
    phoneInput.classList.remove('contact-phone-error');
    phoneInput.removeAttribute('aria-invalid');
  };

  form.addEventListener('submit', (event) => {
    if (phoneInput.value.trim() === '') {
      event.preventDefault();
      showError();
      phoneInput.focus();
    } else {
      clearError();
    }
  });

  phoneInput.addEventListener('input', () => {
    if (phoneInput.value.trim() !== '') {
      clearError();
    }
  });
});
