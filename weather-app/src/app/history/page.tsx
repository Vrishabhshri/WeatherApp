'use client';

import { useState, useEffect } from 'react';
import { calcIconFromCondition, isZipCode, isCoords, exportJSON, exportPDF } from '@/utils/pageFunctions';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function History() {

  // Variables for storing states
  const [location, setLocation] = useState('')
  const [isLocationEntered, setLocationEntered] = useState(false)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [weatherList, setWeatherList] = useState<any>(null);
  const [lowTemp, setLowTemp] = useState(0);
  const [highTemp, setHighTemp] = useState(0);
  const [highPrec, setHighPrec] = useState(0);
  const [avgFeelsLike, setAvgFeelsLike] = useState(0);
  const [recents, setRecents] = useState<any>([]);
  const [savedLat, setSavedLat] = useState<number>(0);
  const [savedLon, setSavedLon] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState("json");

  // Router and API Keys
  const router = useRouter();
  const OPENWEATHERAPIKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const VCAPIKey = process.env.NEXT_PUBLIC_VC_API_KEY;
  const VCBASE_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline`;
  const GoogleAPIKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // Special widgetboxes tailwind to avoid d.r.y. code
  const widgetBoxes = `border border-2 border-black rounded-lg 
                      w-full sm:w-40 md:w-44 lg:w-48 xl:w-52 h-24
                      sm:text-xs md:text-sm lg:text-base xl:text-lg
                      flex items-center justify-center 
                      transition-all duration-200
                      hover:bg-gray-400 hover:scale-105`;

  // Changing input bar every time user inputs or delets number                  
  const handleInputBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const input = e.target.value;
    setLocation(input);

  }

  // Changing start date bar every time user inputs or delets number
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const input = e.target.value;
    setStartDate(input);

  }
  
  // Changing start date bar every time user inputs or delets number
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const input = e.target.value;
    setEndDate(input);

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') handleSearch(location, startDate, endDate);

  }

  // Ensuring date range is within given amount (length)
  const handleDateCheck = (startDate: Date, endDate: Date, length: number) => {

    const timeDifference = endDate.getTime() - startDate.getTime();

    // Calculating day difference using 1000 intervals with 60 seconds 60 minutes and 24 hours
    // 1000 * 60 * 60 * 24
    const dayDifference = Math.floor(timeDifference / 86400000) + 1;

    return dayDifference > length;

  }

  // Handling search call to find weather info
  const handleSearch = async (clickedLocation: any, startDate: string, endDate: string) => {

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

    // Check if valid end date and start date was given
    if (isNaN(new Date(endDate).getTime()) || isNaN(new Date(startDate).getTime())) {

      alert('Please enter valid start and end date');
      return;

    }

    const startDateObject = new Date(startDate);
    const endDateObject = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check that end date doesn't exceed today's date
    if (endDateObject > today) {

      alert('Please enter an end date that is no later than today');
      return;

    }

    // Check start date doesn't exceed end date
    if (startDateObject > endDateObject) {

      alert('Please enter a date range with a start date less then end date');
      return;

    }

    // Check different between start and end date isn't greater than 7
    if (handleDateCheck(startDateObject, endDateObject, 7)) {

      alert('Please enter a date range no longer than 7 days');
      return;

    }

    // Check difference between start date and today's date isn't greater than 16
    if (handleDateCheck(startDateObject, today, 16)) {

      alert('Please enter a start date less than 16 days ago');
      return;

    }

    try {

      const params: any = {appid: OPENWEATHERAPIKey, units: 'imperial'};

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

      // Fetching lat and lon based on input given
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params });
      const { lat, lon } = weatherResponse.data.coord;

      // Finding location name from lat and lon to store in db in case coordinates or zipcode were given
      const locationResponse = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
        params: { lat, lon, appid: OPENWEATHERAPIKey, limit: 1 },
      });
      const newLocationName = locationResponse.data[0].name + ", " + locationResponse.data[0].country

      // Calling seperate function to handle getting weather data after all edge cases have been passed
      getWeatherData(lat, lon, newLocationName, startDate, endDate);
      
      // Notifying that a location has been entered
      setLocationEntered(true)

    }
    catch(error) {

      alert('Sorry, location could not be found. Make sure input is valid.');
      console.error(error);

    }

  }

  // Handling which type of export
  const handleExport = () => {

    if (exportFormat === "json") weatherList.forEach((weather: any) => { exportJSON(weather) });
    else weatherList.forEach((weather: any) => { exportPDF(weather) });

  }

  // Finding weather information
  async function getWeatherData(lat: number, lon: number, location: string, startDate: string, endDate: string) {

    // Creating url to search for weather data
    const url = `${VCBASE_URL}/${lat},${lon}/${startDate}/${endDate}?key=${VCAPIKey}`;
    
    try {

      const response = await fetch(url);
      const data = await response.json();

      // If data.days exists, the valid data has been received
      if (data && data.days) {

        // Set weather list to the temperature for the date range
        setWeatherList(data.days);

        // Update important info to populate widgets
        calcHighTemp(data.days);
        calcLowTemp(data.days);
        calcAverageFeelsLike(data.days);
        calcHighPrec(data.days);

        // Add current date range weather query to database
        await axios.post('/api/daterangeLocations', {
          days: data.days,
          lat: lat,
          lon: lon,
          location: location,
          startDate: startDate,
          endDate: endDate
        });

        // Reload recents once a successful query has been made
        getRecents();

        // Save lat and lon coords for google map use
        setSavedLat(lat);
        setSavedLon(lon);

      }

    }
    catch (error) {

      console.log("Error fetching weather data for range:", error);

    }

  }

  // Finding user location if permission given
  const getUserLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition( async (position) => {

        const { latitude, longitude } = position.coords

        handleSearch(latitude + "," + longitude, startDate, endDate);
        setLocation(latitude + "," + longitude);

      })

    }

  }

  // Loading recents from db
  const getRecents = async () => {

    try {

      const locationsResponse = await axios.get('/api/daterangeLocations');
      if (locationsResponse.data.daterangeLocations) {

        setRecents(locationsResponse.data.daterangeLocations);

      }

    }
    catch (error) {

      console.log("Error fetching recent locations:", error)

    }

  }

  const calcHighTemp = (arr: any) => {

    let highest = 0;

    arr.forEach((day: any) => {

      highest = Math.max(highest, day.temp);
      
    });

    setHighTemp(highest);

  }

  const calcLowTemp = (arr: any) => {

    let lowest = 200;

    arr.forEach((day: any) => {

      lowest = Math.min(lowest, day.temp);
      
    });

    setLowTemp(lowest);

  }

  const calcAverageFeelsLike = (arr: any) => {

    let total = 0;
    let count = 0;

    arr.forEach((day: any) => {

      total += day.feelslike;
      count++;
      
    });

    setAvgFeelsLike(total / count);

  }

  const calcHighPrec = (arr: any) => {

    let highest = 0;

    arr.forEach((day: any) => {

      highest = Math.max(highest, day.precip);
      
    });

    setHighPrec(highest);

  }

  // Handling a delete location from pressing x in recent location box
  const deleteLocation = (id: number) => {

    axios.delete('/api/daterangeLocations', {
      params: {
        id: id
      }
    });

    setTimeout(() => getRecents(), 50);

  }

  // Loading recents upon startup
  useEffect(() => {

    getRecents();

  }, []);

  return (

    <div className={`border-2 border-black 
                    w-screen h-screen 
                    flex flex-row min-h-screen justify-center items-center
                    transition-colors duration-1000 ease-in-and-out 
                    overflow-hidden
                    ${weatherList !== null ? '' : ''}
                    `}>

      {/* Left side of page */}
      <div>

        <div className='flex flex-row items-center'>

          {/* Title */}
          <h1 
            className={`text-black font-bold mb-6 text-5xl cursor-pointer w-[395px]
                        transition-all duration-1000 ease-in-and-out ${isLocationEntered ? '' : 'mt-[200px]'}`}
            onClick={() => window.location.reload()}>
            Weather History
          </h1>

          {/* History button */}
          <h1 
            className={`text-black font-bold mb-6 text-xl cursor-pointer w-[315px]
                        transition-all duration-1000 ease-in-and-out ${isLocationEntered ? '' : 'mt-[200px]'}`}
            onClick={() => router.push('/')}>
            App
          </h1>

        </div>

        {/* Input bar and buttons */}
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

            <div className='flex flex-row'>

              {/* Start date */}
              <input
                type="date"
                className="w-50 border-2 border-black rounded-full px-4 py-1 focus:outline-none"
                value={startDate}
                onChange={handleStartDateChange}
              />

              {/* End date */}
              <input
                type="date"
                className="w-50 border-2 border-black rounded-full px-4 py-1 focus:outline-none"
                value={endDate}
                onChange={handleEndDateChange}
              />

            </div>

          </div>

          {/* Search button */}
          <button 
            className="px-4 py-1 bg-yellow-600 rounded-full h-[40px]"
            onClick={() => handleSearch(location, startDate, endDate)}
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
            className="px-4 py-1 bg-yellow-600 rounded-full h-[40px]"
            onClick={getUserLocation}
          >
            My location

          </button>

          {/* Export button */}
          {isLocationEntered && (
            <div className='flex flex-row space-x-2'>

              <select
                className='px-2 py-1 border-2 border-yellow-600 rounded-md bg-yellow-600 h-[40px]'
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
        <div className={`transition-all duration-1000 ease-in-and-out ${(isLocationEntered && weatherList) ? '' : 'translate-y-[1000px]'}`}>

          {/* 5-day forecast */}
          <div className='border border-2 border-black rounded-lg
                          h-24
                          mb-4
                          mt-24
                          flex flex-row items-center justify-center
                          gap-2'>

            {weatherList && weatherList.map((day: any, index: number) => {

              const date = day.datetime;

              return (<div key={index} className='text-xs'>

                <div>

                  {calcIconFromCondition(day.conditions.split(", ")[0])}
                  <p>{date}</p>
                  <p>{day.temp} °F</p>

                </div>

              </div>)

            })}

          </div>

          <div className='grid grid-cols-3 gap-4'>

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

                {/* High Temp value */}
                <p>High Temperature: {highTemp.toFixed(2)} °F</p>

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

                {/* Average Feels like value */}
                <p>Average Feels like: {avgFeelsLike.toFixed(2)} °F</p>

              </div>

            </div>

            <div className={widgetBoxes}>
              
              <div className='flex items-center gap-2'>

                {/* Humid icon */}
                <Image
                src="/icons/precipitation.svg"
                alt='Precipitation icon'
                width={24}
                height={24}
                >
                </Image>

                {/* Average Humid value */}
                <p>High Precipitation: {highPrec.toFixed(2)}</p>


              </div>

            </div>

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

                {/* Low Temp value */}
                <p>Low Temperature: {lowTemp.toFixed(2)} °F</p>


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
            onClick={() => {
              handleSearch(recent.lat + "," + recent.lon, recent.startDate, recent.endDate); 
              setLocation(recent.lat + "," + recent.lon);
              setStartDate(recent.startDate);
              setEndDate(recent.endDate);
            }}
            >

              {recent.location}

              <div className='mr-1' onClick={(e) => { e.stopPropagation(); deleteLocation(recent._id); } }>
                <Image src="/icons/x.svg" alt='Delete icon' width={12} height={12}/>
              </div>

            </div>

          ))}

      </div>}

      {/* Google Map */}
      {weather && <div className=''>

          <iframe
          title='Google Map'
          src={`https://www.google.com/maps/embed/v1/view?key=${GoogleAPIKey}&center=${savedLat},${savedLon}&zoom=12`}
          width="100%"
          height="100%"
          style={{border: 0}}
          loading='lazy'
          >

          </iframe>

      </div>}

    </div>

  </div>

  )

}