function login(event) {
  event.preventDefault();
  const title = document.getElementById('env').title;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if(username === title) {
    window.localStorage.setItem('secret', password);
  }
  document.location.href = document.getElementById('loginForm').action;
}

const $inputs = document.querySelectorAll('input');
for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('blur', function() {
    if(this.type !== 'checkbox') {
      const $parent = this.offsetParent;
      const actionType = this.value !== '' ? 'add' : 'remove';
      $parent.classList[actionType]('input-has-value');
    }
  });
}

for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('focus', function() {
    if(this.type !== 'checkbox') {
      const $parent = this.offsetParent;
      $parent.classList.add('input-has-value');
    }
  });
}