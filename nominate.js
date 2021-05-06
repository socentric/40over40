document.querySelectorAll('input').forEach(node => node.addEventListener('blur', function() {
  const $label = this.offsetParent.querySelector('label');
  const actionType = this.value !== '' ? 'add' : 'remove';
  $label.classList[actionType]('input-has-value');
}));

document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
  const queryObj = {};
  const formData = new FormData(this);
  [...formData.entries()].forEach((entry) => {
    queryObj[entry[0]] = entry[1];
  })
  console.log(queryObj);

  document.getElementById('nomination').style.display = 'none';
  document.getElementById('nominationSuccess').style.display = 'block';
})


// https://masteringjs.io/tutorials/fundamentals/upload-file