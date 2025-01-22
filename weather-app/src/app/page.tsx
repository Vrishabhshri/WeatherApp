'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function Home() {

  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])
  const [recents, setRecents] = useState<any>([]);

  const APIKey = process.env.NEXT_PUBLIC_API_KEY;
  const widgetBoxes = `border border-2 border-black rounded-lg 
                      w-full sm:w-40 md:w-44 lg:w-48 xl:w-52 h-24
                      sm:text-xs md:text-sm lg:text-base xl:text-lg
                      flex items-center justify-center 
                      transition-all duration-200
                      hover:bg-gray-400 hover:scale-105`;

  const handleInputBarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const input = e.target.value;
    setLocation(input);

    if (input.trim() === '') {
      setSuggestions([])
      return
    }

    try {

      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=3&appid=${APIKey}`);
      setSuggestions(response.data)

    }
    catch (error) {

      console.error('Error fetching suggested locations:', error)

    }

  }

  const handleSearch = async (clickedLocation?: any) => {

    let selectedLocation;

    if (typeof clickedLocation !== "string") {

      selectedLocation = `${clickedLocation.lat},${clickedLocation.lon}`;
      setLocation(clickedLocation.name + ', ' + clickedLocation.state + ', ' + clickedLocation.country);

    }
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

      const params: any = {appid: APIKey, units: 'imperial'};

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
      const uvResponse = await axios.get(`https://api.openweathermap.org/data/2.5/uvi?appid=${APIKey}&lat=${lat}&lon=${lon}`);
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', { params });

      const forecastList = forecastResponse.data.list;
      const dailyForecast = forecastList.filter((item: any, index: number) => index % 8 === 0)

      await axios.post('/api/recentLocations', {
        city: weatherResponse.data.name,
        country: weatherResponse.data.sys.country,
        lat: lat,
        lon: lon,
      });
      
      // Settin weather for easy access in html
      setWeather({ ...weatherResponse.data, uvIndex: uvResponse.data.value, condition: weatherResponse.data.weather[0].main, forecast: dailyForecast })
      // Notifying that a location has been entered
      setLocationEntered(true)
      // Clearing suggestions once a location has been selected
      setSuggestions([])
      getRecents();
      console.log(recents);

    }
    catch(error) {

      alert('Sorry, location could not be found. Make sure input is valid.');
      console.error(error);

    }

  }

  const isZipCode = (str: string) => /^\d{5}(-\d{4})?$/.test(str);
  const isCoords = (str: string) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') handleSearch(location);

  }

  const deleteLocation = (id: number) => {

    axios.delete('/api/recentLocations', {
      params: {
        id: id
      }
    });

    setTimeout(() => getRecents(), 50);

  }

  const getRecents = async () => {

    try {

      const locationsResponse = await axios.get('/api/recentLocations');
      setRecents(locationsResponse.data.recentLocations)

    }
    catch (error) {

      console.log("Error fetching recent locations:", error)

    }

  }

  const getUserLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition( async (position) => {

        const { latitude, longitude } = position.coords

        handleSearch(latitude + "," + longitude);
        setLocation(latitude + "," + longitude);

      })

    }

  }

  const calcBackgroundColorFromCondition = (condition: string) => {

    switch (condition) {

      case "Thunderstorm": return "bg-gray-800";
      case "Drizzle": return "bg-gray-500";
      case "Rain": return "bg-gray-500";
      case "Snow": return "bg-gray-500";
      case "Atmospheric": return "bg-blue-400";
      case "Clear": return "bg-blue-500";
      case "Clouds": return "bg-gray-500";
      default: return "bg-white"

    }

  }

  const calcIconFromCondition = (condition: string) => {

    switch (condition) {

      case "Thunderstorm": return (

        <Image
        src="/icons/thunderstorm.svg"
        alt='Thunderstorm icon'
        width={24}
        height={24}
        >
        </Image>

      )
      case "Drizzle": return (

        <Image
        src="/icons/rain.svg"
        alt='Drizzle icon'
        width={24}
        height={24}
        >
        </Image>

      )
      case "Rain": return (

        <Image
        src="/icons/rain.svg"
        alt='Rain icon'
        width={24}
        height={24}
        >
        </Image>

      )
      case "Snow": return (

        <Image
        src="/icons/snow.svg"
        alt='Snow icon'
        width={24}
        height={24}
        >
        </Image>

      )
      case "Clear": return (

        <Image
        src="/icons/thunderstorm.svg"
        alt='Thunderstorm icon'
        width={24}
        height={24}
        >
        </Image>

      )
      case "Clouds": return (

        <Image
        src="/icons/clouds.svg"
        alt='Clouds icon'
        width={24}
        height={24}
        >
        </Image>

      )
      default: return (

        <Image
        src="/icons/default.svg"
        alt='Default icon'
        width={24}
        height={24}
        >
        </Image>

      )

    }

  }

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

      <div>

        {/* Title */}
        <h1 
          className={`text-black font-bold mb-6 text-5xl cursor-pointer w-[315px]
                      transition-all duration-1000 ease-in-and-out ${isLocationEntered ? '' : 'mt-[200px]'}`}
          onClick={() => window.location.reload()}>
          Weather App
        </h1>

        {/* Input bar and button */}
        <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out`}>

          <div className='flex flex-col'>

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
            onClick={handleSearch}
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

        </div>

        {/* Showing weather location when location has been entered */}
        <div className={`transition-all duration-1000 ease-in-and-out ${(isLocationEntered && weather) ? '' : 'translate-y-[1000px]'}`}>

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
                <p>Temperature: {weather && weather.main.temp} °F</p>

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
                <p>Feels like: {weather && weather.main.feels_like} °F</p>

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
                <p>Humidity: {weather && weather.main.humidity}</p>


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
                <p>Precipitation: {weather && weather.rain ? weather.rain['1h'] : 0}</p>


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
                <p>Wind Speed: {weather && weather.wind.speed}</p>


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
                <p>UV Index: {weather && weather.uvIndex}</p>


              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Recents */}
      <div className={`translate-x-[100px] w-1/6 flex flex-col gap-4 max-h-[600px]
                                              cursor-pointer overflow-y-auto`}>

          {recents.map((recent, index: number) => (

            <div 
            key={index} 
            className='border border-2 border-black rounded-lg
                        w-full h-12
                        sm:text-xs md:text-sm lg:text-base xl:text-lg
                        flex items-center justify-between
                        transition-all duration-200
                        hover:bg-gray-400' 
            onClick={() => {handleSearch(recent.lat + "," + recent.lon); setLocation(recent.lat + "," + recent.lon)}}
            >

              <div className='ml-1' onClick={(e) => { e.stopPropagation(); deleteLocation(recent._id); } }>
                <Image src="/icons/update.svg" alt='Update icon' width={16} height={16}/>
              </div>

              {recent.city}, {recent.country}

              <div className='mr-1' onClick={(e) => { e.stopPropagation(); deleteLocation(recent._id); } }>
                <Image src="/icons/x.svg" alt='Delete icon' width={12} height={12}/>
              </div>

            </div>

          ))}

      </div>

    </div>

  );
}
