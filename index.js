const UserCollection = [];

const TempData = '<items totalitems="4" termsofuse="http://boardgamegeek.com/xmlapi/termsofuse" pubdate="Wed, 13 Dec 2017 19:31:43 +0000"><item objecttype="thing" objectid="31260" subtype="boardgame" collid="47571802"><name sortindex="1">Agricola</name><yearpublished>2007</yearpublished><stats minplayers="1" maxplayers="5" minplaytime="30" maxplaytime="150" playingtime="150" numowned="61658"><rating value="N/A"><usersrated value="51092"/><average value="8.03861"/><bayesaverage value="7.94123"/><stddev value="1.56252"/><median value="0"/><ranks><rank type="subtype" id="1" name="boardgame" friendlyname="Board Game Rank" value="15" bayesaverage="7.94123"/><rank type="family" id="5497" name="strategygames" friendlyname="Strategy Game Rank" value="15" bayesaverage="7.92355"/></ranks></rating></stats>  <status own="1" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="0" wishlist="0" preordered="0" lastmodified="2017-12-11 00:33:21"/><numplays>0</numplays></item><item objecttype="thing" objectid="178900" subtype="boardgame" collid="47571809"><name sortindex="1">Codenames</name><yearpublished>2015</yearpublished><stats minplayers="2" maxplayers="8" minplaytime="15" maxplaytime="15" playingtime="15" numowned="57721"><rating value="N/A"><usersrated value="36542"/><average value="7.83777"/><bayesaverage value="7.74049"/><stddev value="1.25618"/><median value="0"/><ranks><rank type="subtype" id="1" name="boardgame" friendlyname="Board Game Rank" value="35" bayesaverage="7.74049"/><rank type="family" id="5498" name="partygames" friendlyname="Party Game Rank" value="1" bayesaverage="7.77027"/></ranks></rating></stats><status own="1" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="0" wishlist="0" preordered="0" lastmodified="2017-12-11 00:33:47"/><numplays>0</numplays></item></items>'

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



function filterByCollectionParameters (collectionArray, timeFilter, playerFilter) {
  return collectionArray.filter(x=>x.playTime <= timeFilter 
                      && x.minPlayers <= playerFilter 
                      && x.maxPlayers >= playerFilter 
                      && x.rank > 0)
};

function addMoreGameInfo(data) {
    element.description = data.description;
    element.playerPollResults = data.playerPollResults;
    element.weight = data.weight
  };

function findMoreGameInfo (element) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description and player poll results and appends it to object
  $.ajax({
    url: `https://www.boardgamegeek.com/xmlapi2/thing`,
    type: "GET",
    dataType: "xml",
    data: {
      id: element.gameId
    },
    success:  function(data) {
    element.description = data.description;
    element.playerPollResults = data.playerPollResults;
    element.weight = data.weight
  }
 });
};

function gameObjectCreator (xmlItem) {
  //get individual xml item and create object and push it to usercollection
  let game= {
    gameId: $(xmlItem).attr("objectid"),
    name: $(xmlItem).find('name').text(),
    thumbnail: $(xmlItem).find('thumbnail').text(),
    minPlayers: $(xmlItem).find("stats").attr("minplayers"),
    maxPlayers: $(xmlItem).find("stats").attr("maxplayers"),
    playTime: $(xmlItem).find("stats").attr("playingtime"),
    rank: $(xmlItem).find("rank").attr('value')

  }
  UserCollection.push(game);
  return game;
}

function createGameArrayFromXML (xmlData) {
  const xmlDoc = $.parseXML( xmlData );
  const $xml = $( xmlDoc );
  const $items =$xml.find( "items" );
  return Array.from($items.children(),gameObjectCreator)
}

function handleResults (data) {
// Create object array from xml data
  var childrenArray = createGameArrayFromXML(data);
  console.log('children array ', childrenArray);
//filter array
  filteredArray = filterByCollectionParameters(childrenArray, this.maxTimeParameter, this.playerNumParameter)
  console.log('filtered array ', filteredArray);
//add info to games in array
  filteredArray.map(findMoreGameInfo);
//display array
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
      subtype: "boardgame",
      username: $('#bgg-user').val(),
      stats: 1,
      own: 1,
    },
    maxTimeParameter: $('#playtime').val(),
    playerNumParameter: $('#player-number').val(),
    diffLevelParameter: $('#diff-level').val(),
    success: handleResults  
    })
  })
};


$(handleResults(TempData));
$(watchSubmit);