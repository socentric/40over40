setLog();

const xmlhttp = new XMLHttpRequest();
let nominees = [];

const $thumbnailContainer = document.getElementById('thumbnailContainer');
const $detailContainer = document.getElementById('detailContainer');

xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let json = JSON.parse(this.responseText);
    var sortedNominations = sortByName(json);   
    nominees = sortedNominations.filter(nominee => nominee.publish === 'true');
    if(nominees.length > 0) {
      renderThumbnailContainer(nominees);
    }
  }
};
xmlhttp.open("GET", "https://us-central1-stashed-online.cloudfunctions.net/vote", true);
xmlhttp.send();

const renderThumbnailContainer = (nominees) => {
  $thumbnailContainer.innerHTML = '';
  nominees.map((nomination) => {
    const fragment = renderThumbnail(nomination);
    $thumbnailContainer.insertAdjacentHTML('beforeend', fragment);
  });
}

const renderThumbnail = (nomination) => {
  const {name, pictureUrl} = nomination;
  const inlineStyle = pictureUrl ? `background-image: url('${pictureUrl}')` : ``;
  return `
    <a href="#${name.replace(/\s/g,'_').trim()}">
      <div style="${inlineStyle}" title="View ${name}" class="with-picture"></div>
      <p>${name}</p>
    </a>
  `;
}

const renderDetail = (nominee) => {
  const {name, company, jobTitle, reason, linkedIn, pictureUrl} = nominee;
  const firstName = name.split(' ')[0];
  const inlineStyle = pictureUrl ? `background-image: url('${pictureUrl}')` : ``;
  const description = reason.split('\r\n\r\n').reduce((prevValue, value) => {
    return `${prevValue}<p>${value}</p>`;
  }, ``);

  return `
    <div style="${inlineStyle}" title="${name}" class="with-picture">
      <a class="back-to-nominees" href="#" title="Back to 2021 Nominees">
        <img src="images/back-arrow.gif" alt="" />
      </a>  
      <div class="content">
        <h2>${name}</h2>
        <h3>${jobTitle}${company.toLowerCase() === 'freelance' ? `,` : ` at`} ${company}</h3>
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

  const hash = decodeURI(window.location.hash).replace(/_/g,' ');
  const nomineeName = hash.replace('#', '');

  if(nomineeName && nominees.length > 0) {
    const nominee = nominees.filter(nominee => {
      return nominee.name.trim() === nomineeName.trim();
    })[0];
    const fragment = renderDetail(nominee);

    $detailContainer.style.display = 'block';
    $detailContainer.insertAdjacentHTML('beforeend', fragment);
  } else if (nomineeName) {
    setTimeout("showViews()", 400);
  }
  else {
    $thumbnailContainer.style.display = 'flex';
  }
};

window.addEventListener("load", showViews, false);
window.addEventListener("hashchange", showViews, false);

function sortByName(json) {
  return json.sort((a, b) => {
    let fa = a.name.toLowerCase(),
        fb = b.name.toLowerCase();

    if (fa < fb) {
        return -1;
    } 
    if (fa > fb) {
        return 1;
    }
    return 0;
  });
}