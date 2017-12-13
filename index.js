const UserCollection = [];



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
                    .filter(x=> x.owned === true 
                      && x.isExpansion === false 
                      && x.playingTime <= timeFilter 
                      && x.minPlayers <= playerFilter 
                      && x.maxPlayers >= playerFilter 
                      && x.rank > 0)//maybe reinclude these games with more robust sort
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
  //data.map(element => addMoreGameInfo(element));
  //const fullCollectionData  = data;   
  console.log(data);
  const xmlDoc = $.parseXML( data );
  const $xml = $( xmlDoc );
  const $items =$xml.find( "items" );
  console.log('here are items: ', $items);
  $items.children().each(function(x){
    console.log("this is this: ", this)
  })
  //docItems = document.getElementById("item");
 // docItems.innerHTML = xmlDoc.getElementsByTagName("name").getAttribute('value');
  //const CollectionReadyForDisplay = filterAndSortCollection(fullCollectionData, this.maxTime, this.playerNum, this.diffLevel);
  //console.log(CollectionReadyForDisplay);
  //displayResults(CollectionReadyForDisplay);
};



function watchSubmit () {
  $('#query-form').submit(event => {
    event.preventDefault();
  
   bggUserName = $('#bgg-user').val();
 
  $.ajax({
    url: `https://www.boardgamegeek.com/xmlapi2/collection`,
    type: "GET",
    dataType: "xml",
    subtype: "boardgame",
    data: {
    username: $('#bgg-user').val(),
    stats: 1,
    own: 1,
    },
    maxTime: $('#playtime').val(),
    playerNum: $('#player-number').val(),
    diffLevel: $('#diff-level').val(),
    success: handleResults  
    })
  })
};



$(watchSubmit);