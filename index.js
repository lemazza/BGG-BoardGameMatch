
function renderResult (item) {
  console.log(item);
  console.log(item.description);
return `
      <li class="result-item">
        <h3 class="game-name">${item.name}</h3>
        <img src="${item.thumbnail}" alt="${item.name}">
        <p class="game-description">${item.description}</p>
      </li>
      `;
};



function displayResults(collection) {
const results = collection.map(renderResult);
$('.results-list').html("").append(results);
};



function filterAndSortCollection (collectionArray, timeFilter, playerFilter, difficultyFilter) {
  const newArray = collectionArray
                    .filter(x=> x.owned === true)
                    .filter(x=> x.isExpansion === false)
                    .filter(x=> x.playingTime <= timeFilter)
                    .filter(x=> x.minPlayers <= playerFilter && x.maxPlayers >= playerFilter)
                    .filter(x=> x.rank > 0)//maybe reinclude these games with more robust sort
                    .sort((a,b)=> a.rank - b.rank);
                   //still needs weight filter
                   console.log("newArray 2nd description = "+ newArray[1].description);
  return newArray;
};



function addMoreGameInfo (element) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description and player poll results and appends it to object
  $.getJSON(`https://bgg-json.azurewebsites.net/thing/${element.gameId}`, function(data) {
    element.description = data.description;
    element.playerPollResults = data.playerPollResults;
    //element.averageWeight = $.get('https://www.boardgamegeek.com/boardgame/164153', function(data) {
    //  $('.gameplay.li[3]').val();
 });
};



function handleResults (data) {
  //why can't I just have fullCollectionData  = my data.map expression??
  data.map(element => addMoreGameInfo(element));
  const fullCollectionData  = data;   

  const CollectionReadyForDisplay = filterAndSortCollection(fullCollectionData, this.maxTime, this.playerNum, this.diffLevel);
  console.log(CollectionReadyForDisplay);
  displayResults(CollectionReadyForDisplay);
};



function watchSubmit () {
  $('#query-form').submit(event => {
    event.preventDefault();
  
   bggUserinput = $('#bgg-user').val();
 

    //const query = {
     // owned: "1",
    //  maxPlayers: "2"
    //};
    //$.getJSON(`https://bgg-json.azurewebsites.net/collection/${bggUser}`, query, handleResults);

  $.ajax({
    url: `https://bgg-json.azurewebsites.net/collection/${bggUserinput}`,
    type: "GET",
    dataType: "json",
    bggUser: bggUserinput,
    maxTime: $('#playtime').val(),
    playerNum: $('#player-number').val(),
    diffLevel: $('#diff-level').val(),
    success: handleResults  
    })
  })
};



$(watchSubmit);