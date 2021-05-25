if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

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
