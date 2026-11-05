document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('[data-contact-form]');
  if (!forms.length) return;

  const isValidSingaporePhone = (val) => {
    if (!val) return false;
    const clean = val.replace(/[\s\-\(\)\.]/g, '');
    const national = clean.replace(/^(?:\+65|0065|65)/, '');
    return /^[689]\d{7}$/.test(national);
  };

  forms.forEach((form) => {
    const phoneInput = form.querySelector('input[name="phone"]');
    const errorMessage = form.querySelector('[data-phone-error]');

    if (!phoneInput || !errorMessage) return;

    const defaultErrorText = errorMessage.textContent || 'Contact number is required.';

    const showError = (msg) => {
      errorMessage.textContent = msg || defaultErrorText;
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
      const val = phoneInput.value.trim();
      if (val === '') {
        event.preventDefault();
        showError('Contact number is required.');
        phoneInput.focus();
      } else if (!isValidSingaporePhone(val)) {
        event.preventDefault();
        showError('Please enter a valid Singapore number (e.g. +65 8XXX XXXX or 9XXX XXXX).');
        phoneInput.focus();
      } else {
        clearError();
      }
    });

    phoneInput.addEventListener('input', () => {
      const val = phoneInput.value.trim();
      if (val === '' || isValidSingaporePhone(val)) {
        clearError();
      }
    });
  });
});
