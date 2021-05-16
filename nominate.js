document.querySelectorAll('input').forEach(node => node.addEventListener('blur', function() {
  debugger;
  const $label = this.offsetParent.querySelector('label');
  const actionType = this.value !== '' ? 'add' : 'remove';
  $label.classList[actionType]('input-has-value');
}));

const submitNomination = (event) => {
  event.preventDefault();

  const form = event.target;
  const data = {};
  const formData = new FormData(form);
  [...formData.entries()].forEach((entry) => {
    data[entry[0]] = entry[1];
  })

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
        alert('error')

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
// https://masteringjs.io/tutorials/fundamentals/upload-file