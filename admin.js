const voteUrl = 'https://us-central1-stashed-online.cloudfunctions.net/vote';
const nominateUrl = 'https://us-central1-stashed-online.cloudfunctions.net/nominate';
const voteforUrl = 'https://us-central1-stashed-online.cloudfunctions.net/votefor';
let nominees = [];
let nominee = {};

const $adminActionsContainer = document.getElementById('adminActionsContainer');
const $thumbnailContainer = document.getElementById('thumbnailContainer');
const $detailContainer = document.getElementById('detailContainer');
const $statusButton = document.getElementById('statusButton');
const $editButton = document.getElementById('editButton');
const $deleteButton = document.getElementById('deleteButton');

getVotes();

const renderThumbnailContainer = (nominees, heading) => {
  $thumbnailContainer.insertAdjacentHTML('beforeend', `<h2 class="${heading.toLowerCase()}">${heading}:</h2>`);
  nominees.map((nomination) => {
    const fragment = renderThumbnail(nomination);
    $thumbnailContainer.insertAdjacentHTML('beforeend', fragment);
  });
}

const renderThumbnail = (nomination) => {
  const {name, pictureUrl} = nomination;
  const inlineStyle = pictureUrl ? `background-image: url('${pictureUrl}')` : ``;
  const formattedName = `${name.replace(/\s/g,'_').trim()}`;
  return `
    <span style="position:relative;">
      <a href="#${formattedName}">
        <div style="${inlineStyle}" title="View ${name}" class="with-picture"></div>
        <p>${name}</p>
      </a>
      ${renderVoteButton(formattedName)}
    </span>
  `;
}

const renderVoteButton = (formattedName) => {
  return !window.localStorage.getItem(formattedName) 
    ? `<button class="vote" onclick="vote(event);" onmouseover="votingOn(event)" onmouseout="votingOff(event)" data-name="${formattedName}">Vote</button>`
    : `<button class="vote voted" data-name="${formattedName}">Voted</button>`;
}

const renderDetail = (nominee) => {
  const {name, company, jobTitle, reason, linkedIn, pictureUrl} = nominee;
  const firstName = name.split(' ')[0];
  const inlineStyle = pictureUrl ? `background-image: url('${pictureUrl}')` : ``;
  const formattedName = `${name.replace(/\s/g,'_').trim()}`;
  const description = reason.split('\r\n\r\n').reduce((prevValue, value) => {
    return `${prevValue}<p>${value}</p>`;
  }, ``);

  return `
    <div style="${inlineStyle}" title="${name}" class="with-picture">
      <a class="back-to-nominees" href="#" title="Back to 2021 Nominees">
        <img src="images/back-arrow.gif" alt="" />
      </a>  
      <div class="content">
        <h2>${name} ${renderVoteButton(formattedName)}</h2>
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
  $adminActionsContainer.style.display = 'none';
  $thumbnailContainer.style.display = 'none';
  $detailContainer.style.display = 'none';
  $detailContainer.innerHTML = '';
}

const showViews = () => {
  hideViews();

  const hash = decodeURI(window.location.hash).replace(/_/g,' ');
  const nomineeName = hash.replace('#', '');

  if(nomineeName && nominees.length > 0) {
    nominee = nominees.filter(nominee => {
      return nominee.name.trim() === nomineeName.trim();
    })[0];
    const fragment = renderDetail(nominee);

    statusButton.innerText = nominee.publish == 'true' ? 'Archive' : 'Publish';
    statusButton.value = nominee.publish === 'true' ? 'archive' : 'publish';

    $adminActionsContainer.style.display = 'block';
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

function getVotes() {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText);
      var sortedNominations = sortByName(json);   
      const unpublishedNominees = sortedNominations.filter(nominee => !nominee.publish || nominee.publish === 'false');
      const publishedNominees = sortedNominations.filter(nominee => nominee.publish === 'true');
      renderThumbnailContainer(unpublishedNominees, 'Unpublished');
      renderThumbnailContainer(publishedNominees, 'Published');
      nominees = unpublishedNominees.concat(publishedNominees);
    }
  };
  xmlhttp.open('GET', voteUrl, true);
  xmlhttp.send();
}

$statusButton.addEventListener('click', function (event) {
  event.preventDefault();
  const formData = new FormData();
  Object.keys(nominee).map((key) => formData.append(key, nominee[key]));

  const value = nominee.publish === 'true' ? 'false' : 'true';
  formData.append('publish', value);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        document.location.reload();
      } else {
        // Error
        alert('error');
      }
    }
  }
  xhr.open('PUT', 'https://us-central1-stashed-online.cloudfunctions.net/nominate', true);
  xhr.send(formData);
});

$editButton.addEventListener('click', function (event) {
  event.preventDefault();
  window.localStorage.setItem('forwardingUrl', document.location.href);
  window.localStorage.setItem('nominee', JSON.stringify(nominee));
  document.location.href = 'nominate.html';
});

$deleteButton.addEventListener('click', function (event) {
  event.preventDefault();
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        document.location.href = 'nominees.html';
      } else {
        // Error
        console.log('error');
      }
    }
  }
  xhr.open('DELETE', `${nominateUrl}?email=${nominee.email}`, true);
  xhr.send();
});

const vote = (event) => {
  event.preventDefault;
  const element = event.srcElement;
  const name = element.dataset.name;
  const payload = {
    "name": name
  };

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert('success');
        element.innerText = 'Voted';
        element.className = 'vote voted'
        window.localStorage.setItem(name, 'true');
      } else {
        // Error
        alert('error');
      }
    }
  }
  
  xhr.open('POST', 'https://us-central1-stashed-online.cloudfunctions.net/votefor', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(payload));
  xhr.onloadend = function () {
    // done
  };
};

const votingOn = (event) => event.srcElement.parentNode.className = 'voting';
const votingOff = (event) => event.srcElement.parentNode.className = '';