import React, { useState } from "react";
import cat from './Images/cat.png';
import coc from './Images/clashofclans.png';

const Me = () => {
  return (
    <div className='mt-8 mx-auto w-3/4 lg:w-2/4 h-[50svh] text-sm md:text-lg lg:text-xl'>
      <div className="text-start">
        <p className="leading-relaxed">
          你好，我是 shengzhaowei。欢迎来到我在互联网上的一角！我会在这里分享自己的工作、项目，以及正在学习的东西。
        </p>
      </div>

      <div className="text-start mt-10">
        <p className="leading-relaxed">
          这一部分暂时还是占位内容，之后会在这里补充我的经历、技能和项目。
        </p>
      </div>
    </div>
  )
}

const Hobbies = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showImage, setShowImage] = useState(false);

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setShowImage(true);
  };

  const handleMouseLeave = () => {
    setShowImage(false);
  };

  return (
    <div className='mt-8 mx-auto w-3/4 lg:w-2/4 h-[50svh] text-sm md:text-lg lg:text-xl'>
      <div className="text-start">
        <p className="leading-relaxed">
          工作之外，我在空闲时喜欢尝试各种事情。最近比较专注的是攀岩，想尽快把基本功练好。如果你有适合新手的提升建议，欢迎告诉我！
        </p>
      </div>

      <div className="mt-10 text-start">
        <p className="leading-relaxed">
          其他爱好还有阅读（<a target='_blank' rel='noopener noreferrer' href='https://myanimelist.net/' className="font-bold font-satoshi italic pr-1 -ml-1 text-sumi hover:text-sumi-dark dark:text-white">漫画</a>和书）、游泳，以及去健身房锻炼。
        </p>
      </div>

      <div className="mt-10 text-start">
        <p className="leading-relaxed">
          最近没有怎么玩电子游戏，不过我挺自豪自己通关过
          <a
            target="_blank"
            href='https://supercell.com/en/games/clashofclans/'
            className="pl-1 font-bold font-satoshi italic pr-1 text-sumi hover:text-sumi-dark dark:text-white"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            《部落冲突》。
          </a>
          {showImage && (
            <div
              className="absolute pointer-events-none transform z-50"
              style={{
                top: position.y,
                left: position.x,
              }}
            >
              <img
                src={coc}
                alt="悬停预览图"
                className="w-[128] h-32 object-cover rounded-md shadow-lg opacity-90"
              />
            </div>
          )}
          最近时间不多，但以前也玩过 Supercell 的其他游戏。
        </p>
      </div>
    </div>
  )
}

const Self = () => {
  return (
    <div className='mt-8 mx-auto w-3/4 lg:w-2/4 h-[50svh] text-sm md:text-lg lg:text-xl'>
      <div className="text-center">
        <p className="leading-relaxed">
          你好，我是 shengzhaowei。欢迎来到我在互联网上的一角！
        </p>
        <p className="my-8 leading-relaxed">
          以后我会慢慢补充这里的内容。感谢来访！
        </p>

        <img
          src={cat}
          alt="一只猫的插画"
          className="mx-auto my-6"
        />
      </div>
    </div>
  )
}

const More = ({selected, setSelected}) => {

    return(
        <section id='more' className="relative top-[10%]
        text-center mt-4 mb-6 md:mb-12 text-md sm:text-lg md:text-xl dark:text-white">
          <div className="flex justify-center h-min mb-2">
            <p className="font-bold mr-1 md:mr-1">关于我的</p>

            <button
              className={`mr-2 md:mr-4 ${selected === "work" ? "font-bold" : "opacity-30"}`}
              onClick={() => setSelected("work")}
            >
              工作
            </button>
            <button
              className={`mr-2 md:mr-4 ${selected === "hobbies" ? "font-bold" : "opacity-30"}`}
              onClick={() => setSelected("hobbies")}
            >
              爱好
            </button>
            <button
              className={`mr-2 md:mr-4 ${selected === "self" ? "font-bold" : "opacity-30"}`}
              onClick={() => setSelected("self")}
            >
              自我
            </button>
          </div>
          <div className="flex justify-center align-center">
                {selected === "work" ?
                  <div className="">
                    <Me/>
                   </div>
                  : "" }
                {selected === "hobbies" ? <Hobbies/> :"" }
                {selected === "self" ? <Self/> :"" }
                {selected === null ? "" :"" }
          </div>
        </section>
    )
}

export default More
