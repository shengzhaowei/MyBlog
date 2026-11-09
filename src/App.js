import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Nav';
import { EditorialHome, BlogPost } from './Editorial';
import SpotifyRec from './Projects/SpotifyRec';
import Projecttwo from './Projects/MangaProjects';
import Interests from './More/interests';

function App() {
  return (
    <div className="w-full h-full bg-[#fffaf0] cursor lg:cursor">
      <Navigation />
      <Routes>
        <Route path="/" element={<EditorialHome />} />
        <Route path="/posts/personal-website-as-long-term-project" element={<BlogPost />} />
        <Route path="/spotifyrecs" element={<SpotifyRec />} />
        <Route path="/mangaproject" element={<Projecttwo />} />
        <Route path="/interests" element={<Interests />} />
      </Routes>
    </div>
  );
}

export default App;
