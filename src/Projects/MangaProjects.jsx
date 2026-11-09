import { Fragment, useEffect } from 'react';
import aos from 'aos';

const Projecttwo = () => {
  useEffect(()=> {
    aos.init({duration: 1500})
  },[])
  return (
    <div className="w-screen h-screen bg-[#fffaf0]">
      <div className='relative -bottom-1/3 align-center text-center'>
      <header data-aos="fade-in"  data-aos-delay="0" className="
      text-black font-bold text-4xl md:text-5xl lg:text-6xl text-center mb-8">
        漫画推荐项目（进行中）
      </header>
      <Fragment data-aos="fade-in"  data-aos-delay="200">
    </Fragment>
      <h3
      className='font-bold text-xl md:text-2xl lg:text-3xl mt-16'>项目详情</h3>
      <p data-aos="fade-in"  data-aos-delay="600"
      className='mt-12 text-center mb-12 w-auto px-40'>
      一个由 Python 爬虫生成的漫画数据库，收录标题、类型、评分等信息。交互式网页应用会用类似 Spotify「每周发现」的算法生成漫画推荐。
      使用 Python、Next.js、Supabase、Tailwind 等技术。
      </p>
      <p>仍在制作中</p>
      </div>
    </div>
  );
}

export default Projecttwo;
