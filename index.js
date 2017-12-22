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
    <h3 class="game-name">${item.name}</h3>
    <img src="${item.thumbnail}" alt="${item.name}">
    <div class="tab">
      <button class="tablinks active")">Description</button>
      <button class="tablinks videoTab" )">Video</button>
      <button class="tablinks")">Stats</button>
    </div>

    <div class="Description tabcontent display-video">
      <p class="game-description short" >${item.shortDescription}</p>
      <p class="game-description full" hidden>${item.description}</p>
    </div>

    <div class="Video tabcontent">
    </div>

    <div class="Stats tabcontent">
      <ul>
        <li>Rank: ${item.rank}</li>
        <li>Weight: ${item.weight}</li>
        <li>Player Count: ${item.minPlayers} - ${item.maxPlayers}</li>
        <li>Playing Time: ${item.playTime} minutes</li>
      </ul>
    </div>
  </li>
  `;
};



function displayResults(collection) {
  const results = collection.map(renderResult);
  $('.results-list').html("").append(results);
  if(collection.length = 1){
    var resultsHeading = "Result Found:"
  } else {
    var resultsHeading = "Results Found:"
  };
  $('.results-title').text(`${collection.length} ${resultsHeading}`);
  var descriptionsToClick = document.getElementsByClassName("active")
  for (i = 0; i < descriptionsToClick.length; i++) {
  descriptionsToClick[i].click();
  }
};



function filterByCollectionParameters (collectionArray, timeFilter, playerFilter) {
  return collectionArray.filter(x=>x.playTime <= timeFilter 
                      && x.minPlayers <= playerFilter 
                      && x.maxPlayers >= playerFilter 
                      && x.rank > 0);
};



function getMoreGameInfo (array) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description, weight, and player poll results and appends it to object
  DisplayCollection = [];
  let settingsObjects = array.map(function(element){
    return {
      url: `https://www.boardgamegeek.com/xmlapi2/thing`,
      type: "GET",
      dataType: "xml",
      data: {
        id: element.gameId,
        stats: 1,
        videos: 1
      },
      gameIdPrime: element.gameId,
      thumbnailPrime: element.thumbnail,
      minPlayersPrime: element.minPlayers,
      maxPlayersPrime: element.maxPlayers,
      playTimePrime: element.playTime,
      rankPrime: element.rank
    }
  });
  $.ajax.multiple(settingsObjects, function(elements){
    elements.forEach(function(data) {
      let game = {}
      game.description = $(data).find("description").text();
      game.shortDescription = $(data).find("description").text().slice(0,250) + `...<br><span class="more-description">[Click for full description]</span>`
      //game.playerPollResults = $(data).find("description").text();
      game.weight = Number($(data).find("averageweight").attr("value"));
      videoAddress = $(data).find('video').attr('link');
      if(videoAddress) {
      game.video = videoAddress.replace("watch?v=", "embed/");}
      //this next bit feels like redundant code
      game.gameId = $(data).find("item").attr("id"),
      game.name = $(data).find('name').attr("value");
      game.thumbnail = $(data).find('thumbnail').text();
      game.minPlayers = Number($(data).find("minplayers").attr("value"));
      game.maxPlayers = Number($(data).find("maxplayers").attr("value"));
      game.playTime = Number($(data).find("playingtime").attr("value"));
      //game.rank = this.rankPrime;
      game.rank = Number($(data).find("rank").attr('value'));
      DisplayCollection.push(game);
      DisplayCollection.sort((a,b)=>(a.rank - b.rank));
    });
    weightMax = weightFilter + .25;
    weightMin = weightFilter - .25;
    finalCollection = DisplayCollection.filter(x=>x.weight<= weightMax
                              &&x.weight>= weightMin);
    displayResults(finalCollection);
  });
};



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



function watchSubmit () {
  $('#query-form').submit(event => {
    event.preventDefault();
    UserCollection = [];
    DisplayCollection = [];
    weightFilter = Number($('#diff-level').val());
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
  $('.results-list').on('click', '.videoTab', function() {
    event.stopPropagation;
    gameName = $(this).closest('li').find('img').attr('alt');
    gameVidAddress = DisplayCollection.find(x=>x.name===gameName).video;
    $(this).closest('li').find('.Video').html(
      `<iframe width="420" height="315" src="${gameVidAddress}"></iframe>`)
  })
};



function displayFullDescription () {
  $('.results-list').on('click','.game-description', function() {
    if($(this).hasClass('full')) {
      $(this).closest('li').find('.game-description.short').prop("hidden", false);
    } else {
      $(this).closest('li').find('.game-description.full').prop("hidden", false);
    }
    $(this).prop("hidden", true);
  })
}



function watchSlider () {
  $('input[type="range"]').change(function(event) {
// get id of label
const labelID = $(this).attr('aria-labeled-by');
// get value of range
const rangeValue = $(this).val();
// set label value to range value
$("#" + labelID).text(rangeValue);
  })
}



function watchTabs() {
  $('.results-list').on('click', '.tablinks', function(event){
    // Get all elements with class="tabcontent" and hide them
    $(this).closest('li').find('.tabcontent').prop("hidden", true);
    

    // Get all elements with class="tablinks" and remove the class "active"
    $(this).siblings().removeClass("active");
    

    // Show the current tab, and add an "active" class to the button that opened the tab
    var tabType = "." + $(this).text();
    $(this).closest('li').find(tabType).prop("hidden", false);
    $(this).addClass("active");
  });
};



$(watchTabs);
$(watchSlider);
$(watchSubmit);
$(watchMoreInfoClick);
$(displayFullDescription);