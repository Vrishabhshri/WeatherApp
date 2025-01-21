'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function Home() {

  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [weatherCondition, setWeatherCondition] = useState<string>("")
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])

  const APIKey = process.env.NEXT_PUBLIC_API_KEY;

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

      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params });

      setWeatherCondition(response.data.weather[0].main)

      const { lat, lon } = response.data.coord;
      const uvResponse = await axios.get(`https://api.openweathermap.org/data/2.5/uvi?appid=${APIKey}&lat=${lat}&lon=${lon}`);

      setWeather({ ...response.data, uvIndex: uvResponse.data.value })
      setLocationEntered(true)
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
      case "Clear": return "bg-blue-600";
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
                  ${weatherCondition !== "" ? calcBackgroundColorFromCondition(weatherCondition) : ''}`}>

      {/* Title */}
      <h1 
        className={`text-black font-bold mb-6 text-5xl
                    transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-290px]' : ''}`}>
        Weather App
      </h1>

      {/* Input bar and button */}
      <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-290px]' : ''}`}>

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
                    className='px-4 py-2 hover:bg-blue-300 cursor-pointer rounded-lg'>

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
      {isLocationEntered && weather && (<div className="">

        <div className='grid grid-cols-3 gap-4'>

          <div className='border border-black w-48 h-24'>

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
              <p>Temperature: {weather.main.temp} °F</p>

            </div>

          </div>

          <div className='border border-black w-48 h-24'>
            <p>Feels like: {weather.main.feels_like} °F</p>
          </div>

          <div className='border border-black w-48 h-24'>
            <p>Humidity: {weather.main.humidity}</p>
          </div>

          <div className='border border-black w-48 h-24'>
            
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
              <p>Precipitation: {weather.rain ? weather.rain['1h'] : 0}</p>


            </div>

          </div>

          <div className='border border-black w-48 h-24'>
            <p>Wind Speed: {weather.wind.speed}</p>
          </div>

          <div className='border border-black w-48 h-24'>
            <p>UV Index: {weather.uvIndex}</p>
          </div>

        </div>

      </div>)}

    </div>

  );
}
