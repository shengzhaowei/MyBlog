import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Nav';
import { EditorialHome, BlogPost } from './Editorial';
import { PostContextMemory } from './PostContextMemory';
import { PostAgentEvaluation } from './posts/PostAgentEvaluation';
import { PostClaudeSubagents } from './posts/PostClaudeSubagents';
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
        <Route path="/posts/context-window-as-cache" element={<PostContextMemory />} />
        <Route path="/posts/agent-evaluation-with-fixed-evidence" element={<PostAgentEvaluation />} />
        <Route path="/posts/claude-code-subagents-code-reviewer" element={<PostClaudeSubagents />} />
        <Route path="/spotifyrecs" element={<SpotifyRec />} />
        <Route path="/mangaproject" element={<Projecttwo />} />
        <Route path="/interests" element={<Interests />} />
      </Routes>
    </div>
  );
}

export default App;
