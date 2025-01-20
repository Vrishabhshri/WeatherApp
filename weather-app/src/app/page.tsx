'use client';

// import { useState } from 'react';
import Image from 'next/image';

export default function Home() {

  return (
    
    <div className="border-2 border-black w-screen h-screen flex flex-col min-h-screen justify-center items-center">

      {/* Title */}
      <h1 className="text-5xl text-black font-bold mb-6">Weather App</h1>

      {/* Input bar and button */}
      <div className="flex gap-2">

        <input
          type="text"
          placeholder="Enter current location"
          className="w-200 border-2 border-black rounded-full px-4 py-1"
        />

        <button className="px-4 py-1 bg-yellow-600 rounded-full">
          <Image
            src="/search-icon-button.png"
            width={25}
            height={25}
            alt="search icon image"
          />
        </button>

      </div>

    </div>

  );
}
