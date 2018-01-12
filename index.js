let weightFilter = 1;


function failureCallback(xhr, statusText, errorThrown ) {
  console.log('failur status:', statusText);
  console.log('here is xhr:', xhr);
  console.log('here is errorThrown:', errorThrown );
  if (statusText === "error") {
    $('#results-title').text("Error retrieving data from Boardgamegeek.com.  Try again in a moment.")
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
    <header>
      <h3 id="game-${item.gameId}" class="game-name" data-game-id="${item.gameId}">${item.name}</h3>
      <p class="year-designer"><span class="game-year">(${item.year})</span> <span class="game-designer">${item.designer}<span></p>
    </header>

    <div class="thumb-box">
      <img class="game-thumb" src="${item.thumbnail}" alt="${item.name}">
    </div>

    <div class="game-info-box">
      <div role="tablist" class="tab">
        <button role="tab" class="tablinks active")">Description</button>
        <button role="tab" class="tablinks videoTab" )">Video</button>
        <button role="tab" class="tablinks")">Stats</button>
      </div>

      <div role="tabpanel" id="desc-${item.gameId}" class="Description tabcontent">
        <p class="game-description short" >${item.shortDescription}</p>
        <p class="game-description full" hidden>${item.description}</p>
        <button class="desc-button">Full Description</button>
      </div>

      <div role="tabpanel" class="Video tabcontent">
      </div>

      <div role="tabpanel" class="Stats tabcontent">
        <dl>
          <dt>BGG Rank:</dt>
          <dd> ${item.rank}</dd>

          <dt>Recommendation score:</dt> 
          <dd>${(item.bayesAve*(2+item.pollValue)*100/24).toFixed(1)}</dd>

          <dt>Recommendation %:</dt>
          <dd>${(item.pollValue*100).toFixed(1)}</dd>

          <dt>Difficulty Level:</dt>
          <dd>${(item.weight).toFixed(2)}</dd>

          <dt>Player Count:</dt>
          <dd>${item.minPlayers} - ${item.maxPlayers}</dd>

          <dt>Playing Time:</dt> 
          <dd>${item.playTime} minutes</dd>
        </dl>
      </div>
    </div>
  </li>
  `;
};



function displayResults(collection) {
  // takes a collection array, renders each item into html ready for display and appends them to the result list
  const results = collection.map(renderResult);
  $('.results-list').html("").append(results);

  if(collection.length === 1){
    var resultsHeading = "Result Found:"
  } else {
    var resultsHeading = "Results Found:"
  };
  $('#results-title').text(`${collection.length} ${resultsHeading}`);
  //clicks each description tab to make those the first to display
  var descriptionsToClick = document.getElementsByClassName("active")
  for (i = 0; i < descriptionsToClick.length; i++) {
  descriptionsToClick[i].click();
  }
};



function filterByCollectionParameters (collectionArray, timeFilter, playerFilter) {
  //filters the collection by number of players
  return collectionArray.filter(x=>x.playTime <= timeFilter 
                      && x.minPlayers <= playerFilter 
                      && x.maxPlayers >= playerFilter 
                      && x.rank > 0);
};



function filterWithNewInfo (collectionArray) {
  //filters the collection array by game weight
  weightMax = weightFilter + .3;
  weightMin = weightFilter - .3;
  return collectionArray.filter(x=>x.weight<= weightMax && x.weight>= weightMin);
}



function getMoreGameInfo (array) {
  //given a gameId, this function searches for that "thing" and returns its 
  //description, weight, player poll results, and other descriptive information not found in the collectoin api
  $('#results-title').text(`Retrieving more game information`)
  console.log(array);
  let idArray = array.map(x=>x.gameId);
  console.log('idArray is', idArray);
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
        console.log('success data', data);
        displayResults( getSortedObjects(data, newGameObjectCreator, false) );
      },
      error: failureCallback
  };
  $.ajax(settingsObject)
}



function findPollScore (pollXml, playerNum) {
  // return % of positive results for how BGG users liked a game with (playerNum) many players
  let voteNode = $(pollXml[playerNum-1]).children();
  let bestVotes = Number($(voteNode[0]).attr("numvotes"));
  let recVotes = Number($(voteNode[1]).attr("numvotes"));
  let nrVotes = Number($(voteNode[2]).attr("numvotes"));

  return (bestVotes+recVotes)/(bestVotes+recVotes+nrVotes);
}



function newGameObjectCreator (index, xmlItem) {
  //takes and xmlItem in and produces a game object.  This one is intended for the second pass with more info
  
  //the designer of a game could be one or multiple people, this goes through to make either ready to display
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

  //not all games have had enough users play them to have poll results.  This puts in an (admittedly arbitrary) number as the value when that's the case.
  pollResult = findPollScore(game.playerPollResults, Number($('#player-number').val()));
  if (isNaN(pollResult)) {
    game.pollValue = .4;
  } else {
    game.pollValue = pollResult;
  }
  return game
}



function gameObjectCreator (index, xmlItem) {
  //get individual xml item and create game object.  This is for the first pass of a user's collection.  Name isn't necessary, but was useful for debugging.
  //the others are useful for filtering out games before the second ajax call.
  let game= {
    gameId: $(xmlItem).attr("objectid"),
    name: $(xmlItem).find('name').text(),
    minPlayers: Number($(xmlItem).find("stats").attr("minplayers")),
    maxPlayers: Number($(xmlItem).find("stats").attr("maxplayers")),
    playTime: Number($(xmlItem).find("stats").attr("playingtime")),
    rank: Number($(xmlItem).find("rank").attr('value')),
  }
  return game;
}



function getSortedObjects (xmlData, mapFunction, filter) {
  //this takes in xmlData from the ajax call and turns it into a filtered and sorted array.
  console.log(xmlData);
  $('#results-title').text(`Sorting collection for display`)
  let $items = $(xmlData).find('items');
  console.log('items are', $items);
  let gameObjectList = $items.children().map(mapFunction);
  //gameObjectList is an object and needs to be an array to filter
  var newArray = $.map(gameObjectList, function(value, index) {return [value]});
  let filteredCollection = filter? filterByCollectionParameters(newArray,Number($('#playtime').val()),Number($('#player-number').val())) : filterWithNewInfo(newArray);
 
  if(filter) {
    filteredCollection.sort((a,b)=>a.rank - b.rank);
  } else {
    //incorporates info from the player poll to sort and rank the games.  So, for instance..
    // a highly rated game that happens to not be as fun for 2 players (Codenames for example) won't be highly recommended for 2 players.
    filteredCollection.sort((a,b)=>(b.bayesAve*(2+b.pollValue))-(a.bayesAve*(2+a.pollValue)));
  }
  return filteredCollection;
}


function newSearch() {
  $('#newSearch').click(event =>{
    console.log('it works');
    $('form').prop('hidden', false);
    $('#search-summary').prop('hidden', true)
  })
}



function formCollapse() {
  $('#query-form').submit(event =>{
    event.preventDefault();
    $('form').prop('hidden', true);
    let collectionName = "Top 500 Games"
    let searchType = $('input[name="searchType"]:checked').val()
    if (searchType != "topGames") {
      collectionName = $('#bgg-user').val() + "'s collection"
    }
    $('#search-summary').prop('hidden', false)
    $('#search-summary p').html(`Searching <strong>${collectionName}</strong> for <strong>${$('#player-number').val()} player</strong> games with a <strong>${$('#diff-level').val()} difficulty</strong> and maximum length of <strong>${$('#playtime').val()} minutes</strong>`);
    newSearch();
  })
}



function watchSubmit () {
  //watches for the form submit, preforms and ajax call on a bgg user's collection.
  $('#query-form').submit(event => {
    event.preventDefault();
    weightFilter = Number($('#diff-level').val());
    let searchType = $('input[name="searchType"]:checked').val()
    $('#results-title').text("Finding Games").focus();
    $('.results-list').html("");
    if (searchType != "topGames") {  
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
      }).fail(failureCallback)
    } else if (topGameIDs.length>0) {
      getMoreGameInfo(topGameIDs);
    } else {
      getTopGames();
    }
  });
}




function watchVideoClick () {
  //looks for click on the video tab, searches youtube for a rules video with that boardgame name.  Displays the first result.
  $('.results-list').on('click', '.videoTab', function() {
    event.stopPropagation;
    let gameName = $(this).closest('li').find('img').attr('alt');
    let gameSearch = gameName + " board game" + " rules";
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
  //opens and closes longer description of each game.
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
  //update for range slider display values as they move
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
  //watches for clicks on the game Description, Rules, or Video tabs and displays content.
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

const topGameIDs = [];

function parseBGGPage (site) {
  return $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/' + site,
    type: "GET",
    dataType: "html",
    success: function (data) {
      const bggPage = $('<div></div>');
      bggPage.html(data);
      const bggAnchors = bggPage.find('[id*="results_objectname"]').children('a');
      $.each(bggAnchors, function(index, elem){
        let hrefElement = String(elem);
        let slashIndex = hrefElement.indexOf('/', 21);
        let bggGameId = hrefElement.slice(21, slashIndex);
        let gameObj = {gameId: bggGameId}
        topGameIDs.push(gameObj);
      });
     $('#results-title').text(`Collecting Games: ${topGameIDs.length/5}%`)

    },
  });

}



function getTopGames () {
  let promiseArray = []
  for (let i = 1; i<= 5; i++){
    let ajaxCall = parseBGGPage('https://www.boardgamegeek.com/browse/boardgame/page/' + i)
    promiseArray.push(ajaxCall);
  }
  Promise.all(promiseArray).then(function() {
    getMoreGameInfo(topGameIDs);
  });
}



$(document).on({
  //displays "loading" gif after form submission, removes ability to resubmit form until after results return.
    ajaxStart: function() { 
      $(".loading").prop("hidden", false);
      $('button[type="submit"]').prop("disabled", true);
    },
     ajaxStop: function() { 
      $(".loading").prop("hidden", true);
      $('button[type="submit"]').prop("disabled", false);
    }    
});


//$(watchTopGames);
$(formCollapse);
$(watchTabs);
$(watchSlider);
$(watchSubmit);
$(watchVideoClick);
$(displayFullDescription);