import './App.css';
import More from './More/more.jsx';
import { FaGithubSquare } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
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
              <img src={mascot} alt="站点吉祥物" height={100} width={100} />
            </button>
            <h1 className='text-black dark:text-white font-bold text-4xl md:text-5xl lg:text-6xl text-center font-tnr'> 盛兆威 </h1>
        </div>
        <div className='flex justify-center space-x-2 my-2 mt-6'>
        <a href="https://x.com/szw666888" target="_blank" rel="noopener noreferrer" aria-label="在 X 上找到我"><FaXTwitter className="hover:scale-105" size={30}/></a>
        <a href="https://github.com/shengzhaowei" target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 上找到我"><FaGithubSquare className="hover:scale-105" size={30}/></a>
        </div>
      </div>

      <More selected={selected} setSelected={setSelected}/>
    </div>
  );
}

export default Main;
