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
for(let i=0; i<$selects.length; i++) {
  $selects[i].addEventListener('change', function() {
    const $parent = this.offsetParent;
    const actionType = this.value !== '' ? 'add' : 'remove';
    $parent.classList[actionType]('select-has-value');
  })
}

const submitNomination = function(event) {
  event.preventDefault();

  const data = {};
  const form = event.target;

  for (es = new FormData(form).entries(); !(e = es.next()).done && (entry = e.value);) {
    const name = entry[0];
    const value = entry[1]
    if(name !== 'picture') {
      data[name] = value;
    }
  }

  const myfile = form['picture'].files[0];
  getBase64( myfile, function( result ) {
    data.picture = result;
    sendData(form, data);
  });
}
// https://masteringjs.io/tutorials/fundamentals/upload-file

function sendData(form, data) {
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
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.send(JSON.stringify(data));
  xhr.onloadend = function () {
    // done
  };
}

function getBase64(file, cb) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    cb(reader.result);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}