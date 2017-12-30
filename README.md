# BGG-BoardGameSelector
# Images
![BoardGameSelector on load](https://user-images.githubusercontent.com/32402365/34391328-c075fcae-eaf9-11e7-9fb5-34612f8c2739.png)
![The games](https://user-images.githubusercontent.com/32402365/34391330-c08ef5e2-eaf9-11e7-8927-1ed1ebf3a793.png)
![More game info](https://user-images.githubusercontent.com/32402365/34391331-c0d93c74-eaf9-11e7-8e30-4106f18184e9.png)

# Summary
I work at a boardgame cafe. It's basically a restaurant with a large library of games(over 1400) that people can play for a small cover fee.
Often times in my job, customers will ask me to recommend games for them to play. I'm fairly knowledgable about games, so
I usually have at least a few I can suggest depending on the number of players in their group, how light or heavy a game they want
to play and how much time they have.  I'm usually also able to help give an overview of the rules.

As I'll hopefully be leaving the cafe to start a career as a web developer, I thought it would be useful to make an app to replace me.
One that could sortthrough a collection of games and return good options for users.  

The Board Game Selector offers a form for users to choose the Collection they want to search for, and then parameters for number of players, 
difficulty level, and time.  User Collection is tied to a person's boardgamegeek.com username.  Boardgamegeek.com is the central hub 
for the tabletop gaming hobby and contains a well maintained database of games.  Among other useful things there, users can log which games
they own.

In practice, at the cafe this app would only be needed to search our collection and could be displayed like a library kiosk, but the added functionality of searching for a specific user makes the app
more useful for other folks with large collections.

After submitting the form a list of games will be returned.  Each game has a description, some other descriptive information, and a video rules explanation, because its much easier to learn a game when it's taught by someone who's played it before.

#Tech used
HTML, CSS, Javascript, jQuery.  With a special extra attention the use of ajax.

#How it works

After form submission, There's and ajax call to the Boardgamegeek User Collection API using the bgg username suplied.  It filters out games that don't meet the specified number of players, then it makes an ajax call to the BGG "Thing" API (which has broader information about each game than the Collection API does) with every game in the user collection that passes the first filter.  Then game objects are created with information from the Thing API.  It filters out games that aren't of the appropriate weight (or difficulty level), and sorts and displays them by their reccomendation score (wich is a weighted average of their BGG user score and the bgg polling have how many people like a game with a certain number of players).
