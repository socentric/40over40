const voteUrl = 'https://us-central1-stashed-online.cloudfunctions.net/vote';
const nominateUrl = 'https://us-central1-stashed-online.cloudfunctions.net/nominate';
const voteForUrl = 'https://us-central1-stashed-online.cloudfunctions.net/votefor';
let nominees = [];
let nominee = {};

const $adminActionsContainer = document.getElementById('adminActionsContainer');
const $thumbnailContainer = document.getElementById('thumbnailContainer');
const $detailContainer = document.getElementById('detailContainer');
const $statusButton = document.getElementById('statusButton');
const $editButton = document.getElementById('editButton');
const $deleteButton = document.getElementById('deleteButton');

getVoteFors();

const renderThumbnailContainer = (nominees, heading, voteForsJson) => {
  $thumbnailContainer.insertAdjacentHTML('beforeend', `<h2 class="${heading.toLowerCase()}">${heading}:</h2>`);
  if(voteForsJson) {
    voteForsJson.map(voteFor => {
      const { name, count } = voteFor;
      const formattedName = name.replace(/_/g, ' ');
      const nomination = nominees.filter(nominee => nominee.name === formattedName)[0];
      const fragment = renderThumbnail(nomination, count);
      $thumbnailContainer.insertAdjacentHTML('beforeend', fragment);
    });
  } else {
    nominees.map((nomination) => {
      const fragment = renderThumbnail(nomination);
      $thumbnailContainer.insertAdjacentHTML('beforeend', fragment);
    });
  }
}

const renderThumbnail = (nomination, count) => {
  const {name, pictureUrl} = nomination;
  const inlineStyle = pictureUrl ? `background-image: url('${pictureUrl}')` : ``;
  const formattedName = `${name.replace(/\s/g,'_').trim()}`;
  return `
    <span style="position:relative;">
      <a href="#${formattedName}">
        <div style="${inlineStyle}" title="View ${name}" class="with-picture"></div>
        <p>${name} ${count ? `(${count})` : '' }</p>
      </a>
    </span>
  `;
}

const renderThumbnails = (pictureUrls) => {
  const $thumbnails = document.getElementById('thumbnails');
  pictureUrls.forEach(url => {
    const inlineStyle = `background-image: url('${url}')`;
    $thumbnails.insertAdjacentHTML('beforeend', `<div style="${inlineStyle}"></div>`);
  });
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

function sortByCount(json) {
  return json.sort((a, b) => {
    return b.count - a.count;
  });
}

function getVotes(voteForsJson) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText);

      const top40Nominees = getTop40Nominees(voteForsJson.splice(0, 40), json);
      const sortedTop40 = sortByName(top40Nominees);
      const pictureURLs = [];
      const data = sortedTop40.map(nominee => {
        const { name, jobTitle, company, pictureUrl } = nominee;
        pictureURLs.push(pictureUrl);
        return `${name} / ${jobTitle} / ${company}`;
      });
      console.info(data.join('\n'));

      var sortedNominations = sortByName(json);   
      const unpublishedNominees = sortedNominations.filter(nominee => !nominee.publish || nominee.publish === 'false');
      const publishedNominees = sortedNominations.filter(nominee => nominee.publish === 'true');
      renderThumbnailContainer(unpublishedNominees, 'Unpublished');
      // renderThumbnailContainer(publishedNominees, 'Published', voteForsJson);
      renderThumbnailContainer(publishedNominees, 'Published');
      nominees = unpublishedNominees.concat(publishedNominees);

      renderThumbnails(pictureURLs);
    }
  };
  xmlhttp.open('GET', voteUrl, true);
  xmlhttp.send();
}

function getVoteFors() {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText);
      var jsonSortedByCount = sortByCount(json);
      getVotes(jsonSortedByCount);
    }
  };
  xmlhttp.open('GET', voteForUrl, true);
  xmlhttp.send();
}

const getTop40Nominees = (top40Votes, nominees) => {
  const top40Names = top40Votes.reduce((accum, votesFor) => {
    accum.push(votesFor.name.replace(/_/g, ' '));
    return accum;
  }, []);
  return nominees.filter(nominee => top40Names.includes(nominee.name));
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