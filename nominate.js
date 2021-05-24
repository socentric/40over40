const $nominationContainer = document.getElementById('nomination');
const $messageContainer = document.getElementById('nominationMessage');
const $alreadyNominatedNames = document.getElementById('alreadyNominatedNames');
const $alreadyNominatedEmails = document.getElementById('alreadyNominatedEmails');

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

function submitNomination(event) {
  event.preventDefault();

  const form = event.target;
  const data = {};

  for (es = new FormData(form).entries(); !(e = es.next()).done && (entry = e.value);) {
    data[entry[0]] = entry[1];
  }

  const myfile = form['picture'].files[0];
  const fileName = myfile.name;

  getBase64( myfile, function( result ) {
    data.picture = {
      name: fileName,
      file: btoa(result)
    };
    sendData(form, data);
  });
}

function getBase64(file, cb) {
  var reader = new FileReader();
  reader.readAsBinaryString(file);
  reader.onload = function () {
    cb(reader.result);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
} 

function sendData(form, data) {
  showMessage(loadingMessage);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        showMessage(successMessage);
      } else if (xhr.status === 400)  {
        showMessage(alreadyNominatedMessage(data.name, true));
      } else {
        // Error
        showMessage(errorMessage);
      }
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
  document.querySelectorAll('a')[0].focus();
}

const loadingMessage = `
  <div class="submitting">
    <svg viewBox="0 0 50 50" class="spinner">
      <circle class="ring" cx="25" cy="25" r="22.5" />
      <circle class="line" cx="25" cy="25" r="22.5" />
    </svg>
    <h2>Submiting your nomination...</h2>
  </div>
`;

const successMessage = `
  <h1>Thank you for making your nomination</h1>
  <p>Your nomination is being reviewed by our 40 Over Forty team and will be uploaded once verified. We will be in touch if we require any further information.</p>
`;

const errorMessage = `
  <h1>Apologies an error has occurred</h1>
  <p>Please let us know at <a style="text-decoration:underline" href="mailto:hello@40overforty.com?subject=Error occurred while making nomination">hello@40overforty.com</a> so we can resolve the issue and help you add your nomination.<p/>
`;

function alreadyNominatedMessage(name, withHeader) {
  const header = `<h1>Nomination already received</h1>`
  const paragraph = `<p>${name} is a popular choice and they have already been nominated! Why not nominate someone else?</p>`;
  return withHeader ? `${header + paragraph}` : paragraph;
}


let nomineeNames = [];
let nomineeEmails = [];

const xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    const response = JSON.parse(this.responseText);
    nomineeNames = response.map(nominee => nominee.name);
    nomineeEmails = response.map(nominee => nominee.email);
  }
};
xmlhttp.open("GET", "https://us-central1-stashed-online.cloudfunctions.net/vote", true);
xmlhttp.send();

document.getElementById('name').addEventListener('blur', function() {
  $alreadyNominatedNames.innerHTML = nomineeNames.includes(this.value) ? alreadyNominatedMessage(this.value) : '';
})

document.getElementById('email').addEventListener('blur', function() {
  $alreadyNominatedEmails.innerHTML = nomineeEmails.includes(this.value) ? alreadyNominatedMessage(this.value) : '';
})

document.getElementById('reason').addEventListener('keyup', displayXerCount);
document.getElementById('reason').addEventListener('paste', displayXerCount);
document.getElementById('reason').addEventListener('focus', displayXerCount);

function displayXerCount() {
  document.getElementById('count').innerHTML = `${this.value.length} / 700`;
}


const storedNominee = window.localStorage.getItem('nominee');
const storedForwardingUrl = window.localStorage.getItem('forwardingUrl');

if(storedNominee && storedForwardingUrl) {
  document.body.className = 'admin';

  const nominee = JSON.parse(storedNominee);
  Object.keys(nominee).forEach(key => {
    const $input = document.getElementById(key);
    if($input && !key.includes('picture')) {
      $input.value = nominee[key];
    }
  });
  document.getElementById('nominatorName').value = nominee.nominator;
  document.getElementById('nominatorEmail').value = nominee.nominator;

  for(let i=0; i<$inputs.length; i++) {
    if($inputs[i].type !== 'checkbox') {
      const $parent = $inputs[i].offsetParent;
      $parent.classList.add('input-has-value');
    }
  }

  for(let i=0; i<$selects.length; i++) {
      const $parent = $selects[i].offsetParent;
      $parent.classList.add('select-has-value');
  }
}

document.getElementById('cancelButton').addEventListener('click', (event) => {
  clearAdmin(event);
});

document.getElementById('updateButton').addEventListener('click', (event) => {
  alert('save changes');
  clearAdmin(event);
});

function clearAdmin(event) {
  event.preventDefault();
  window.localStorage.removeItem('nominee');
  window.localStorage.removeItem('forwardingUrl');
  document.location.href = storedForwardingUrl; 
}
