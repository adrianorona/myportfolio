import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll } from '@react-three/drei';
import Earth from './components/Earth';
import InteractiveStars from './components/InteractiveStars';
import Moon from './components/Moon';
import Sun from './components/Sun';
import OtherPlanets from './components/OtherPlanets';
import Navbar from './components/Navbar';
import CameraRig from './components/CameraRig';
import './App.css';

// This component reads the scroll data from Drei and updates the parent state respectively
function ScrollTracker({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  const scroll = useScroll();
  const lastSection = useRef('Home');

  useFrame(() => {
    const offset = scroll.offset;
    let current = 'Home';
    if (offset < 0.15) current = 'Home';
    else if (offset >= 0.15 && offset < 0.40) current = 'About';
    else if (offset >= 0.40 && offset < 0.65) current = 'Skills';
    else if (offset >= 0.65 && offset < 0.85) current = 'Projects';
    else if (offset >= 0.85) current = 'Contact';

    if (current !== lastSection.current) {
      lastSection.current = current;
      setActiveSection(current);
    }
  });

  // Listen to custom 'nav-click' events thrown by the Navbar to natively scroll Drei's hidden container!
  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const section = customEvent.detail;
      const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
      
      let target = 0;
      if (section === 'Home') target = 0;
      else if (section === 'About') target = 0.25;
      else if (section === 'Skills') target = 0.50;
      else if (section === 'Projects') target = 0.75;
      else if (section === 'Contact') target = 1.0;
      
      scroll.el.scrollTo({ top: target * maxScroll, behavior: 'smooth' });
    };

    window.addEventListener('nav-click', handleNav);
    return () => window.removeEventListener('nav-click', handleNav);
  }, [scroll]);

  return null;
}

function App() {
  const [activeSection, setActiveSection] = useState('Home');

  return (
    <div className="canvas-container">
      {/* We pass the active selection up and down so the Navbar visually reacts to scrolling! */}
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Hero Actions Overlay (Fixed on screen, outside scroll layer so it doesn't move up) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '28vh',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div className="hero-actions" style={{ 
          pointerEvents: activeSection === 'Home' ? 'auto' : 'none',
          opacity: activeSection === 'Home' ? 1 : 0,
          transform: activeSection === 'Home' ? 'translateY(0)' : 'translateY(30px) scale(0.95)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <a href="/resume.pdf" className="social-btn" target="_blank" rel="noreferrer">
            Download Resume
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
          <a href="https://linkedin.com/in/your-profile" className="social-icon-btn" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="https://github.com/your-username" className="social-icon-btn" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
        </div>
      </div>

      {/* Rotation Indicator Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '3rem',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: activeSection === 'Home' ? 0.8 : 0,
        transform: activeSection === 'Home' ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textShadow: '-2px 0px 0px #00aaff, 2px 0px 0px #ff0055',
        userSelect: 'none'
      }}>
        [R]
      </div>

      <Canvas camera={{ position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.25}>
            {/* The ScrollTracker needs to be inside ScrollControls to use the useScroll hook */}
            <ScrollTracker setActiveSection={setActiveSection} />

            {/* The 3D Environment */}
            <ambientLight intensity={0.2} />
            <Earth />
            <Moon />
            <Sun />
            <OtherPlanets />
            <InteractiveStars count={20000} radius={300} depth={60} />
            
            {/* This custom rig takes control of the camera and ties it to your mouse scroll! */}
            <CameraRig />

            {/* The HTML overlay connected to the scrolling */}
            <Scroll html style={{ width: '100%', height: '100%', color: 'white' }}>
              {/* Home Page (Offset 0) */}
              <div id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {/* Empty container: the buttons have been moved outside the Scroll component */}
              </div>

              {/* About Page (Offset 0.25) */}
              <div id="about" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '5vw', alignItems: 'flex-end' }}>
                <div className="glass-panel about-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '800px', lineHeight: '1.8' }}>
                  <img src="/profile.jpg" alt="Colston" className="profile-pic" style={{ marginBottom: '20px' }} />
                  <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About Me</h2>
                  
                  <div className="section-text" style={{ fontSize: '1rem', textAlign: 'justify', textIndent: '2rem' }}>
                    <p style={{ textIndent: '0', textAlign: 'center', marginBottom: '15px' }}>
                      Hello, I'm Colston 👋. <em>A Computer Science Student</em> 📖 / <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>React & Android Developer</span> 👨‍💻.
                    </p>
                    <p style={{ marginBottom: '15px' }}>
                      My journey as an aspiring developer began at a very young age, during my first year of junior high school, where I learned to write simple scripts using Visual Basic. <em>In my senior years of high school</em>, I started taking programming seriously and became a self-taught Web Developer.
                    </p>
                    <p style={{ marginBottom: '15px' }}>
                      I also tried Game Development, but eventually, I got really into creating mobile apps, which became my primary area of expertise. I am proficient with technologies such as <strong>React, Next.js, React Native, Expo, Firebase, and Laravel</strong>. I am currently seeking for internships or full-time positions.
                    </p>
                    <p>
                      <em>When I'm not coding</em>, I enjoy playing video games, watching movies, and going out for long walks. I also enjoy learning new things. I am currently learning about <strong>Machine Learning, Data Science, and Cybersecurity through CTF challenges</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Page (Offset 0.50) */}
              <div id="skills" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10vw', alignItems: 'flex-start', textAlign: 'left' }}>
                <div className="glass-panel">
                  <h2 className="section-title">Skills</h2>
                  <div className="title-underline" style={{ marginLeft: 0 }}></div>
                  <p className="section-text">
                    React.js <br/>
                    Three.js / WebGL <br/>
                    UI/UX Motion Design <br/><br/>
                    As we navigate the void, my technical toolkit helps keep the rendering smooth and visually appealing.
                  </p>
                </div>
              </div>
              
              {/* Projects Page (Offset 0.75) */}
              <div id="projects" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '10vw', alignItems: 'flex-end', textAlign: 'right' }}>
                <div className="glass-panel">
                  <h2 className="section-title">Projects</h2>
                  <div className="title-underline"></div>
                  <p className="section-text">
                    Notice how we're now swooping off to the right side of the cosmic plane, leaving Earth behind and turning our gaze toward the Sun!
                  </p>
                </div>
              </div>
              
              {/* Contact Page (Offset 1.0) */}
              <div id="contact" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div className="glass-panel contact-panel">
                  <h2 className="section-title" style={{ fontSize: '4rem', textShadow: '0px 0px 20px #ffaa00' }}>Contact</h2>
                  <div className="title-underline" style={{ margin: '0 auto' }}></div>
                  <p className="section-text">
                    We have successfully arrived at the center of our solar system. <br/><br/>
                    Reach me anytime!
                  </p>
                </div>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>
        {/* OrbitControls are REMOVED here because they fight with the custom Scroll CameraRig */}
      </Canvas>
    </div>
  );
}

export default App;