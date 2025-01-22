'use client';

import { useState } from 'react';

const history = () => {

  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [suggestions, setSuggestions] = useState<any>([])

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

    <div className={`border-2 border-black 
                    w-screen h-screen 
                    flex flex-row min-h-screen justify-center items-center
                    transition-colors duration-1000 ease-in-and-out 
                    ${weather !== null ? calcBackgroundColorFromCondition(weather.condition) : ''}
                    overflow-hidden`}>

        Hello

    </div>

  )

}

export default history;