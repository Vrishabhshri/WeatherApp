'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { calcIconFromCondition, isZipCode, isCoords, exportJSON, exportPDF } from '@/utils/pageFunctions';

export default function Home() {

  // Variables for storing states
  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])
  const [recents, setRecents] = useState<any>([]);
  // const [savedLat, setSavedLat] = useState<number>(0);
  // const [savedLon, setSavedLon] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState("json");

  // Router and API Keys
  const router = useRouter();
  const OWAPIKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  // const GoogleAPIKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // Special widgetboxes tailwind to avoid d.r.y. code
  const widgetBoxes = `border border-2 border-black rounded-lg 
                      w-full sm:w-40 md:w-44 lg:w-48 xl:w-52 h-24
                      sm:text-xs md:text-sm lg:text-base xl:text-lg
                      flex items-center justify-center 
                      transition-all duration-200
                      hover:bg-gray-400 hover:scale-105`;

  // Changing input bar every time user inputs or delets number, also loading suggestions based on user input so far
  const handleInputBarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const input = e.target.value;
    setLocation(input);

    if (input.trim() === '') {
      setSuggestions([])
      return
    }

    try {

      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
        params: { q: input, limit: 3, appid: OWAPIKey }
      });
      setSuggestions(response.data)

    }
    catch (error) {

      console.error('Error fetching suggested locations:', error)

    }

  }

  // Handling search call to find weather info
  const handleSearch = async (clickedLocation?: any) => {

    let selectedLocation;

    // Location has been clicked from suggestions list
    if (typeof clickedLocation !== "string") {

      selectedLocation = `${clickedLocation.lat},${clickedLocation.lon}`;
      setLocation(clickedLocation.name + ', ' + clickedLocation.state + ', ' + clickedLocation.country);

    }
    // Location was entered
    else {

      const slArr = clickedLocation.split(',')
      slArr.map(element => element.trim())
      selectedLocation = slArr.join(', ')

    }

    if (selectedLocation.trim() === '') {

      alert('Please enter a location');
      return;

    }

    try {

      const params: any = {appid: OWAPIKey, units: 'imperial'};

      // Updating params based on input type Zip Code/Coordinates/Location name
      if (isZipCode(selectedLocation)) {

        params["zip"] = selectedLocation;

      }
      else if (isCoords(selectedLocation)) {

        const [lat, lon] = selectedLocation.split(',').map(coord => parseFloat(coord.trim()))
        params["lat"] = lat;
        params["lon"] = lon;

      }
      else {

        params["q"] = selectedLocation;

      }

      // Fetching weather, forecast, and uv index
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params });
      const { lat, lon } = weatherResponse.data.coord;

      // Seperate call to find UV Index from different URL
      const uvResponse = await axios.get(`https://api.openweathermap.org/data/2.5/uvi`, {
        params: { lat, lon, appid: OWAPIKey }
      });

      // Calls to find 5-day forecast
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', { params });
      const forecastList = forecastResponse.data.list;
      const dailyForecast = forecastList.filter((item: any, index: number) => index % 8 === 0)

      // Calling post to add current location to db
      await axios.post('/api/recentLocations', {
        city: weatherResponse.data.name,
        country: weatherResponse.data.sys.country,
        lat: lat,
        lon: lon,
      });
      
      // Settin weather for easy access in html
      setWeather({ ...weatherResponse.data, uvIndex: uvResponse.data.value, condition: weatherResponse.data.weather[0].main, forecast: dailyForecast })
      // Notifying that a location has been entered
      setLocationEntered(true);
      // Clearing suggestions once a location has been selected
      setSuggestions([]);

      // Saved current lat and lon for Google Maps API
      // setSavedLat(lat);
      // setSavedLon(lon);

      // Reloading recents
      getRecents();

    }
    catch(error) {

      alert('Sorry, location could not be found. Make sure input is valid.');
      console.error(error);

    }

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') handleSearch(location);

  }

  const handleExport = () => {

    if (exportFormat === "json") exportJSON(weather);
    else exportPDF(weather);

  }

  // Handling a delete location from pressing x in recent location box
  const deleteLocation = (id: number) => {

    axios.delete('/api/recentLocations', {
      params: {
        id: id
      }
    });

    setTimeout(() => getRecents(), 50);

  }

  // Loading recents from db
  const getRecents = async () => {

    try {

      const locationsResponse = await axios.get('/api/recentLocations');
      if (locationsResponse.data.recentLocations) {

        setRecents(locationsResponse.data.recentLocations);

      }

    }
    catch (error) {

      console.log("Error fetching recent locations:", error)

    }

  }

  // Finding user location if permission given
  const getUserLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition( async (position) => {

        const { latitude, longitude } = position.coords

        handleSearch(latitude + "," + longitude);
        setLocation(latitude + "," + longitude);

      })

    }

  }

  // Calculating background from condition given by weather API of current location
  const calcBackgroundColorFromCondition = (condition: string) => {

    switch (condition) {

        case "Thunderstorm": return "bg-gray-800";
        case "Drizzle": return "bg-gray-500";
        case "Rain": return "bg-gray-500";
        case "Snow": return "bg-gray-500";
        case "Atmospheric": return "bg-blue-400";
        case "Clear": return "bg-blue-500";
        case "Clouds": return "bg-gray-500";
        default: return "bg-black"

    }

  } 

  // // Exporting as JSON
  // const exportJSON = () => {

  //   console.log(weather);
  //   const json = JSON.stringify(weather, null, 2);
  //   const blob = new Blob([json], { type: "application/json" })
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = "location-data.json";
  //   a.click();
  //   URL.revokeObjectURL(url);

  // }

  // // Exporting as PDF
  // const exportPDF = () => {

  //   const doc = new jsPDF();

  //   doc.setFont("times new roman", "normal");
  //   doc.setFontSize(12);
  //   doc.text("Location Data", 10, 10);

  //   let offset = 20;
  //   for (const key in weather) {

  //     doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${weather[key]}`, 10, offset);
  //     offset += 10;

  //   }

  //   doc.save("location-data.pdf");

  // }

  // Loading recents upon startup
  useEffect(() => {

    getRecents();

  }, []);

  return (
    
    <div 
      className={`border-2 border-black 
                  w-screen h-screen 
                  flex flex-row min-h-screen justify-center items-center
                  transition-colors duration-1000 ease-in-and-out 
                  ${weather !== null ? calcBackgroundColorFromCondition(weather.condition) : ''}
                  overflow-hidden`}>

      {/* Left side of page */}
      <div className=''>

        <div className='flex flex-row items-center'>

          {/* Title */}
          <h1 
            className={`text-black font-bold mb-6 text-5xl cursor-pointer w-[315px]
                        transition-all duration-1000 ease-in-and-out ${isLocationEntered ? '' : 'mt-[200px]'}`}
            onClick={() => window.location.reload()}>
            Weather App
          </h1>

          {/* History button */}
          <h1 
            className={`text-black font-bold mb-6 text-xl cursor-pointer w-[315px]
                        transition-all duration-1000 ease-in-and-out ${isLocationEntered ? '' : 'mt-[200px]'}`}
            onClick={() => router.push('/history')}>
            History
          </h1>

        </div>

        {/* Input bar and button */}
        <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out`}>

          <div className='flex flex-col'>

            {/* Location input */}
            <input
              type="text"
              placeholder="Enter current location"
              className="w-200 border-2 border-black rounded-full px-4 py-1 focus:outline-none"
              value={location}
              onChange={handleInputBarChange}
              onKeyDown={handleKeyDown}
            />

            {/* Suggestions list */}
            {suggestions.length > 0 && (

              <ul className='absolute translate-y-[35px]'>

                {suggestions.map((suggestion: any, index: number) => (

                  <li key={index} onClick={() => handleSearch(suggestion)} 
                      className='px-4 py-1 hover:bg-blue-300 cursor-pointer rounded-lg'>

                    {suggestion.name}, {suggestion.state}, {suggestion.country}

                  </li>

                ))}

              </ul>

            )}

          </div>

          {/* Search button */}
          <button 
            className="px-4 py-1 bg-yellow-600 rounded-full"
            onClick={() => handleSearch(location)}
          >
            <Image
              src="/icons/search-icon-button.png"
              width={25}
              height={25}
              alt="search icon image"
            />
          </button>

          {/* My location button */}
          <button 
            className="px-4 py-1 bg-yellow-600 rounded-full"
            onClick={getUserLocation}
          >
            My location

          </button>

          {/* Export button */}
          {isLocationEntered && (
            <div className='flex flex-row items-center space-x-2'>

              <select
                className='px-2 py-1 border-2 border-yellow-600 rounded-md bg-yellow-600'
                onChange={(e) => setExportFormat(e.target.value)}
                defaultValue="json"
              >
                <option value="json">Export as JSON</option>
                <option value="pdf">Export as PDF</option>

              </select>

              <button 
                className={`px-4 py-1 bg-yellow-600 rounded-full h-[40px]
                          transition-all duration-1000`}
                onClick={handleExport}
              >
                Export

              </button>

            </div>
            
          )}

        </div>

        {/* Showing weather location when location has been entered */}
        <div className={`transition-all duration-1000 ease-in-and-out ${(isLocationEntered && weather) ? '' : 'translate-y-[1000px]'}`}>

          {/* 5-day forecast */}
          <div className='border border-2 border-black rounded-lg
                          h-24
                          mb-4
                          mt-24
                          flex flex-row items-center justify-center
                          gap-14'>

            {weather && weather.forecast.map((day: any, index: number) => {

              const date = new Date(day.dt * 1000);
              const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });

              return (<div key={index}>

                <div>

                  {calcIconFromCondition(day.weather[0].main)}
                  <p>{dayOfWeek}</p>
                  <p>{day.main.temp} °F</p>

                </div>

              </div>)

            })}

          </div>

          <div className='grid grid-cols-3 gap-10'>

            <div className={widgetBoxes}>

              <div className='flex items-center gap-2'>

                {/* Thermometer icon */}
                <Image
                src="/icons/thermometer.svg"
                alt='Thermometer icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Temperature value */}
                <p>Temperature: {weather && weather.main.temp.toFixed(2)} °F</p>

              </div>

            </div>

            <div className={widgetBoxes}>

              <div className='flex items-center gap-2'>

                {/* Feels like icon */}
                <Image
                src="/icons/thermometer.svg"
                alt='Thermometer icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Feels like value */}
                <p>Feels like: {weather && weather.main.feels_like.toFixed(2)} °F</p>

              </div>

            </div>

            <div className={widgetBoxes}>
              
              <div className='flex items-center gap-2'>

                {/* Humid icon */}
                <Image
                src="/icons/humid.svg"
                alt='Humid icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Humid value */}
                <p>Humidity: {weather && weather.main.humidity.toFixed(2)}</p>


              </div>

            </div>

            <div className={widgetBoxes}>
              
              <div className='flex items-center gap-2'>

                {/* Precipitation icon */}
                <Image
                src="/icons/precipitation.svg"
                alt='Precipitation icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Precipitation value */}
                <p>Precipitation: {weather && weather.rain ? weather.rain['1h'].toFixed(2) : 0}</p>


              </div>

            </div>

            <div className={widgetBoxes}>
              
              <div className='flex items-center gap-2'>

                {/* Wind speed icon */}
                <Image
                src="/icons/wind.svg"
                alt='Wind speed icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Wind speed value */}
                <p>Wind Speed: {weather && weather.wind.speed.toFixed(2)}</p>


              </div>

            </div>

            <div className={widgetBoxes}>
              
              <div className='flex items-center gap-2'>

                {/* UV Index icon */}
                <Image
                src="/icons/uv.svg"
                alt='UV Index icon'
                width={24}
                height={24}
                >
                </Image>

                {/* UV Index value */}
                <p>UV Index: {weather && weather.uvIndex.toFixed(2)}</p>


              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Right side of page */}
      <div className='flex flex-col justify-around ml-12 w-1/6 h-3/4'>

        {/* Recents */}
        {recents.length > 0 && <div className={`w-full flex flex-col gap-4 h-1/2
                                                cursor-pointer overflow-y-auto no-scrollbar`}>

            {recents.map((recent: any, index: number) => (

              <div 
              key={index} 
              className='border border-2 border-black rounded-lg
                          w-full h-8
                          sm:text-xs md:text-sm lg:text-base xl:text-lg
                          flex items-center justify-between
                          transition-all duration-200
                          hover:bg-gray-400' 
              onClick={() => {handleSearch(recent.lat + "," + recent.lon); setLocation(recent.lat + "," + recent.lon)}}
              >

                <p className='ml-1'>{recent.city}, {recent.country}</p>

                <div className='mr-1' onClick={(e) => { e.stopPropagation(); deleteLocation(recent._id); } }>
                  <Image src="/icons/x.svg" alt='Delete icon' width={12} height={12}/>
                </div>

              </div>

            ))}

        </div>}

        {/* Google Map */}
        {/* {weather && <div className=''>

            <iframe
            title='Google Map'
            src={`https://www.google.com/maps/embed/v1/view?key=${GoogleAPIKey}&center=${savedLat},${savedLon}&zoom=12`}
            width="100%"
            height="100%"
            style={{border: 0}}
            loading='lazy'
            >

            </iframe>

        </div>} */}

      </div>

    </div>

  );
}
