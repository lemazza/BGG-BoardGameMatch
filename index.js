let weightFilter = 1;


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



function renderResult (item) {
  
return `
  <li class="game-item" aria-labelledby="game-${item.gameId}" aria-describedby="desc-${item.gameId}">
    <h3 id="game-${item.gameId}" class="game-name" data-game-id="${item.gameId}">${item.name}</h3>
    <p class="year-designer"><span class="game-year">(${item.year})</span> <span class="game-designer">${item.designer}<span></p>
    <div class="thumb-box">
      <img class="game-thumb" src="${item.thumbnail}" alt="${item.name}">
    </div>
    
      <div class="tab">
        <button class="tablinks active")">Description</button>
        <button class="tablinks videoTab" )">Video</button>
        <button class="tablinks")">Stats</button>
      </div>
    <div class="game-info-box">
      <div id="desc-${item.gameId}" class="Description tabcontent">
        <p class="game-description short" >${item.shortDescription}</p>
        <p class="game-description full" hidden>${item.description}</p>
        <button class="desc-button">Full Description</button>
      </div>

      <div class="Video tabcontent">
      </div>

      <div class="Stats tabcontent">
        <ul>
          <li><span class="stat-type">BGG Rank:</span> ${item.rank}</li>
          <li><span class="stat-type">Recommendation score:</span> ${(item.bayesAve*(2+item.pollValue)).toFixed(2)}</li>
          <li><span class="stat-type">Recommendation %:</span> ${(item.pollValue*100).toFixed(1)}</li>
          <li><span class="stat-type">Difficulty Level:</span> ${(item.weight).toFixed(2)}</li>
          <li><span class="stat-type">Player Count:</span> ${item.minPlayers} - ${item.maxPlayers}</li>
          <li><span class="stat-type">Playing Time:</span> ${item.playTime} minutes</li>
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
  weightMax = weightFilter + .3;
  weightMin = weightFilter - .3;
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
  $.ajax(settingsObject)
}



function findPollScore (pollXml, playerNum) {
  // return % of positive results for playerNum
  let voteNode = $(pollXml[playerNum-1]).children();
  let bestVotes = Number($(voteNode[0]).attr("numvotes"));
  let recVotes = Number($(voteNode[1]).attr("numvotes"));
  let nrVotes = Number($(voteNode[2]).attr("numvotes"));

  return (bestVotes+recVotes)/(bestVotes+recVotes+nrVotes);
}



function newGameObjectCreator (index, xmlItem) {
  let designers=$(xmlItem).find('link[type="boardgamedesigner"]');
  let designerArray = $.map(designers, function(value, index) {return [$(value).attr("value")]});
  let designerText = "Designer: ";
  if(designerArray.length > 1) designerText = "Designers: ";

  let game = {
    designer: designerText + designerArray.join(', '),
    year: $(xmlItem).find("yearpublished").attr("value"),
    description: $(xmlItem).find("description").text(),
    shortDescription: $(xmlItem).find("description").text().slice(0,250) + "..." ,
    playerPollResults: $(xmlItem).find('poll[name="suggested_numplayers"]').children(),
    bayesAve: Number($(xmlItem).find("bayesaverage").attr("value")),
    weight: Number($(xmlItem).find("averageweight").attr("value")),
    //this next bit feels like redundant code
    gameId: $(xmlItem).attr("id"),
    name: $(xmlItem).find('name').attr("value"),
    thumbnail : $(xmlItem).find('thumbnail').text(),
    minPlayers : Number($(xmlItem).find("minplayers").attr("value")),
    maxPlayers : Number($(xmlItem).find("maxplayers").attr("value")),
    playTime : Number($(xmlItem).find("playingtime").attr("value")),
    rank : Number($(xmlItem).find("rank").attr('value')),
  };

  pollResult = findPollScore(game.playerPollResults, Number($('#player-number').val()));
  if (isNaN(pollResult)) {
    game.pollValue = .4;
  } else {
    game.pollValue = pollResult;
  }
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
 
  if(filter) {
    filteredCollection.sort((a,b)=>a.rank - b.rank);
  } else {
    filteredCollection.sort((a,b)=>(b.bayesAve*(2+b.pollValue))-(a.bayesAve*(2+a.pollValue)));
  }
  return filteredCollection;
}



function watchSubmit () {
  $('#query-form').submit(event => {
    event.preventDefault();
    console.log('submit pressed')
    weightFilter = Number($('#diff-level').val());
    $('.results-title').text("Finding Games");
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
    let vidLocation = $(this).closest('li').find('.Video');
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
      const labelID = $(this).attr('aria-labelledby');
      // get value of range
      const rangeValue = $(this).val();
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

$(document).on({
    ajaxStart: function() { 
      $(".loading").prop("hidden", false);
      $('button[type="submit"]').prop("disabled", true);
    },
     ajaxStop: function() { 
      $(".loading").prop("hidden", true);
      $('button[type="submit"]').prop("disabled", false);
    }    
});

$(watchTabs);
$(watchSlider);
$(watchSubmit);
$(watchVideoClick);
$(displayFullDescription);