const xmlhttp = new XMLHttpRequest();
  
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var json = JSON.parse(this.responseText);
        debugger;
        // var keysSorted = Object.keys(json).sort(function(a,b){return json[a].voters.length - json[b].voters.length});   
        //  debugger;                                                           
        // keysSorted.reverse().forEach(function(key, index) {
        //     let html = `
        //       <tr>
        //         <th>${index + 1}) ${key} (${json[key].votes})</th>
        //       </tr>
        //       <tr>
        //         <td>
        //             ${json[key].voters.map(voter => voter.email).join('<br>')}
        //         </td>
        //       </tr>
        //     `;
        //     $content.insertAdjacentHTML('beforeend', html);
        // });
    }
  };
  xmlhttp.open("GET", "https://us-central1-stashed-online.cloudfunctions.net/vote", true);
  xmlhttp.send();