let UserCollection = [];

let DisplayCollection = [];

let weightFilter = 1;

(function(old) {
  $.fn.attr = function() {
    if(arguments.length === 0) {
      if(this.length === 0) {
        return null;
      }

      var obj = {};
      $.each(this[0].attributes, function() {
        if(this.specified) {
          obj[this.name] = this.value;
        }
      });
      return obj;
    }

    return old.apply(this, arguments);
  };
})($.fn.attr);

function gameFailureCallback(xhr, statusText, errorThrown ) {
  console.log('reason for failure2', statusText);
  console.log('her is xhr2', xhr);
  console.log('here is errorThrown2', errorThrown );
  if (statusText === "error") {
    $('.results-title').text("Error retrieving data from Boardgamegeek.com.  Try again in a moment.")
    if (this.tryCount <= this.retryLimit) {
        //try again
        $.ajax(this);
        return;
    }            
    return;
  }
  if (xhr.status == 500) {
      //handle error
  } else {
      //handle error
  }
};
/*
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
  }).fail(function(jqxhr, textStatus, error){
    console.log("failure response:", JSON.stringify(error));
    console.log('jqxhr is ', jqxhr);
    failureCallback(jqxhr, textStatus, error);
    });
};
*/


function renderResult (item) {
return `
  <li class="game-item">
    <h3 class="game-name">${item.name}</h3>
    <p class="year-designer">(2002) Trevor Noah</p>
    <div class="thumb-box">
      <img class="game-thumb" src="${item.thumbnail}" alt="${item.name}">
    </div>
    <div class="game-info-box">
      <div class="tab">
        <button class="tablinks active")">Description</button>
        <button class="tablinks videoTab" )">Video</button>
        <button class="tablinks")">Stats</button>
      </div>
    
      <div class="Description tabcontent">
        <p class="game-description short" >${item.shortDescription}</p>
        <p class="game-description full" hidden>${item.description}</p>
        <button class="desc-button">Full Description</button>
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
    </div>
  </li>
  `;
};



function displayResults(collection) {
  const results = collection.map(renderResult);
  $('.results-list').html("").append(results);
  if(collection.length === 1){
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



function filterWithNewInfo (collectionArray) {
  weightMax = weightFilter + .25;
  weightMin = weightFilter - .25;
  return collectionArray.filter(x=>x.weight<= weightMax && x.weight>= weightMin);
}



function getMoreGameInfo (array) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description, weight, and player poll results and appends it to object
  let idArray = array.map(x=>x.gameId);
  DisplayCollection = [];
  let settingsObject = {
      url: `https://www.boardgamegeek.com/xmlapi2/thing`,
      type: "GET",
      dataType: "xml",
      data: {
        id: idArray.join(','),
        stats: 1,
        videos: 1
      },
      success: function(data){
        displayResults( getSortedObjects(data, newGameObjectCreator, false) );
      },
      error: gameFailureCallback
  };
  $.ajax(settingsObject);
}



function newGameObjectCreator (index, xmlItem) {
  let game = {

    description: $(xmlItem).find("description").text(),
    shortDescription: $(xmlItem).find("description").text().slice(0,250) + "..." ,
    //game.playerPollResults = $(data).find("description").text();
    weight: Number($(xmlItem).find("averageweight").attr("value")),
    videoAddress: $(xmlItem).find('video').attr('link'),
    //this next bit feels like redundant code
    gameId: $(xmlItem).find("item").attr("id"),
    name: $(xmlItem).find('name').attr("value"),
    thumbnail : $(xmlItem).find('thumbnail').text(),
    minPlayers : Number($(xmlItem).find("minplayers").attr("value")),
    maxPlayers : Number($(xmlItem).find("maxplayers").attr("value")),
    playTime : Number($(xmlItem).find("playingtime").attr("value")),
    //game.rank = this.rankPrime;
    rank : Number($(xmlItem).find("rank").attr('value')),
  }
  if(game.videoAddress) {
    game.video = game.videoAddress.replace("watch?v=", "embed/");}
  ;
  return game
}

function gameObjectCreator (index, xmlItem) {
  //get individual xml item and create object
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



function getSortedObjects (xmlData, mapFunction, filter) {
  let $items = $(xmlData).find('items');
  let gameObjectList = $items.children().map(mapFunction);
  //gameObjectList is an object and needs to be an array to filter
  var newArray = $.map(gameObjectList, function(value, index) {return [value]});
  let filteredCollection = filter? filterByCollectionParameters(newArray,Number($('#playtime').val()),Number($('#player-number').val())) : filterWithNewInfo(newArray);
  let sortedCollection = filteredCollection.sort((a,b)=>a.rank - b.rank);
  return sortedCollection;
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
      getMoreGameInfo( getSortedObjects(data, gameObjectCreator, true) )
    }).fail(gameFailureCallback)
  });
}




function watchVideoClick () {
  $('.results-list').on('click', '.videoTab', function() {
    event.stopPropagation;
    let gameName = $(this).closest('li').find('img').attr('alt');
    let gameSearch = gameName + " Boardgame" + " rules";
    console.log(gameSearch);
    let vidLocation = $(this).closest('li').find('.Video');
    console.log(Boolean(vidLocation.children().length == 0));
    if(vidLocation.children().length == 0) {
      $.ajax({
        url: "https://www.googleapis.com/youtube/v3/search",
        type: "GET",
        dataType: "json",
        data: {
          q: gameSearch,
          part: 'snippet',
          key: "AIzaSyClprMiWtvCfmK4KKs5muX1SiaHEGDiKH8"
        },
        vidLocation: $(this).closest('li').find('.Video')
      }).done(function(data){
        let vidAddress = data.items[0].id.videoId;
        console.log(this.vidLocation);
        this.vidLocation.html(`<iframe width="420" height="315" src="https://www.youtube.com/embed/${vidAddress}"></iframe>`)
      })
    }
  });
}



function displayFullDescription () {
  $('.results-list').on('click','.desc-button', function() {
    if($(this).text()==="Full Description") {
      $(this).closest('li').find('.game-description.short').prop("hidden", true);
      $(this).closest('li').find('.game-description.full').prop("hidden", false);
      $(this).text("Short Description");
    } else {
      $(this).closest('li').find('.game-description.short').prop("hidden", false);
      $(this).closest('li').find('.game-description.full').prop("hidden", true);
      $(this).text("Full Description");    
    }
  })
}



function watchSlider () {
  let sliders = document.getElementsByClassName('slider')
  for (i=0; i< sliders.length; i++) {
    sliders[i].addEventListener("input", function(event) {
      // get id of label
      const labelID = $(this).attr('aria-labeled-by');
      // get value of range
      const rangeValue = $(this).val();
      //document.getElementById("#" + labelID).innerHTML = rangeValue
      // set label value to range value
      $("#" + labelID).text(rangeValue);
    })
  }
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
}



$(watchTabs);
$(watchSlider);
$(watchSubmit);
$(watchVideoClick);
$(displayFullDescription);