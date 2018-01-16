# BGG-BoardGameSelector
# Images
![the main screen with form](https://user-images.githubusercontent.com/32402365/34983623-067703ba-fa63-11e7-8e14-7a26df637121.png)
![results list showing descriptions by default](https://user-images.githubusercontent.com/32402365/34983633-100f6ca0-fa63-11e7-86ed-14db19ccdba5.png)
![example of video and stats tabs](https://user-images.githubusercontent.com/32402365/34983637-129bebc4-fa63-11e7-8a82-a37b2fa38c01.png)


# Summary
I work at a boardgame cafe. It's basically a restaurant with a large library of games(over 1400) that people can play for a small cover fee.
Often times in my job, customers will ask me to recommend games for them to play. I'm fairly knowledgable about games, so
I usually have at least a few I can suggest depending on the number of players in their group, how light or heavy a game they want
to play and how much time they have.  I'm usually also able to help give an overview of the rules.

As I'll hopefully be leaving the cafe to start a career as a web developer, I thought it would be useful to make an app to replace me.
One that could sortthrough a collection of games and return good options for users.  

The Board Game Selector offers a form for users to choose the Collection they want to search for, and then parameters for number of players, 
difficulty level, and time.  User Collection is tied to a person's boardgamegeek.com username.  Boardgamegeek.com is the central hub 
for the tabletop gaming hobby and contains a well maintained database of games.  Among other useful things there, users can log which games they own.

In practice, at the cafe this app would only be needed to search our collection and could be displayed like a library kiosk, but the added functionality of searching for a specific user makes the app more useful for other folks with large collections.

I've included a Top 1,000 games list to search from by default.  This is based on a cached array that I've stored in the code.  Once I figure out server side and database management things, I'll store that information differently.

After submitting the form a list of games will be returned.  Each game has a description, some other descriptive information, and a video rules explanation, because its much easier to learn a game when it's taught by someone who's played it before.

# Tech used
HTML, CSS, Javascript, jQuery.  With a special extra attention the use of ajax.

# How it works

After form submission, There are basically 3 options.  

Option 1: The client is seaching the Top 1000 games.  
  The array of Top1000 is filtered based on the client parameters, sorted and displayed.

Option 2: The client is searching a bgg user name for the first time.
  An ajax call is done to the Boardgamegeek User Collection API which is then convereted to an array of games with some basic information.  Each game from that array is compared to a global array called ALLGAMES which starts with the full information of each game in the Top1000, and gets more games as users search new ones.  The original array is split in 2 at this point.  One half is all the games that already exist with full information in cached form, and the other is just a series of game Id's which will be filtered and sent off for another ajax call to get the full information.  When that call returns both arrays are joined again, and will be filtered sorted and displayed.
  
  Option 3:  The client is searching for a bgg user name they've previously searched.
    The previous search cached the data from the original ajax call, meaning that won't be necessary.  The second call for more game information may still be necessary, but it will be shorter than before.

Games are always displayed by a rank based on my own weighted average of the game's BGG user score and the bgg polling of how many people like a game with a certain number of players.  This returns more accurate results than simply relying on rank or the average.  And helps reduce the value of games that are otherwise great, but unfun at certain player counts.
