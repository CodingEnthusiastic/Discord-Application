import React from 'react';

const SplitSectionMediaLeft = ({ 
  title, 
  description, 
  videoUrl,
  backgroundColor = "from-[#404eed]/20 via-[#eb459f]/20 to-[#ed5f7c]/20",
  mediaBackgroundGradient = "from-blue-500/30 via-purple-500/30 to-pink-500/30",
  containerGradient = "from-purple-900/40 to-pink-900/40",
  showFloatingDecoration = true,
  decorationGradient = "from-pink-400 to-orange-400"
}) => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${backgroundColor}`}></div>
      
      <div className="relative z-10 w-full grid md:grid-cols-2 gap-0 items-center min-h-screen">
        {/* Left Side - Video */}
        <div className="relative h-screen flex items-center justify-center p-8 md:p-16">
          <div className="relative w-full max-w-2xl">
            {/* Decorative background blob */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mediaBackgroundGradient} rounded-[4rem] blur-3xl transform -rotate-6`}></div>
            
            {/* Video container with glass morphism effect */}
            <div className={`relative bg-gradient-to-br ${containerGradient} backdrop-blur-xl rounded-[3rem] p-6 shadow-2xl border border-white/10`}>
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-auto rounded-2xl shadow-2xl"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Floating character decoration */}
              {showFloatingDecoration && (
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${decorationGradient} rounded-3xl flex items-center justify-center shadow-xl animate-float`}>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="relative h-screen flex items-center justify-center p-8 md:p-16">
          <div className="max-w-xl space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              {title}
            </h2>
            
            <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default SplitSectionMediaLeft;