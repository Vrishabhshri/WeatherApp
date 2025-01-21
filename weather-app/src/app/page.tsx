'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function Home() {

  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])

  const APIKey = process.env.NEXT_PUBLIC_API_KEY;
  const widgetBoxes = `border border-2 border-black rounded-lg 
                      w-52 h-24 
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

      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${APIKey}`);
      setSuggestions(response.data)

    }
    catch (error) {

      console.error('Error fetching suggested locations:', error)

    }

  }

  const handleSearch = async (clickedLocation?: any) => {

    let selectedLocation;

    if (clickedLocation && clickedLocation._targetInst) {

      selectedLocation = `${clickedLocation.lat},${clickedLocation.lon}`;
      setLocation(clickedLocation.name + ', ' + clickedLocation.state + ', ' + clickedLocation.country);

    }
    else {

      const slArr = location.split(',')
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
      const dailyForecast = forecastList.filter((item: any, index: number) => )
      
      // Settin weather for easy access in html
      setWeather({ ...weatherResponse.data, uvIndex: uvResponse.data.value, condition: weatherResponse.data.weather[0].main })
      // Notifying that a location has been entered
      setLocationEntered(true)
      // Clearing suggestions once a location has been selected
      setSuggestions([])

    }
    catch(error) {

      alert('Sorry, location could not be found. Make sure input is valid.');
      console.error(error);

    }

  }

  const isZipCode = (str: string) => /^\d{5}(-\d{4})?$/.test(str);
  const isCoords = (str: string) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') handleSearch();

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

  return (
    
    <div 
      className={`border-2 border-black 
                  w-screen h-screen 
                  flex flex-col min-h-screen justify-center items-center
                  transition-colors duration-1000 ease-in-and-out 
                  ${weather !== null ? calcBackgroundColorFromCondition(weather.condition) : ''}
                  overflow-hidden`}>

      {/* Title */}
      <h1 
        className={`text-black font-bold mb-6 text-5xl
                    transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-220px]' : 'translate-y-[100px]'}`}>
        Weather App
      </h1>

      {/* Input bar and button */}
      <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-220px]' : 'translate-y-[100px]'}`}>

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

        <button 
          className="px-4 py-1 bg-yellow-600 rounded-full"
          onClick={handleSearch}
        >
          <Image
            src="/search-icon-button.png"
            width={25}
            height={25}
            alt="search icon image"
          />
        </button>

      </div>

      {/* Showing weather location when location has been entered */}
      <div className={`transition-all duration-1000 ${(isLocationEntered && weather) ? '' : 'translate-y-[510px]'}`}>

        <div className='border border-2 border-black rounded-lg
                        h-24
                        mb-4'>



        </div>

        <div className='grid grid-cols-3 gap-10'>

          <div className={widgetBoxes}>

            <div className='flex items-center gap-2'>

              {/* Thermometer icon */}
              <Image
              src="/thermometer.svg"
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

              {/* Thermometer icon */}
              <Image
              src="/thermometer.svg"
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
            <p>Humidity: {weather && weather.main.humidity}</p>
          </div>

          <div className={widgetBoxes}>
            
            <div className='flex items-center gap-2'>

              {/* Rain icon */}
              <Image
              src="/rain.svg"
              alt='Rain icon'
              width={24}
              height={24}
              >
              </Image>

              {/* Precipitation value */}
              <p>Precipitation: {weather && weather.rain ? weather.rain['1h'] : 0}</p>


            </div>

          </div>

          <div className={widgetBoxes}>
            <p>Wind Speed: {weather && weather.wind.speed}</p>
          </div>

          <div className={widgetBoxes}>
            <p>UV Index: {weather && weather.uvIndex}</p>
          </div>

        </div>

      </div>

    </div>

  );
}
