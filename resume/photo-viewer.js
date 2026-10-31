const photoDialog = document.querySelector('#kiosk-photo-dialog');
const photoOpen = document.querySelector('#kiosk-photo-open');
const photoClose = photoDialog.querySelector('.photo-dialog-close');

photoOpen.addEventListener('click', () => photoDialog.showModal());
photoClose.addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
