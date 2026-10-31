const contactDialog = document.querySelector('#contact-dialog');
const contactOpenButtons = [...document.querySelectorAll('[data-contact-open]')];
const contactCloseButton = contactDialog.querySelector('.contact-dialog-close');

let contactOpener;

contactOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    contactOpener = button;
    contactDialog.showModal();
  });
});

contactCloseButton.addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('click', (event) => {
  if (event.target === contactDialog) contactDialog.close();
});
contactDialog.addEventListener('close', () => contactOpener?.focus());
