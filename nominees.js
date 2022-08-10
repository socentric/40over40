const xmlhttp = new XMLHttpRequest();
let nominees = [];
const voteUrl = 'https://us-central1-stashed-online.cloudfunctions.net/vote';
const voteForUrl = 'https://us-central1-stashed-online.cloudfunctions.net/votefor';
getVoteFors();

const $thumbnailContainer = document.getElementById('thumbnailContainer');
const $detailContainer = document.getElementById('detailContainer');

function getVotes(voteForsJson) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText);
      // const top40Nominees = getTop40Nominees(voteForsJson.splice(0, 40), json);
      // const sortedNominations = sortByName(top40Nominees);   
      // const unpublishedNominees = sortedNominations.filter(nominee => !nominee.publish || nominee.publish === 'false');
      // const publishedNominees = sortedNominations.filter(nominee => nominee.publish === 'true');
      const unpublishedNominees = json.filter(nominee => !nominee.publish || nominee.publish === 'false');
      const publishedNominees = json.filter(nominee => nominee.publish === 'true');
      // renderThumbnailContainer(unpublishedNominees, 'Unpublished');
      renderThumbnailContainer(publishedNominees, 'Published', voteForsJson);
      // nominees = unpublishedNominees.concat(publishedNominees);
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
  return ``;
  // return !window.localStorage.getItem(formattedName) 
  //   ? `<button class="vote" onclick="vote(event);" data-name="${formattedName}">Vote</button>`
  //   : `<button class="vote voted" data-name="${formattedName}">Voted</button>`;
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

function sortByCount(json) {
  return json.sort((a, b) => {
    return b.count - a.count;
  });
}

const vote = (event) => {
  event.preventDefault;
  const element = event.srcElement;
  if (element.className.includes('voted')) {
    return false;
  }
  const name = element.dataset.name;
  const payload = {
    "name": name
  };

  element.innerText = 'Voted';
  document.querySelectorAll(`[data-name="${name}"]`).forEach(element => {
      element.className = 'vote voted';
  }); 

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        window.localStorage.setItem(name, 'true');
      } else {
        // Error
        alert('An error occurred with your vote, please try again');
        element.innerText = 'Vote';
        document.querySelectorAll(`[data-name="${name}"]`).forEach(element => {
          element.className = 'vote';
        }); 
      }
    }
  }
  
  xhr.open('POST', 'https://us-central1-stashed-online.cloudfunctions.net/votefor');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(payload));
  xhr.onloadend = function () {
    // done
  };
};