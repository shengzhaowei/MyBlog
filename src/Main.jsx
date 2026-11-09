import './App.css';
import More from './More/more.jsx';
import { FaGithubSquare } from 'react-icons/fa'
import React, { useState } from 'react';
import mascot from "./mascot.png";
import ModeSwitch from './sunandmoon';
import Stars from './stars';

const Main = () => {
  const [selected, setSelected] = useState("work");

  return (
    <div className="w-full h-screen overflow-auto dark:bg-[#0a0e23] bg-[#fffaf0]">
      <Stars/>
      <ModeSwitch/>
      <div className="relative top-[10%] flex flex-col dark:text-white">
        <div className='flex flex-col justify-center items-center'>
            <button onClick={()=>window.location.reload()} className='rounded-full dark:shadow-2xl dark:shadow-yellow-500'>
              <img src={mascot} height={100} width={100} />
            </button>
            <h1 className='text-black dark:text-white font-bold text-4xl md:text-5xl lg:text-6xl text-center font-tnr'> shengzhaowei </h1>
        </div>
        <div className='flex justify-center space-x-2 my-2 mt-6'>
        <a href="https://github.com/shengzhaowei" target="_blank" rel="noopener noreferrer"><FaGithubSquare className="hover:scale-105" size={30}/></a>
        </div>
      </div>

      <More selected={selected} setSelected={setSelected}/>
    </div>
  );
}

export default Main;
