import React from 'react'

const Header = () => {
  return (
    <header className="relative h-screen w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-black to-amber-950/40" />
      
      <div className="relative h-full flex items-center justify-center px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
          <div className="text-center md:text-left space-y-10">
            <h1 className="text-7xl md:text-9xl font-black leading-tight">
              Everyday<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                essentials.
              </span><br/>
              On fire.
            </h1>
            <p className="text-2xl text-gray-300 max-w-lg">
              Clothing, electronics, daily gear — bold, tough, priced right.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
              <a href="#shop" className="px-12 py-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full font-bold text-xl hover:scale-105 transition shadow-2xl">
                Shop Now
              </a>
              <a href="#drops" className="px-12 py-6 border-2 border-orange-500 text-orange-400 rounded-full font-bold text-xl hover:bg-orange-500/20 transition">
                New Drops →
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <img src="/src/assets/Bol.png" alt="Bolt" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              <div className="absolute -inset-20 blur-3xl opacity-50">
                <div className="w-full h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-orange-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-orange-500 rounded-full mt-2" />
        </div>
      </div>
    </header>
  )
}

export default Header