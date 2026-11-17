import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Nav';
import { EditorialHome, BlogPost } from './Editorial';
import { PostContextMemory } from './PostContextMemory';
import { PostAgentEvaluation } from './posts/PostAgentEvaluation';
import { PostClaudeSubagents } from './posts/PostClaudeSubagents';
import { PostErpAgent } from './posts/PostErpAgent';
import { PostMiniAgent } from './posts/PostMiniAgent';
import { PostMultiAgent } from './posts/PostMultiAgent';
import { PostAgentMemory } from './posts/PostAgentMemory';
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
        <Route path="/posts/erp-agent-chatbi" element={<PostErpAgent />} />
        <Route path="/posts/mini-agent-100-lines" element={<PostMiniAgent />} />
        <Route path="/posts/multi-agent-guide" element={<PostMultiAgent />} />
        <Route path="/posts/agent-memory-implementation" element={<PostAgentMemory />} />
        <Route path="/spotifyrecs" element={<SpotifyRec />} />
        <Route path="/mangaproject" element={<Projecttwo />} />
        <Route path="/interests" element={<Interests />} />
      </Routes>
    </div>
  );
}

export default App;
