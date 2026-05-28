import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// ParticleBackground Component
// ==========================================
const ParticleBackground = ({
  particleColor = '#6366f1', // Indigo-500
  lineColor = '#4338ca', // Indigo-700
  particleCount = 70,
  maxDistance = 120,
  speedFactor = 0.3,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationFrameId = useRef(null);
  const particles = useRef([]);

  const generateParticles = useCallback((canvasWidth, canvasHeight) => {
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * speedFactor,
      dy: (Math.random() - 0.5) * speedFactor,
    }));
  }, [particleCount, speedFactor]);

  const drawParticles = useCallback((ctx, canvasWidth, canvasHeight) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = particleColor;
    ctx.strokeStyle = lineColor;

    particles.current.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x + p.radius > canvasWidth || p.x - p.radius < 0) p.dx *= -1;
      if (p.y + p.radius > canvasHeight || p.y - p.radius < 0) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.current.length; j++) {
        const p2 = particles.current[j];
        const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

        if (distance < maxDistance) {
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1 - (distance / maxDistance);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
  }, [particleColor, lineColor, maxDistance]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    drawParticles(ctx, canvas.width, canvas.height);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawParticles]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (contextRef.current) {
      contextRef.current.scale(dpr, dpr);
    }

    generateParticles(rect.width, rect.height);
  }, [generateParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    contextRef.current = canvas.getContext('2d');
    resizeCanvas();
    animate();

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId.current);
      resizeCanvas();
      animate();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, resizeCanvas]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1, opacity: 0.6 }} className={className}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

// ==========================================
// Custom Cursor
// ==========================================
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;
    const cursorSpeed = 0.3, followerSpeed = 0.1;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      if (cursorRef.current && cursorFollowerRef.current) {
        cursorX += (mouseX - cursorX) * cursorSpeed;
        cursorY += (mouseY - cursorY) * cursorSpeed;
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
        followerX += (mouseX - followerX) * followerSpeed;
        followerY += (mouseY - followerY) * followerSpeed;
        cursorFollowerRef.current.style.left = `${followerX}px`;
        cursorFollowerRef.current.style.top = `${followerY}px`;
      }
      requestAnimationFrame(animateCursor);
    };

    document.body.style.cursor = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    const animationFrame = requestAnimationFrame(animateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      <div ref={cursorRef} className="fixed w-2 h-2 rounded-full bg-white z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference" style={{ transition: 'none', willChange: 'transform' }} />
      <div ref={cursorFollowerRef} className="fixed w-8 h-8 rounded-full border border-white/30 backdrop-blur-sm z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2" style={{ transition: 'none', willChange: 'transform' }} />
    </>
  );
};

// ==========================================
// Main App Component
// ==========================================
const App = () => {
    const [isNavActive, setIsNavActive] = useState(false);
    const [nameText, setNameText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });

    // Typing effect
    useEffect(() => {
        const fullText = "Om Prakash Parida";
        let currentIndex = fullText.length;
        let deleting = true;
        let typingSpeed = 150;

        const typeLoop = () => {
            if (deleting && currentIndex > 0) {
                currentIndex--;
                setNameText(fullText.substring(0, currentIndex));
            } else if (!deleting && currentIndex < fullText.length) {
                setNameText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
            }

            if (currentIndex === 0) {
                deleting = false;
                typingSpeed = 500;
            } else if (currentIndex === fullText.length) {
                deleting = true;
                typingSpeed = 1500;
            } else {
                typingSpeed = deleting ? 100 : 150;
            }
            setTimeout(typeLoop, typingSpeed);
        };
        typeLoop();
    }, []);

    const handleNavLinkClick = (e, targetId) => {
        e.preventDefault();
        setIsNavActive(false);
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({ top: targetElement.offsetTop - 100, behavior: 'smooth' });
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormMessage({ text: '', type: '' });
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        if (!name || !email || !message) {
            setFormMessage({ text: 'Please fill in all fields.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/contact/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  name: name.trim(), 
                  email: email.trim(), 
                  message: message.trim(),
                  title: `New message from ${name.trim()}` // ✅ Add this
              })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setFormMessage({ text: data.message, type: 'success' });
                e.target.reset();
            } else {
                setFormMessage({ text: data.message || 'Something went wrong.', type: 'error' });
            }
        } catch (error) {
            setFormMessage({ text: 'Failed to send message. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-gray-200 font-poppins relative selection:bg-indigo-500/30">
            <CustomCursor />

            {/* Floating Island Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-full z-50 shadow-2xl shadow-indigo-500/10 transition-all duration-300">
                <div className="px-6 py-3 flex justify-between items-center">
                    <a href="#home" className="text-white text-xl font-bold font-montserrat tracking-wide">
                        Om<span className="text-indigo-400">.</span>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#home" onClick={(e) => handleNavLinkClick(e, '#home')} className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide">Home</a>
                        <a href="#skills" onClick={(e) => handleNavLinkClick(e, '#skills')} className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide">Arsenal</a>
                        <a href="#projects" onClick={(e) => handleNavLinkClick(e, '#projects')} className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide">Work</a>
                    </div>

                    <div className="hidden md:block">
                        <a href="#contact" onClick={(e) => handleNavLinkClick(e, '#contact')} className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300">
                            Let's Talk
                        </a>
                    </div>

                    {/* Mobile Hamburger */}
                    <button className="md:hidden text-gray-200 p-2 focus:outline-none" onClick={() => setIsNavActive(!isNavActive)}>
                        <div className={`h-0.5 w-5 bg-white mb-1 transition-all ${isNavActive ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                        <div className={`h-0.5 w-5 bg-white mb-1 transition-all ${isNavActive ? 'opacity-0' : ''}`}></div>
                        <div className={`h-0.5 w-5 bg-white transition-all ${isNavActive ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                    </button>
                </div>

                {/* Mobile Dropdown */}
                <div className={`md:hidden absolute top-full mt-4 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isNavActive ? 'max-h-64 py-4 opacity-100' : 'max-h-0 py-0 opacity-0 border-transparent'}`}>
                    <a href="#home" onClick={(e) => handleNavLinkClick(e, '#home')} className="px-6 py-3 text-gray-300 hover:text-indigo-400 font-medium">Home</a>
                    <a href="#skills" onClick={(e) => handleNavLinkClick(e, '#skills')} className="px-6 py-3 text-gray-300 hover:text-indigo-400 font-medium">Arsenal</a>
                    <a href="#projects" onClick={(e) => handleNavLinkClick(e, '#projects')} className="px-6 py-3 text-gray-300 hover:text-indigo-400 font-medium">Work</a>
                    <a href="#contact" onClick={(e) => handleNavLinkClick(e, '#contact')} className="px-6 py-3 text-indigo-400 font-medium">Contact Me</a>
                </div>
            </nav>

            {/* Premium Hero Section */}
            <section id="home" className="relative flex items-center justify-center min-h-screen pt-20 px-6 overflow-hidden">
                <ParticleBackground />
                
                {/* Glowing Orbs Behind */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-4">
    {/* Availability Badge */}
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 sm:mb-8 backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider">Available for Opportunities</span>
    </div>

{/* Hero Name with strictly locked height to prevent vertical jitter */}
<h1 className="font-extrabold tracking-tight font-montserrat mb-4 sm:mb-6 text-white w-full">
    <span className="block text-xl sm:text-3xl md:text-4xl text-gray-400 mb-2">
        Hi, I'm
    </span>
    {/* Swapped min-h for a rigid h-[1.5em] and added leading-none */}
    <span className="flex items-center justify-center w-full h-[1.5em] leading-none text-[7.5vw] sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 whitespace-nowrap pr-2 py-2">
            {/* Zero-width space trick keeps the Montserrat height active even when empty */}
            {nameText || '\u200B'}
        </span>
        <span className="text-indigo-400 animate-pulse font-mono font-light ml-1 sm:ml-2">|</span>
    </span>
</h1>
    {/* Subtitle - adjusted mobile text size and added side padding */}
    <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-400 font-medium mb-8 sm:mb-10 max-w-2xl leading-relaxed px-2 sm:px-0">
        Software Engineer specializing in <span className="text-white">Full-Stack Development</span>, complex problem solving, and modern web architecture.
    </h2>

    {/* Buttons - forced to full width on mobile for better tapping */}
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
        <a href="#projects" onClick={(e) => handleNavLinkClick(e, '#projects')} className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] text-sm sm:text-base w-full sm:w-auto flex justify-center">
            Explore My Work
        </a>
        <a href="https://github.com/omprakashparida" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm text-sm sm:text-base w-full sm:w-auto">
            <i className="fab fa-github"></i> GitHub
        </a>
    </div>
</div>
            </section>

            {/* Bento Grid Skills Section */}
            <section id="skills" className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Technical Arsenal</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-white">Tools & Technologies</h3>
                    </div>

                    {/* Bento Box Layout */}
                 
<div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-auto md:auto-rows-[250px]">
                        
                        {/* Box 1: Frontend (Large) */}
                        <div className="md:col-span-2 md:row-span-1 bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors group relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500"></div>
                            <div>
                                <i className="fab fa-react text-blue-400 text-4xl mb-4"></i>
                                <h4 className="text-2xl font-bold text-white mb-2">Frontend Engineering</h4>
                                <p className="text-gray-400 max-w-md">Building fluid, responsive, and highly interactive user interfaces using React, React Router, and Tailwind CSS.</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">React.js</span>
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">Tailwind CSS</span>
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">JavaScript (ES6+)</span>
                            </div>
                        </div>

                        {/* Box 2: Problem Solving / DSA (Tall) */}
                        <div className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl p-8 flex flex-col hover:border-indigo-500/40 transition-colors relative overflow-hidden backdrop-blur-sm">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 text-2xl">
                                    <i className="fas fa-code"></i>
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-4">Logic & Algorithms</h4>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Strong foundational grasp of computational logic, optimizing time/space complexity, and rigorous problem solving. Prepping heavily for technical placement drives.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-200">Java</span>
                                    <i className="fab fa-java text-orange-400"></i>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-200">Data Structures</span>
                                    <i className="fas fa-network-wired text-indigo-400"></i>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-200">Algorithms</span>
                                    <i className="fas fa-project-diagram text-purple-400"></i>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Backend */}
                        <div className="md:col-span-1 md:row-span-1 bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors backdrop-blur-sm">
                            <div>
                                <i className="fab fa-node-js text-green-400 text-3xl mb-4"></i>
                                <h4 className="text-xl font-bold text-white mb-2">Backend & API</h4>
                                <p className="text-gray-400 text-sm">Architecting secure RESTful APIs, handling auth flows, and managing databases.</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">Node.js</span>
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">Express</span>
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">MongoDB</span>
                            </div>
                        </div>

                        {/* Box 4: AI Integration */}
                        <div className="md:col-span-1 md:row-span-1 bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                            <div className="relative z-10">
                                <i className="fas fa-brain text-purple-400 text-3xl mb-4"></i>
                                <h4 className="text-xl font-bold text-white mb-2">AI Integration</h4>
                                <p className="text-gray-400 text-sm">Leveraging LLMs and APIs to create dynamic, intelligent application features.</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                                <span className="bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300">Groq API</span>
                                <span className="bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300">Llama Models</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Split Layout Showcase (PathForge) */}
            <section id="projects" className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 lg:mb-24">
                        <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Featured Work</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-white">AI-Powered Engineering</h3>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Column: The Pitch */}
                        <div className="w-full lg:w-1/2 space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-green-400 text-sm font-medium tracking-wider uppercase">Live Application</span>
                                </div>
                                <h4 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight font-montserrat">
                                    Path<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Forge</span>
                                </h4>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    A personalized learning platform that helps students build structured journeys. It generates dynamic AI roadmaps using Llama models, tracks progress in real-time, and ensures consistency with smart API-cooldown mechanisms.
                                </p>
                            </div>

                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <i className="fas fa-project-diagram text-indigo-400"></i>
                                    </div>
                                    <div>
                                        <strong className="block text-white mb-1">Dynamic Generation</strong>
                                        <span className="text-sm text-gray-400">Multi-phase structured learning paths customized by daily available hours and goals.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <i className="fas fa-shield-alt text-purple-400"></i>
                                    </div>
                                    <div>
                                        <strong className="block text-white mb-1">Smart Security</strong>
                                        <span className="text-sm text-gray-400">OTP email verification, secure password resets, and 14-day roadmap regeneration cooldowns.</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <a href="https://path-forge-zeta.vercel.app" target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2">
                                    Launch App <i className="fas fa-arrow-right"></i>
                                </a>
                                <a href="https://github.com/omprakashparida/PathForge" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-full font-medium transition-all flex items-center gap-2">
                                    <i className="fab fa-github"></i> Source Code
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Abstract Terminal UI */}
                        <div className="w-full lg:w-1/2 relative group perspective-1000">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                            
                            <div className="relative bg-[#09090b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
                                <div className="flex items-center px-6 py-4 bg-white/5 border-b border-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <div className="mx-auto text-xs text-gray-400 font-mono tracking-wider">pathforge-engine.js</div>
                                </div>
                                
                                <div className="p-5 sm:p-8 font-mono text-xs sm:text-sm md:text-base text-gray-300 space-y-4 sm:space-y-5 break-words">
    <div className="flex gap-2 sm:gap-4">
        <span className="text-indigo-400 shrink-0">➜</span>
        <span className="text-blue-400 shrink-0">~</span>
        <span className="text-gray-100">node generateRoadmap.js --role="Full Stack"</span>
    </div>
    <div className="text-gray-500 pl-4 sm:pl-6">Authenticating user via JWT... <span className="text-green-400">[OK]</span></div>
    <div className="text-gray-500 pl-4 sm:pl-6">Connecting to Groq AI Llama model... <span className="text-green-400">[OK]</span></div>
    <div className="flex gap-3 sm:gap-4 pl-4 sm:pl-6">
        <span className="text-blue-400 shrink-0">ℹ</span>
        <span className="text-gray-300">Analyzing current skill baseline...</span>
    </div>
    <div className="flex gap-3 sm:gap-4 pl-4 sm:pl-6">
        <span className="text-blue-400 shrink-0">ℹ</span>
        <span className="text-gray-300">Enforcing 14-day regeneration cooldown...</span>
    </div>
    <div className="flex gap-3 sm:gap-4 mt-5 sm:mt-6">
        <span className="text-purple-400 shrink-0">⚡</span>
        <span className="text-white font-semibold">SUCCESS: Dynamic roadmap generated and saved.</span>
    </div>
    <div className="mt-5 sm:mt-6 pt-4 border-t border-white/5">
        <span className="text-gray-500 animate-pulse">Waiting for client interaction_</span>
    </div>
</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimalist Contact Section */}
            <section id="contact" className="py-24 px-6 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 sm:p-12 backdrop-blur-md relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10 text-center mb-10">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Let's build together.</h2>
                            <p className="text-gray-400">I'm currently looking for full-time opportunities. Drop a message below.</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="relative z-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-2">Name</label>
                                    <input type="text" name="name" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-2">Email</label>
                                    <input type="email" name="email" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-2">Message</label>
                                <textarea name="message" rows="4" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" required></textarea>
                            </div>
                            
                            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-semibold rounded-xl p-4 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                                {!isSubmitting && <i className="fas fa-paper-plane text-sm"></i>}
                            </button>

                            {formMessage.text && (
                                <div className={`p-4 rounded-xl text-center text-sm ${formMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {formMessage.text}
                                </div>
                            )}
                        </form>

                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 relative z-10">
                            <a href="mailto:omprakass747@gmail.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><i className="fas fa-envelope"></i> omprakass747@gmail.com</a>
                            <span className="text-gray-600 hidden sm:block">•</span>
                            <span className="text-gray-400 flex items-center gap-2 text-sm"><i className="fas fa-map-marker-alt"></i> Bhubaneswar, Odisha, India</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center relative z-10 border-t border-white/5">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Om Prakash Parida. Crafted with Code.</p>
                <div className="flex justify-center gap-6 mt-4">
                    <a href="https://github.com/omprakashparida" className="text-gray-500 hover:text-white transition-colors"><i className="fab fa-github"></i></a>
                    <a href="https://www.linkedin.com/in/om-prakash-parida-247982274" className="text-gray-500 hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></a>
                </div>
            </footer>
        </div>
    );
};

export default App;