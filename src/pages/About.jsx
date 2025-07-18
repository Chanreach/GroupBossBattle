// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Code, Palette, Database, Github, Linkedin, Mail, Target, Sparkles, ArrowRight, Heart } from "lucide-react";
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ===== STYLES ===== //
import "@/index.css";



const About = () => {
  const navigate = useNavigate();
  const [logoClicked, setLogoClicked] = useState(false);

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
    <main className="flex-grow">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen overflow-hidden py-6 bg-[#f3f0ff] dark:bg-[#140f25]">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48">
          <div className="max-w-6xl mx-auto text-center w-full">
            {/* Main Hero Content */}
            <div className="mb-12 sm:mb-16">
              {/* Swords Image */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <img
                  src="/src/assets/Swords.png"
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-2">

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-2">
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
        id="team"
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
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

          {/* Team Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg mb-2">Frontend Development</CardTitle>
                <CardDescription>
                  Creating beautiful, responsive user interfaces with React and modern web technologies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg mb-2">Backend Development</CardTitle>
                <CardDescription>
                  Building robust server-side logic, APIs, and database management systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg mb-2">UI/UX Design</CardTitle>
                <CardDescription>
                  Designing intuitive user experiences and crafting visually appealing interfaces.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Team Members */}
          <div className="flex flex-col items-center gap-12">
            {/* First row - 3 members */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center">
              {/* Chansovisoth */}
              <Card className="flex flex-col text-center p-6 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="flex-grow">
                  <CardHeader>
                    <div className="w-46 h-46 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src="/src/assets/About_Chansovisoth.jpg"
                        alt="Chansovisoth Wattanak"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg -mb-1.5">Chansovisoth Wattanak</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">cwattanak@paragoniu.edu.kh</p>
                    <CardDescription className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                      Frontend Developer
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center gap-3 mt-0">
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
              </Card>

              {/* Chanreach */}
              <Card className="flex flex-col text-center p-6 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="flex-grow">
                  <CardHeader>
                    <div className="w-46 h-46 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src="/src/assets/About_Chanreach.jpg"
                        alt="Chanreach Try"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg -mb-1.5">Chanreach Try</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">ctry1@paragoniu.edu.kh</p>
                    <CardDescription className="text-green-600 dark:text-green-400 font-semibold mb-3">
                      Backend Developer
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center gap-3 mt-0">
                  <a href="https://github.com/ChanreachTry" className="text-gray-600 hover:text-green-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ctry1%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </Card>

              {/* Rithy */}
              <Card className="flex flex-col text-center p-6 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="flex-grow">
                  <CardHeader>
                    <div className="w-46 h-46 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src="/src/assets/About_Rithy.jpg"
                        alt="Rithy Chan"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg -mb-1.5">Rithy Chan</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">rchan2@paragoniu.edu.kh</p>
                    <CardDescription className="text-purple-600 dark:text-purple-400 font-semibold mb-3">
                      Backend Developer
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center gap-3 mt-0">
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
              </Card>
            </div>

            {/* Second row - 2 members centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 justify-center">
              {/* Sodavith */}
              <Card className="flex flex-col text-center p-6 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="flex-grow">
                  <CardHeader>
                    <div className="w-46 h-46 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src="/src/assets/About_Sodavith.jpg"
                        alt="Soeurn Sodavith"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg -mb-1.5">Sodavith Nuon</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">snuon@paragoniu.edu.kh</p>
                    <CardDescription className="text-orange-600 dark:text-orange-400 font-semibold mb-3">
                      UI/UX Designer
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center gap-3 mt-0">
                  <a href="https://github.com/sodavith" className="text-gray-600 hover:text-orange-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/sodavith" className="text-gray-600 hover:text-orange-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=snuon%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </Card>

              {/* Sovitep */}
              <Card className="flex flex-col text-center p-6 hover:shadow-lg transition-shadow duration-300 w-[300px] mx-auto">
                <div className="flex-grow">
                  <CardHeader>
                    <div className="w-46 h-46 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src="/src/assets/About_Sovitep.jpg"
                        alt="Sovitep Chea"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg -mb-1.5">Sovitep Chea</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">schea8@paragoniu.edu.kh</p>
                    <CardDescription className="text-red-600 dark:text-red-400 font-semibold mb-3">
                      Frontend Developer
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center gap-3 mt-0">
                  <a href="https://github.com/sovitep" className="text-gray-600 hover:text-red-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/sovitep" className="text-gray-600 hover:text-red-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=schea8%40paragoniu.edu.kh&authuser=0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default About;

