# WeatherApp

Behind the intuition:

I created a weather app with two services:

1. Weather App
- allows users to search for current weather in specified location
- input tpes include Zip Code, GPS Coordinates, Town/City names
- allows "My Location" for weather in current location
- recents list on right controlled through MongoDB
    - location is created in recent list once user searches location
    - location is read once clicked on
    - update can be done by clicking on recent and editing through input fields, however, update will not directly apply to 
    location clicked and instead will make a new recent since this seemed like the better implementation
    - deletion through x marker
- weather info includes useful information about the weather that seems important to every day users and shows 5-day forecast
- background color adjusts to reflect mood of current condition
- export to JSON or PDF option

2. Weather History
- allows users to search for current weather in specified location, with given range
- since I had to make use of free API's the range follows these constraints
    - range only allows for start date no longer than 16 days ago and end date no later than today
    - range only goes for 7 days
- recents list similar to Weather App
- weather info now tries to incorporate useful information from summary of all days that users can interpret
- background color doesn't change since many conditions can be relevant
- export to JSON or PDF option

Notes:
- Google Maps has been incorporated in the code, but is commented out since I don't want to risk too many calls being made causing
my card to be charged. If unsure about where it would appear, it would appear in under the recents list, with the recents list being moved up.

How to run:
Website:
https://weather-app-ten-gamma-10.vercel.app

Locally:
- npm install 
- npm run dev
- open http://localhost:3000 in your browser
- most features won't work since they require API access, but link in form should be enough to run it
