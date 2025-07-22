// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Code, Palette, Database, Github, Linkedin, Mail, Target, Sparkles, ArrowRight, Heart } from "lucide-react";
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ===== LIB ===== //
import IntersectionObserver, { useIntersectionObserver } from "@/lib/IntersectionObserver.jsx";

// ===== STYLES ===== //
import "@/index.css";

// ===== ABOUT CONTENT COMPONENT ===== //
const AboutContent = () => {
  const navigate = useNavigate();
  const [logoClicked, setLogoClicked] = useState(false);
  const { registerSection, isVisible } = useIntersectionObserver();

  // ===== HANDLERS ===== //
  const handleGetStarted = () => {
    navigate("/auth?mode=register");
  };

  const handleLearnMore = () => {
    document.getElementById("team")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleLogoClick = async () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);

    await startConfettiCelebration({
      origin: { x: 0.5, y: 0.3 },
      maxBursts: 1,
      burstInterval: 1500,
    });
  };



  return (
    <main className="flex-grow w-full overflow-y-hidden overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section 
        ref={el => registerSection('hero', el)}
        id="hero"
        className={`overflow-y-hidden relative min-h-screen py-6 bg-[#f3f0ff] dark:bg-[#140f25] transition-all duration-1000 ease-out ${
          isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 w-full">
          <div className="max-w-6xl mx-auto text-center w-full">
            {/* Main Hero Content */}
            <div className={`mb-12 sm:mb-16 transition-all duration-1000 ease-out delay-300 ${
              isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {/* Swords Image */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <img
                  src="https://em-content.zobj.net/source/microsoft-3D-fluent/406/crossed-swords_2694-fe0f.png"
                  alt="Crossed Swords"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-lg cursor-pointer"
                  onClick={handleLogoClick}
                />
              </div>
              <h1 className="hero-text-gradient dark:text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                About UniRAID
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-normal px-2 mb-8">
                Developed as part of our Software Engineering course (CS 313)
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
                Each team member contributed their unique skills to create this comprehensive boss battle platform
                that combines modern frontend technologies, robust backend architecture, and intuitive user experience design.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-2 transition-all duration-1000 ease-out delay-500 ${
              isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>

              <Button
                onClick={handleLearnMore}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 rounded-xl backdrop-blur-sm group bg-transparent"
              >
                Meet Our Team
                <Users className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* Project Stats */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-2 transition-all duration-1000 ease-out delay-700 ${
              isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">5</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Team Members</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">CS 313</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Course Project</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">2025</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Year Developed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEAM MEMBERS SECTION ===== */}
      <section
        ref={el => registerSection('team', el)}
        id="team"
        className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 w-full transition-all duration-1000 ease-out ${
          isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out delay-200 ${
            isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Our Team
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-2">
              Meet the
              <span className="pb-3 block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Developers
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              The talented individuals who brought UniRAID to life through their dedication, expertise, and collaborative spirit.
            </p>
          </div>

          {/* Technologies */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 transition-all duration-1000 ease-out delay-400 ${
            isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg mb-4">Frontend Development</CardTitle>
                <TooltipProvider>
                  <div className="flex justify-center gap-3 mb-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                            alt="React.js"
                            className="w-6 h-6"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>React.js</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
                            alt="Tailwind CSS"
                            className="w-6 h-6"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tailwind CSS</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-6 h-6 text-black dark:text-white">
                            <rect width="256" height="256" fill="none"></rect>
                            <line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
                            <line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
                          </svg>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>shadcn/ui</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <CardDescription>
                  Built with React.js, styled with Tailwind CSS, and enhanced with shadcn/ui components for a modern, responsive interface.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg mb-4">Backend Development</CardTitle>
                <TooltipProvider>
                  <div className="flex justify-center gap-3 mb-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                            alt="Node.js"
                            className="w-6 h-6"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Node.js</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
                            alt="Express.js"
                            className="w-6 h-6 dark:invert"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Express.js</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <CardDescription>
                  Powered by Node.js runtime with Express.js framework for robust server-side logic, RESTful APIs, and real-time socket connections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg mb-4">UI/UX Design</CardTitle>
                <TooltipProvider>
                  <div className="flex justify-center gap-3 mb-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://cdn.productivity.directory/tools/2f7d5938-4427-4f3b-81c1-084f6d5ef70a"
                            alt="LucidChart"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>LucidChart</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-10 h-10 bg-accent rounded-lg border-2 flex items-center justify-center">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Diagrams.net_Logo.svg/800px-Diagrams.net_Logo.svg.png"
                            alt="Draw.io"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Draw.io</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <CardDescription>
                  Designed with LucidChart and Draw.io for wireframing and system architecture, creating intuitive user experiences and visual workflows.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Team Members */}
          <div className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-out delay-600 ${
            isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* First row - 3 members */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center">
              {/* Chansovisoth */}
              <Card className="flex flex-col text-center p-5 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="py-4 border-2 border-dashed rounded-sm">
                  <div className="flex-grow">
                    <CardHeader>
                      <div className="w-46 h-46 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src="/src/assets/About_Chansovisoth.jpg"
                          alt="Chansovisoth Wattanak"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg -mb-1.5">Chansovisoth Wattanak</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">cwattanak@paragoniu.edu.kh</p>
                      <CardDescription className="text-blue-600 dark:text-blue-400 font-semibold mb-0">
                        Project Manager<br />
                        Frontend Developer<br />
                        UI/UX Designer
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex justify-center gap-3 mt-3">
                    <a href="https://github.com/Chansovisoth" className="text-gray-600 hover:text-blue-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="https://www.linkedin.com/in/Chansovisoth" className="text-gray-600 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=cwattanak%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>

              {/* Chanreach */}
              <Card className="flex flex-col text-center p-5 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="py-4 border-2 border-dashed rounded-sm">
                  <div className="flex-grow">
                    <CardHeader>
                      <div className="w-46 h-46 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src="/src/assets/About_Chanreach.jpg"
                          alt="Chanreach Try"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg -mb-1.5">Chanreach Try</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">ctry1@paragoniu.edu.kh</p>
                      <CardDescription className="text-green-600 dark:text-green-400 font-semibold mb-0">
                        Technical Lead<br />
                        Backend Developer<br /><br />
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex justify-center gap-3 mt-3">
                    <a href="https://github.com/Chanreach" className="text-gray-600 hover:text-green-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ctry1%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>

              {/* Rithy */}
              <Card className="flex flex-col text-center p-5 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="py-4 border-2 border-dashed rounded-sm">
                  <div className="flex-grow">
                    <CardHeader>
                      <div className="w-46 h-46 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src="/src/assets/About_Rithy.jpg"
                          alt="Rithy Chan"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg -mb-1.5">Rithy Chan</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">rchan2@paragoniu.edu.kh</p>
                      <CardDescription className="text-purple-600 dark:text-purple-400 font-semibold mb-0">
                        Frontend Developer<br />
                        Backend Developer<br /><br />
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex justify-center gap-3 mt-3">
                    <a href="https://github.com/Rithy404" className="text-gray-600 hover:text-purple-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="https://www.linkedin.com/in/rithy-chan-67314033b/" className="text-gray-600 hover:text-purple-600 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=rchan2%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Second row - 2 members centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 justify-center">
              {/* Sodavith */}
              <Card className="flex flex-col text-center p-5 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="py-4 border-2 border-dashed rounded-sm">
                  <div className="flex-grow">
                    <CardHeader>
                      <div className="w-46 h-46 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src="/src/assets/About_Sodavith.jpg"
                          alt="Soeurn Sodavith"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg -mb-1.5">Sodavith Nuon</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">snuon@paragoniu.edu.kh</p>
                      <CardDescription className="text-orange-600 dark:text-orange-400 font-semibold mb-0">
                        Frontend Developer<br />
                        Backend Developer<br /><br />
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex justify-center gap-3 mt-3">
                    <a href="https://github.com/sodavith" className="text-gray-600 hover:text-orange-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=snuon%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>

              {/* Sovitep */}
              <Card className="flex flex-col text-center p-5 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="py-4 border-2 border-dashed rounded-sm">
                  <div className="flex-grow">
                    <CardHeader>
                      <div className="w-46 h-46 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src="/src/assets/About_Sovitep.jpg"
                          alt="Sovitep Chea"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg -mb-1.5">Sovitep Chea</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">schea8@paragoniu.edu.kh</p>
                      <CardDescription className="text-red-600 dark:text-red-400 font-semibold mb-0">
                        Frontend Developer<br />
                        UI/UX Designer<br /><br />
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex justify-center gap-3 mt-3">
                    <a href="https://github.com/sovitep" className="text-gray-600 hover:text-red-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=schea8%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

// ===== MAIN ABOUT COMPONENT WITH PROVIDER ===== //
const About = () => {
  return (
    <IntersectionObserver initialVisible={['hero']}>
      <AboutContent />
    </IntersectionObserver>
  );
};

export default About;

