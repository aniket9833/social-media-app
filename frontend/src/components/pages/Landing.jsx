import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Camera, Heart, MessageCircle, Users, Zap } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: Camera, text: "Share moments" },
    { icon: Heart, text: "Connect deeply" },
    { icon: MessageCircle, text: "Chat instantly" },
    { icon: Users, text: "Build community" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Main content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome To
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Pixera
                </span>
              </h1>

              <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto lg:mx-0">
                Join millions capturing and sharing life's beautiful moments.
                Connect, create, and inspire.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  >
                    <feature.icon className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="group relative px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 inline-block text-center"
                    >
                      Get Started
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 inline-block text-center"
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/feed"
                    className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 inline-block text-center"
                  >
                    Go to Feed
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - Phone mockup */}
            <div className="hidden lg:block relative">
              <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-3xl z-10"></div>

                {/* Screen content */}
                <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 p-6 overflow-hidden">
                  {/* Mock feed items */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-white/20 rounded w-24 mb-2"></div>
                            <div className="h-2 bg-white/20 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl mb-3"></div>
                        <div className="flex gap-4">
                          <Heart className="w-6 h-6 text-white/60" />
                          <MessageCircle className="w-6 h-6 text-white/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements around phone */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-yellow-300 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-pink-300 rounded-full animate-pulse opacity-80"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
