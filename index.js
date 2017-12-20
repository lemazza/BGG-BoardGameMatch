let UserCollection = [];

let DisplayCollection = [];

let weightFilter = 1;

if(typeof $ !== 'undefined' && $.ajax) $.ajax.multiple = function(requests, responseCallback, failureCallback){
  const responseObjects = [];
  // $.when() will take any number of promises as arguments, and trigger a callback function when all the promises complete.
  // But first we must translate our URLs or settings objects into actual $.ajax request promises (deferreds).
  // And before we call ajax, we need to add a failure function to catch 404 not found errors which would otherwise stop the whole batch.
  const handle404 = function(error, ){
    
  }
  const promises = requests.map(x=>$.ajax(x));
  
  // Since we want to accept an array of an arbitrary number of promises, we use Function.prototype.apply() to call the function using an array to populate the arguments list rather than having to name the arguments one at a time.
  return $.when.apply(this, promises).then(function(){
    
    // translate "array-like" `arguments` object into an actual array so our clients can use array methods on the response
    for( let i=0; i < arguments.length; i++ ){
      let response = arguments[i];
      if( Array.isArray(response) ){ response = response[0]; }
      responseObjects.push(response);
    }
    // Once all arguments have been pushed onto our array, we can pass it to the provided callback function.
    responseCallback(responseObjects);
  }).fail(function(error){
    console.log("failure response:", JSON.stringify(error));
  });
}



function renderResult (item) {
return `
      <li class="result-item">
        <h3 class="game-name">#${item.rank}: ${item.name}</h3>
        <img src="${item.thumbnail}" alt="${item.name}">
        <p class="game-description short">${item.shortDescription}</p>
        <button class="display-more-info">More Information</button>
        <div class="extra-info" hidden>
        </div>
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
                      && x.rank > 0);
};



function addMoreGameInfo(data) {
    element.description = data.description;
    element.playerPollResults = data.playerPollResults;
    element.weight = data.weight
  };



function getMoreGameInfo (array) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description, weight, and player poll results and appends it to object
  console.log('array is ', array);
  let settingsObjects = array.map(function(element){
    return {
      url: `https://www.boardgamegeek.com/xmlapi2/thing`,
      type: "GET",
      dataType: "xml",
      data: {
        id: element.gameId,
        stats: 1,
        videos: 1
      }
    }
  });
  $.ajax.multiple(settingsObjects, function(elements){
    console.log('elements inside ajax multiple', elements);
    elements.forEach(function(data){
      console.log('element is ', element)
      element.description = $(data).find("description").text();
      element.shortDescription = $(data).find("description").text().slice(0,250) + "..."
      //element.playerPollResults = $(data).find("description").text();
      element.weight = $(data).find("averageweight").attr("value");
      videoAddress = $(data).find('video').attr('link');
      element.video = videoAddress.replace("watch?v=", "embed/");
    
      console.log('wf is now ', weightFilter);
      DisplayCollection.filter(x=>x.weight<= weightFilter +.25
                                &&x.weight>= weightFilter -.25)
      displayResults(DisplayCollection);
    });
  });
}



function gameObjectCreator (index, xmlItem) {
  //get individual xml item and create object and push it to usercollection
  let game= {
    gameId: $(xmlItem).attr("objectid"),
    name: $(xmlItem).find('name').text(),
    thumbnail: $(xmlItem).find('thumbnail').text(),
    minPlayers: Number($(xmlItem).find("stats").attr("minplayers")),
    maxPlayers: Number($(xmlItem).find("stats").attr("maxplayers")),
    playTime: Number($(xmlItem).find("stats").attr("playingtime")),
    rank: Number($(xmlItem).find("rank").attr('value')),
  }
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
  console.log(data);
  let childrenArray = createGameArrayFromXML(data);
  console.log('children array ', childrenArray);
  console.log('UserCollection is ', UserCollection);
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
    UserCollection = [];
    DisplayCollection = [];
    weightFilter = $('#diff-level').val();
    (console.log('weight filter is ', weightFilter));
    $('.results-list').html("");
    $.ajax({
      url: 'https://www.boardgamegeek.com/xmlapi2/collection',
      type: "GET",
      dataType: "xml",
      data: {
        username: $('#bgg-user').val(),
        stats: 1,
        own: 1
        },
      maxTimeParameter: $('#playtime').val(),
      playerNumParameter: $('#player-number').val(),
      diffLevelParameter: $('#diff-level').val(),
    }).done(function(data) {
      let $items = $(data).find('items');
      let gameObjectList = $items.children().map(gameObjectCreator)
      //gameObjectList is an object and needs to be an array to filter
      var newArray = $.map(gameObjectList, function(value, index) {return [value]});
      let filteredCollection = filterByCollectionParameters(newArray,Number($('#playtime').val()),Number($('#player-number').val()));
      let sortedCollection = filteredCollection.sort((a,b)=>a.rank - b.rank);
      getMoreGameInfo(sortedCollection)
    })
  });
}

function watchMoreInfoClick () {
  $('.results-list').on('click', '.display-more-info', function() {
    event.stopPropagation;
    $(this).closest('li').find('.extra-info').toggle();
    gameName = $(this).closest('li').find('img').attr('alt');
    gameVidAddress = DisplayCollection.find(x=>x.name===gameName).video;
    $(this).closest('li').find('.extra-info').html(
      `<iframe width="420" height="315" src="${gameVidAddress}"></iframe>`)
  })
};

function displayFullDescription () {
  $('.results-list').on('click','.game-description', function() {
    gameName = $(this).closest('li').find('img').attr('alt');
    fullDescription = DisplayCollection.find(x=>x.name===gameName).description;
    shortDescription = DisplayCollection.find(x=>x.name===gameName).shortDescription;
    descriptionArea = $(this).closest('li').find('.game-description');
    console.log(descriptionArea.text());
    console.log(shortDescription);
    (descriptionArea.text() === (shortDescription) )? descriptionArea.text(fullDescription) : descriptionArea.text(shortDescription);
  })
}









//$(handleResults(TempData));
$(watchSubmit);
$(watchMoreInfoClick);
$(displayFullDescription);