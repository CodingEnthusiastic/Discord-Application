import { Download, Menu } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import Footer from './Footer';
import SplitSectionMediaLeft from './SplitSectionMediaLeft';
import SplitSectionMediaRight from './SplitSectionMediaright';
import { Layout } from '../Layout';

const LandingPage = () => {
  return (
    <>
      {/* Show Layout when signed in */}
      <SignedIn>
        <Layout />
      </SignedIn>

      {/* Show Landing Page when signed out */}
      <SignedOut>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3e] to-[#2a2a5e] relative overflow-hidden">
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Navigation */}
          <nav className="z-50 bg-gradient-to-br from-[#0a0a1f]/95 via-[#1a1a3e]/95 to-[#2a2a5e]/95 backdrop-blur-sm flex items-center justify-between px-8 py-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-white" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </svg>
              <span className="text-white font-bold text-xl">Discord</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-white text-sm font-medium">
              <a href="#" className="hover:scale-110 transition-transform duration-200">Download</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Nitro</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Discover</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Safety</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Quests</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Support</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Blog</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Developers</a>
              <a href="#" className="hover:scale-110 transition-transform duration-200">Careers</a>
            </div>

            <div className="hidden md:block">
              <SignInButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all">
                  Log In
                </button>
              </SignInButton>
            </div>

            <button className="md:hidden text-white">
              <Menu size={24} />
            </button>
          </nav>

          {/* Main Content Wrapper */}
          <div className="flex-grow">
            {/* Hero Section */}
            <div className="relative z-10 container mx-auto px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                  GROUP CHAT<br />
                  THAT'S ALL<br />
                  FUN & GAMES
                </h1>
                
                <p className="text-gray-200 text-lg leading-relaxed max-w-xl">
                  Discord is great for playing games and chilling with friends, or even building a worldwide community. Customise your own space to talk, play, and hang out.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all">
                    <Download size={20} />
                    Download for Windows
                  </button>
                  <button className="bg-[#23272A] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#2c2f33] hover:scale-105 transition-all">
                    Open Discord in your browser
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="relative w-full h-[500px] flex items-center justify-center">
                  <div className="absolute left-0 bottom-0 w-32 h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl opacity-80 animate-bounce-slow"></div>
                  <div className="absolute right-0 top-0 w-96 h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 p-4 transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded opacity-80"></div>
                  </div>
                  <div className="absolute right-8 bottom-8 w-24 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-4 border-gray-700 transform -rotate-3 hover:rotate-0 transition-transform"></div>
                  <div className="absolute top-10 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-sm opacity-60 animate-float"></div>
                  <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-blue-400 rounded-full opacity-70 animate-float-delayed"></div>
                </div>
              </div>
            </div>
          
            {/* section-1 */}
            <SplitSectionMediaLeft
              title={<>MAKE YOUR<br />GROUP CHATS<br />MORE FUN</>}
              description="Use custom emoji, stickers, soundboard effects and more to add your personality to your voice, video, or text chat. Set your avatar and a custom status, and write your own profile to show up in chat your way."
              videoUrl="https://cdn.discordapp.com/assets/content/4623222f8bd3637cf3be4a78b1d0f38e0b5ab712ee8caeb0a73e8c5672d79e20.mp4"
            />

            {/* Section-2: Streaming Feature Section */}
            <SplitSectionMediaRight 
              title="STREAM LIKE YOU'RE IN THE SAME ROOM"
              description="High quality and low latency streaming makes it feel like you're handing out on the couch with friends while playing a game, watching shows, looking at photos, or idk doing homework or something."
              videoUrl="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2%2F6763b611120b46189e164b4a_Discord_Website_Refresh_EN-transcode.mp4"
              mainStreamUser="z_lot"
              backgroundColor="from-green-900 to-green-600"
              participants={[
                { name: "Rose", avatarColor: "#7289da", avatar: "🎮" },
                { name: "z_lot", image: "/path/to/webcam-image.jpg" },
                { name: "Olive", avatarColor: "#eb459e", avatar: "👤" }
              ]}
            />

            {/* section-3 */}
            <SplitSectionMediaLeft
              title={<>HOP IN WHEN<br />YOU'RE FREE,<br />NO NEED TO<br />CALL</>}
              description="Easily hop in and out of voice or text chats without having to call or invite anyone, so your party chat lasts before, during, and after your game session."
              videoUrl="https://cdn.discordapp.com/assets/content/be300975e0960828820a67de6e5b86c791b5aacc1752c85ed0809b9fd8927ab1.mp4"
              backgroundColor="from-[#5865f2]/20 via-[#7289da]/20 to-[#5865f2]/20"
              mediaBackgroundGradient="from-purple-600/20 via-blue-600/20 to-indigo-600/20"
              containerGradient="from-purple-900/40 to-pink-900/40"
              showFloatingDecoration={false}
            />

            {/* section-4: Friends List Section - Media Right */}
            <SplitSectionMediaRight 
              title="SEE WHO'S AROUND TO CHILL"
              description="See who's around, playing games, or just hanging out. For supported games, you can see what modes or characters your friends are playing and directly join up."
              videoUrl="https://cdn.discordapp.com/assets/content/9a34b3ef89a4a735bf7fe6ec204a9f60f8edf1c53367607bc5187dbf34427d1d.mp4"
              backgroundColor="from-pink-900 to-purple-900"
              liveBadge={false}
              mainStreamUser={undefined}
              participants={[]}
            />

            {/* section-5 */}
            <SplitSectionMediaLeft
              title="ALWAYS HAVE SOMETHING TO DO TOGETHER"
              description="Watch videos, play built-in games, listen to music, or just scroll together and spam memes. Seamlessly text, call, video chat, and play games, all in one group chat."
              videoUrl="https://cdn.discordapp.com/assets/content/a65d9d028aa174831ade2a4d982298c8dfc881587d1bdf61c7e91ae6937dffc6.mp4"
              backgroundColor="from-[#404eed]/20 via-[#7289da]/20 to-[#5865f2]/20"
              mediaBackgroundGradient="from-green-600/30 via-emerald-600/30 to-teal-600/30"
              containerGradient="from-green-900/40 to-emerald-900/40"
              showFloatingDecoration={false}
            />

            {/* section-6 */}
            <SplitSectionMediaRight 
              title="WHEREVER YOU GAME, HANG OUT HERE"
              description="On your PC, phone, or console, you can still hang out on Discord. Easily switch between devices and use tools to manage multiple group chats with friends."
              videoUrl="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2%2F6763ba683086419cf7bfb7fb_Discord_Refresh_Platforms-transcode.mp4"
              backgroundColor="from-blue-900 to-purple-900"
            />
          </div>

          {/* Footer Section */}
          <Footer/>
        </div>
      </SignedOut>
    </>
  );
};

export default LandingPage;