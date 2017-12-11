function addMoreGameInfo (element) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description and player poll results and appends it to element
  $.getJSON(`https://bgg-json.azurewebsites.net/thing/${element.gameId}`, function(data) {
    element.description = data.description;
    element.playerPollResults = data.playerPollResults;
    //element.averageWeight = $.get('https://www.boardgamegeek.com/boardgame/164153', function(data) {
    //  $('.gameplay.li[3]').val();
 //})
}

function handleResults (data) {
  //why can't I just have fullCollectionData  = my data.map expression??
  data.map(element => addMoreGameInfo(element));
  const fullCollectionData  = data;
  console.log(fullCollectionData);

  //console.log(diffLevel);
  console.log(maxTime);
  console.log(playerNum);

  filterData(fullCollectionData);
  sortData(fullCollectionData);
  displayResults(fullCollectionData);
}

function watchSubmit () {
  $('#query-form').submit(event => {
    event.preventDefault();
  
    const bggUser = $('#bgg-user').val();
    const maxTime = $('#playtime').val();
    const playerNum = $('#player-number').val();
    const diffLevel = $('#diff-level').val();
    console.log(diffLevel);
    const query = {
      owned: 1
    };
    $.getJSON(`https://bgg-json.azurewebsites.net/collection/${bggUser}`, query, handleResults)

  })
}



$(watchSubmit);
// renderResultHtml

// displayResults
//rules, youtube, amazon

// expandGameInfo
//loading image
//request extra data, make callback