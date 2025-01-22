# WeatherApp

Behind the intuition:

I created a weather app that utilizes two different APIs for different types of services. The main "Weather App" allows users to 
search for the current weather in a specified location. The input takes Zip Code, GPS Coordinates, and Town/City names. It also
allows users to select "My Location" to see the weather in their current location. Then the recents list populates on the right side 
of the page allowing users to delete recents or check their recents. Useful weather information will be shown along with a 5-day forecast.
The database used is MongoDB and is not on a per user basis.

Then, the "History" text can be clicked to take users to a different page that now allows users to enter a date range. Since free API's
were limited, users can only check for weather information in a specific location in a range of 7 days. The start date can't be farther than
16 days ago and the end date can't be lated than today. The recents list also populates similarly, now with the date range being shown as well.
Rather than an update feature, I allow the users to click on a recent location they want and populate the respective fields allowing users
to change the date range or location, but this new search stores as a new recent search.