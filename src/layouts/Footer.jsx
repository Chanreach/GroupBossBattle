// ===== LIBRARIES ===== //
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#18181b] text-white border-t border-gray-700">
            <div className="container mx-auto px-6 py-9">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                    {/* Logo Section */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="flex items-center space-x-3">
                            <img
                                className="w-12 h-12 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                                src="/src/assets/Swords.png"
                                alt="UniRAID Logo"
                            />
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    UniRAID
                                </h3>
                                <p className="text-sm text-gray-400">Group Boss Battle</p>
                            </div>
                        </div>
                        {/* <p className="text-sm text-gray-400 text-center md:text-left max-w-xs">
                            Epic multiplayer boss battles for university students. Challenge yourself and compete for glory!
                        </p> */}
                    </div>

                    {/* Project Info */}
                    <div className="flex flex-col items-center md:items-end space-y-3">
                        <div className="text-center md:text-right">
                            <h4 className="text-lg font-semibold text-gray-200 mb-2">Project Info</h4>
                            <p className="text-sm text-gray-400">CS 313 - Software Engineering</p>
                            <p className="text-sm text-gray-400">Final Project 2025</p>
                            <p className="text-sm text-gray-400">
                                Paragon International University
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-sm text-gray-400">
                        © {currentYear} UniRAID. All rights reserved.
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">Built with</span>
                        <TooltipProvider>
                            <div className="flex items-center space-x-3">
                                {/* React */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <img
                                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                                                alt="React"
                                                className="w-4 h-4"
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>React</p>
                                    </TooltipContent>
                                </Tooltip>

                                {/* Tailwind CSS */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <img
                                                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
                                                alt="Tailwind CSS"
                                                className="w-4 h-4"
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tailwind CSS</p>
                                    </TooltipContent>
                                </Tooltip>

                                {/* shadcn/ui */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-4 h-4 text-white">
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

                                {/* Node.js */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <img
                                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                                                alt="Node.js"
                                                className="w-4 h-4"
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Node.js</p>
                                    </TooltipContent>
                                </Tooltip>

                            </div>
                        </TooltipProvider>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
