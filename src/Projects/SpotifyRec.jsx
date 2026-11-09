import { Fragment, useEffect } from 'react';
import aos from 'aos';
import spotifyapp from '../Projects/spotifyapp.png'

const Projectone = () => {
  useEffect(()=> {
    aos.init({duration: 1500})
  },[])
  return (
    <div className="w-screen h-screen bg-[#fffaf0]">
      <img src={spotifyapp} data-aos="fade-in"  data-aos-delay="200"
      alt="Spotify 推荐应用预览"
      className='relative top-1/4 mx-auto -mt-32 -mb-8' height="600" width="500"/>
      <div className='relative -bottom-1/3 align-center text-center bg-[#fffaf0]"'>
      <header data-aos="fade-in"  data-aos-delay="0" className="
      text-black font-bold text-4xl md:text-5xl lg:text-6xl text-center mb-8">
        Spotify 音乐推荐
      </header>
      <Fragment data-aos="fade-in"  data-aos-delay="200">
      <a href="https://github.com/shengzhaowei" target="_blank" rel="noopener noreferrer"
      className='align-center border-2 rounded-sm px-8 py-4 font-semibold hover:scale-10 my-4 mx-8'>立即体验</a>
      <a href="https://github.com/shengzhaowei" target="_blank" rel="noopener noreferrer"
      className='align-center border-2 rounded-sm px-8 py-4 font-semibold my-4 hover:scale-105'>代码仓库</a>
    </Fragment>
      <h3
      className='font-bold text-xl md:text-2xl lg:text-3xl mt-16'>项目详情</h3>
      <p data-aos="fade-in"  data-aos-delay="600"
      className='mt-12 text-center mb-12'>
      一个基于 Spotify API 的网页应用，可以获取用户常听的歌曲、生成推荐并创建播放列表。
      使用 React、Tailwind 和 Spotify API 构建。
      </p>
      <p>更多细节待补充</p>
      </div>
    </div>
  );
}

export default Projectone;
