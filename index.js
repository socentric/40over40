document.getElementById('toggleMenu').addEventListener('click', function(event) {
  event.preventDefault();
  document.body.classList.toggle('menu-open');
})

function setLog() {
  if(document.location.href.indexOf('admin') !== -1) {
    const secret = window.localStorage.getItem('secret');
    document.location.href = secret ? 'admin.html' : 'login.html';
  }
}