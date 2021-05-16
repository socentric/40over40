
const xmlhttp = new XMLHttpRequest();
let nominees = [];

const $thumbnailContainer = document.getElementById('thumbnailContainer');
const $detailContainer = document.getElementById('detailContainer');

xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let json = JSON.parse(this.responseText);
    nominees = json.filter(nominee => nominee.published);
    if(nominees.length > 0) {
      renderThumbnailContainer(nominees);
    }
  }
};
xmlhttp.open("GET", "https://us-central1-stashed-online.cloudfunctions.net/vote", true);
xmlhttp.send();

const renderThumbnailContainer = (nominees) => {
  $thumbnailContainer.innerHTML = '';
  nominees.map((nomination, index) => {
    const {name} = nomination;
    const fragment = renderThumbnail(`assets/pic${index+1}.jpg`, name);
    $thumbnailContainer.insertAdjacentHTML('beforeend', fragment);
  });
}

const renderThumbnail = (pictureUrl, name) => {
  return `<a href="#${name.replace(' ', '_')}">
      <div style="background-image: url('${pictureUrl}');" title="View ${name}"></div>
      <p>${name}</p>
    </a>
  `;
}

const renderDetail = (nominee, pictureUrl) => {
  const {name, company, jobTitle, reason, linkedIn} = nominee;
  const firstName = name.split(' ')[0];
  const description = reason.split('\r\n\r\n').reduce((prevValue, value) => {
    return `${prevValue}<p>${value}</p>`;
  }, ``)

  return `
    <div style="background-image: url('${pictureUrl}');" title="${name}">
      <a class="back-to-nominees" href="#" title="Back to 2021 Nominees">
        <img src="images/back-arrow.gif" alt="" />
      </a>  
      <div class="content">
        <h2>${name}</h2>
        <h3>${jobTitle} at ${company}</h3>
        ${description}
        <nav>
          <a class="linkedin" href="${linkedIn}" target="_blank">
            <img src="images/linkedIn-big.gif" alt="Linkedin" valign="middle" />Check out ${firstName}'s profile on LinkedIn
          </a>
        </nav>
      </div>
    </div>
  `;
}

const hideViews = () => {
  $thumbnailContainer.style.display = 'none';
  $detailContainer.style.display = 'none';
  $detailContainer.innerHTML = '';
}

const showViews = () => {
  hideViews();

  const hash = window.location.hash.replace('_', ' ');
  const nomineeName = hash.replace('#', '');

  if(nomineeName && nominees.length > 0) {
    const nominee = nominees.filter(nominee => nominee.name = nomineeName)[0];
    const fragment = renderDetail(nominee, `assets/pic1.jpg`);

    $detailContainer.style.display = 'block';
    $detailContainer.insertAdjacentHTML('beforeend', fragment);
  } else if (nomineeName) {
    setTimeout("showViews()", 400);
  }
  else {
    $thumbnailContainer.style.display = 'block';
  }
};

window.addEventListener("load", showViews, false);
window.addEventListener("hashchange", showViews, false);