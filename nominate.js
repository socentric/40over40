const $nominationContainer = document.getElementById('nomination');
const $messageContainer = document.getElementById('nominationMessage');
const $alreadyNominatedNames = document.getElementById('alreadyNominatedNames');
const $alreadyNominatedEmails = document.getElementById('alreadyNominatedEmails');

if (document.location.href.includes('admin')) {
  document.getElementById('nominateForm').style.display = 'block';
}

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
  <p>Nominations will be gathered and added to the website at the end of each month. If we require any futher information we will be in touch.</p>
`;

const errorMessage = `
  <h1>Apologies an error has occurred</h1>
  <p>Please let us know at <a style="text-decoration:underline" href="mailto:charlotte@pr-centric.com?subject=Error occurred while making nomination">hello@40overforty.com</a> so we can resolve the issue and help you add your nomination.<p/>
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

  if(!nominee.nominatorEmail && nominee.nominator) {
    document.getElementById('nominatorEmail').value = nominee.nominator;
  }

  for(let i=0; i<$inputs.length; i++) {
    if($inputs[i].type !== 'checkbox') {
      const $parent = $inputs[i].offsetParent;
      $parent && $parent.classList.add('input-has-value');
    }
  }

  for(let i=0; i<$selects.length; i++) {
      const $parent = $selects[i].offsetParent;
      $parent && $parent.classList.add('select-has-value');
  }
}

document.getElementById('cancelButton').addEventListener('click', (event) => {
  clearAdmin(event);
});

function clearAdmin(event) {
  event.preventDefault();
  window.localStorage.removeItem('nominee');
  window.localStorage.removeItem('forwardingUrl');
  document.location.href = storedForwardingUrl; 
}

document.getElementById('nominateForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

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
  xhr.open('POST', 'https://us-central1-stashed-online.cloudfunctions.net/nominate', true);
  xhr.send(formData);
  xhr.onloadend = function () {
    // done
  };
})

document.getElementById('updateButton').addEventListener('click', (event) => {
  event.preventDefault();
  const $form = document.getElementById('nominateForm');
  const formData = new FormData($form);
  const nominee = JSON.parse(storedNominee);
  
  const $pictureInput = document.getElementById('picture');
  if(!$pictureInput.files[0]) {
    formData.append('pictureUrl', nominee.pictureUrl);
    formData.delete('picture');
  }

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        clearAdmin(event);
      } else {
        // Error
        alert('error');
      }
    }
  }
  xhr.open('PUT', 'https://us-central1-stashed-online.cloudfunctions.net/nominate', true);
  xhr.send(formData);
}); 