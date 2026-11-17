import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './Nav';
import { EditorialHome, BlogPost } from './Editorial';
import { PostContextMemory } from './PostContextMemory';
import { PostAgentEvaluation } from './posts/PostAgentEvaluation';
import { PostClaudeSubagents } from './posts/PostClaudeSubagents';
import { PostErpAgent } from './posts/PostErpAgent';
import { PostMiniAgent } from './posts/PostMiniAgent';
import { PostMultiAgent } from './posts/PostMultiAgent';
import { PostAgentMemory } from './posts/PostAgentMemory';
import { ClaudeCodeBookHome, ClaudeCodeBookChapter } from './books/ClaudeCodeBook';
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
        <Route path="/books/claude-code" element={<ClaudeCodeBookHome />} />
        <Route path="/books/claude-code/:chapterId" element={<ClaudeCodeBookChapter />} />
        {/* 旧文章地址改电子书后留一个跳转，之前给过的链接不会白屏 */}
        <Route path="/posts/claude-code-source-book" element={<Navigate to="/books/claude-code" replace />} />
        <Route path="/spotifyrecs" element={<SpotifyRec />} />
        <Route path="/mangaproject" element={<Projecttwo />} />
        <Route path="/interests" element={<Interests />} />
      </Routes>
    </div>
  );
}

export default App;
