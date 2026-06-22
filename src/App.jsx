import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Biography from './pages/Biography.jsx'
import CV from './pages/CV.jsx'
import Chronology from './pages/Chronology.jsx'
import Works from './pages/Works.jsx'
import Interests from './pages/Interests.jsx'
import Books from './pages/Books.jsx'
import Articles from './pages/Articles.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Activities from './pages/Activities.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/biography" element={<Biography />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/chronology" element={<Chronology />} />
          <Route path="/works" element={<Works />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/books" element={<Books />} />
          <Route path="/translations" element={<Books initialTab="translations" />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
