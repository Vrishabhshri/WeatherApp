'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {

  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)

  const colorIntensities = [400, 500, 600, 700, 800, 900, 950];

  const tempData = {
    "London": -19
  }

  const handleInputBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setLocation(e.target.value);

  }

  const handleSearch = () => {

    if (tempData[location]) {

      setWeather(tempData[location]);
      setLocationEntered(true)

    }
    else {

      alert('Location could not be found')

    }

  }

  const calcBackgroundColorFromTemp = (temp: number) => {

    if (temp < 32) {

      const normalized = (temp + 20) / 52;
      const scaled = normalized * (colorIntensities.length - 1);
      const intensity = colorIntensities[colorIntensities.length - 1 - Math.round(scaled)]

      return intensity

    }
    else {

      const normalized = (temp - 33) / 77;
      const scaled = normalized * (colorIntensities.length - 1);
      const intensity = colorIntensities[Math.round(scaled)]

      return intensity

    }

  }

  return (
    
    <div 
      className={`border-2 border-black 
                  w-screen h-screen 
                  flex flex-col min-h-screen justify-center items-center
                  transition-colors duration-1000 ease-in-and-out 
                  ${weather !== null ? (weather < 32 ? 'bg-blue-500' : 'bg-orange-500') : ''}`}>

      {/* Title */}
      <h1 
        className={`text-black font-bold mb-6 
                    transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-320px] text-2xl' : 'text-5xl'}`}>
        Weather App
      </h1>

      {/* Input bar and button */}
      <div className={`flex gap-2 transition-all duration-1000 ease-in-and-out ${isLocationEntered ? 'translate-y-[-320px]' : ''}`}>

        <input
          type="text"
          placeholder="Enter current location"
          className="w-200 border-2 border-black rounded-full px-4 py-1"
          value={location}
          onChange={handleInputBarChange}
        />

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

      {isLocationEntered && weather && (<div className="">

        <p>Current temperature in {location}: {weather}°F</p>

      </div>)}

    </div>

  );
}
