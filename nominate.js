const $nominationContainer = document.getElementById('nomination');
const $messageContainer = document.getElementById('nominationMessage');

if (typeof Element.prototype.addEventListener === 'undefined') {
  Element.prototype.addEventListener = function (e, callback) {
    e = 'on' + e;
    return this.attachEvent(e, callback);
  };
}

const $inputs = document.querySelectorAll('input');
for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('blur', function() {
    if(this.type !== 'checkbox') {
      const $parent = this.offsetParent;
      const actionType = this.value !== '' ? 'add' : 'remove';
      $parent.classList[actionType]('input-has-value');
    }
  })
}

for(let i=0; i<$inputs.length; i++) {
  $inputs[i].addEventListener('focus', function() {
    if(this.type !== 'checkbox') {
      const $parent = this.offsetParent;
      $parent.classList.add('input-has-value');
    }
  })
}

const $selects = document.querySelectorAll('select');
for(let i=0; i<$selects.length; i++) {
  $selects[i].addEventListener('change', function() {
    const $parent = this.offsetParent;
    const actionType = this.value !== '' ? 'add' : 'remove';
    $parent.classList[actionType]('select-has-value');
  })
}

const submitNomination = function(event) {
  event.preventDefault();

  const form = event.target;
  const data = {};

  for (es = new FormData(form).entries(); !(e = es.next()).done && (entry = e.value);) {
    data[entry[0]] = entry[1];
  }


  sendData(form, data);
}

function sendData(form, data) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Success
        document.getElementById('nomination').style.display = 'none';
        document.getElementById('nominationMessage').style.display = 'block';

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
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.send(JSON.stringify(data));
  xhr.onloadend = function () {
    // done
  };
}

function showMessage(message) {
  $nominationContainer.style.display = 'none';
  $messageContainer.style.display = 'block';
  $messageContainer.innerHTML = message;
}

const loadingMessage = `
  <div>
    <svg viewBox="0 0 50 50" class="spinner">
      <circle class="ring" cx="25" cy="25" r="22.5" />
      <circle class="line" cx="25" cy="25" r="22.5" />
    </svg>
  </div>
`;

const successMessage = `
  <h1>Thank you for making your nomination</h1>
  <p>Your nomination is being reviewed by the 40 Over Forty team and will be uploaded once verified.</p>
  <p>We will be in touch if we require any further information.</p>
`;

// showMessage(loadingMessage);
