'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function Home() {

  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])

  const colorIntensities = [400, 500, 600, 700, 800, 900, 950];
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

    if (clickedLocation) {

      selectedLocation = `${clickedLocation.lat},${clickedLocation.lon}`;
      setLocation(clickedLocation.name + ', ' + clickedLocation.state + ', ' + clickedLocation.country);

    }
    else {

      selectedLocation = location

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

  // const calcBackgroundColorFromTemp = (temp: number) => {

  //   if (temp < 32) {

  //     const normalized = (temp + 20) / 52;
  //     const scaled = normalized * (colorIntensities.length - 1);
  //     const intensity = colorIntensities[colorIntensities.length - 1 - Math.round(scaled)]

  //     return intensity

  //   }
  //   else {

  //     const normalized = (temp - 33) / 77;
  //     const scaled = normalized * (colorIntensities.length - 1);
  //     const intensity = colorIntensities[Math.round(scaled)]

  //     return intensity

  //   }

  // }

  return (
    
    <div 
      className={`border-2 border-black 
                  w-screen h-screen 
                  flex flex-col min-h-screen justify-center items-center
                  transition-colors duration-1000 ease-in-and-out 
                  ${weather !== null ? (weather.main.temp < 32 ? 'bg-blue-500' : 'bg-orange-500') : ''}`}>

      {/* Title */}
      <h1 
        className={`text-black font-bold mb-6 text-5xl
                    transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-380px]' : ''}`}>
        Weather App
      </h1>

      {/* Input bar and button */}
      <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-380px]' : ''}`}>

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

        <div className='flex flex-row'>

          <div className='border border-black'>
            <p>Temperature: {weather.main.temp} °F</p>
          </div>

          <div className='border border-black'>
            <p>Feels like: {weather.main.feels_like} °F</p>
          </div>

          <div className='border border-black'>
            <p>Humidity: {weather.main.humidity}</p>
          </div>

          <div className='border border-black'>
            <p>Precipitation: {weather.rain ? weather.rain['1h'] : 0}</p>
          </div>

          <div className='border border-black'>
            <p>Wind Speed: {weather.wind.speed}</p>
          </div>

          <div className='border border-black'>
            <p>UV Index: {weather.uvIndex}</p>
          </div>

        </div>

      </div>)}

    </div>

  );
}
