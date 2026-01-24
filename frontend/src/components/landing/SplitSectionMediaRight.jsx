import React from 'react';

const SplitSectionMediaRight = ({ 
  title, 
  description, 
  videoUrl, 
  mainStreamUser,
  participants = [],
  liveBadge = true,
  backgroundColor = "from-green-900 to-green-600"
}) => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#5865f2] to-[#3b4a9e] py-20">
      <div className="relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-10">
        {/* Left Side - Content */}
        <div className="space-y-6">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight uppercase">
            {title}
          </h2>
          
          <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* Right Side - Streaming Interface */}
        <div className="relative">
          <div className={`relative bg-gradient-to-br ${backgroundColor} rounded-[3rem] p-8 shadow-2xl`}>
            {/* Main Video Stream */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-auto aspect-video object-cover"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Live Badge */}
              {liveBadge && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  LIVE
                </div>
              )}

              {/* Username Overlay */}
              {mainStreamUser && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="font-medium text-sm">{mainStreamUser}</span>
                </div>
              )}
            </div>

            {/* Participant Grid */}
            {participants.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {participants.map((participant, index) => (
                  <div 
                    key={index}
                    className="relative bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl overflow-hidden shadow-lg aspect-video"
                  >
                    {participant.videoUrl ? (
                      <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        className="w-full h-full object-cover"
                      >
                        <source src={participant.videoUrl} type="video/mp4" />
                      </video>
                    ) : participant.image ? (
                      <img 
                        src={participant.image} 
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                          style={{ backgroundColor: participant.avatarColor || '#7289da' }}
                        >
                          {participant.avatar || participant.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* Participant Name */}
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-medium">
                      {participant.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitSectionMediaRight;