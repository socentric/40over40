if (typeof Element.prototype.addEventListener === 'undefined') {
  Element.prototype.addEventListener = function (e, callback) {
    e = 'on' + e;
    return this.attachEvent(e, callback);
  };
}

const $inputs = document.querySelectorAll('input');
for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('blur', function() {
    const $parent = this.offsetParent;
    const actionType = this.value !== '' ? 'add' : 'remove';
    $parent.classList[actionType]('input-has-value');
  })
}

for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('focus', function() {
    const $parent = this.offsetParent;
    $parent.classList.add('input-has-value');
  })
}

const $selects = document.querySelectorAll('select');
for(let i=0; i<$inputs.length; i++) {
  $selects[i].addEventListener('change', function() {
    const $parent = this.offsetParent;
    const actionType = this.value !== '' ? 'add' : 'remove';
    $parent.classList[actionType]('select-has-value');
  })
}

const submitNomination = function(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const file = form['picture'].files[0];
  formData.append('picture', file);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Success
        document.getElementById('nomination').style.display = 'none';
        document.getElementById('nominationSuccess').style.display = 'block';

      } else if (xhr.status === 400)  {
        // Already nominated
        alert('already nominated');

      } else {
        // Error
        alert('error occurred')

      }
      document.querySelectorAll('a')[0].focus();
    }
  }
  xhr.open(form.method, form.action, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(formData);
  xhr.onloadend = function () {
    // done
  };
}
// https://masteringjs.io/tutorials/fundamentals/upload-file