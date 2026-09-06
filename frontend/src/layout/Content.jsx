import React from 'react';

const Content = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 text-white pt-32 pb-32 md:pb-64">
     
      <section className="max-w-7xl mx-auto text-center px-6">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight">
          Vision<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">
            shared.
          </span><br />
          <span className="text-white/90">Clarity</span> found.
        </h1>

        <p className="mt-10 text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light">
          Where creators ignite ideas and readers discover meaning in every word.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/contents"
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-teal-600 to-indigo-600 rounded-full font-bold text-xl hover:scale-105 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300"
          >
            Explore Contents
          </a>
          <a
            href="/register"
            className="inline-flex items-center px-10 py-5 border-2 border-teal-500/50 text-teal-400 rounded-full font-bold text-xl hover:bg-teal-950/40 hover:border-teal-400 transition-all duration-300"
          >
            Start Creating →
          </a>
        </div>
      </section>

   
      <section className="max-w-7xl mx-auto mt-32 md:mt-48 px-6">
        <h2 className="text-5xl md:text-7xl font-black text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
          Discover Your Path
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              name: "Read & Collect",
              img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", // cozy reading vibe
              desc: "Immerse yourself in visionary stories, essays, and ideas.",
            },
            {
              name: "Create & Share",
              img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", // creator at work
              desc: "Turn your thoughts into content that inspires others.",
            },
            {
              name: "Connect Deeply",
              img: "https://images.unsplash.com/photo-1522202176988-66273c2b33c5?w=800", // community/connections
              desc: "Engage with creators and readers who see the world like you.",
            },
          ].map((item) => (
            <div key={item.name} className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-96 md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <h3 className="text-4xl md:text-6xl font-black text-teal-300 drop-shadow-2xl mb-3">
                  {item.name}
                </h3>
                <p className="text-lg md:text-xl text-slate-200 opacity-90">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      <section className="max-w-7xl mx-auto mt-48 md:mt-64 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-20">
          Why Creators & Readers Choose Augen
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
          {[
            { stat: "500K+", label: "Active Creators" },
            { stat: "2M+", label: "Contents Shared" },
            { stat: "100+", label: "Countries" },
            { stat: "24/7", label: "Community Support" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-6xl md:text-8xl font-black text-teal-400">{item.stat}</div>
              <p className="mt-4 text-xl md:text-2xl text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto mt-48 md:mt-64 px-6">
        <h2 className="text-5xl md:text-7xl font-black text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
          Fresh Visions This Week
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "The Art of Focus", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800" },
            { title: "Future of Storytelling", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" },
            { title: "Mindful Creation", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800" },
          ].map((drop) => (
            <div
              key={drop.title}
              className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
            >
              <img
                src={drop.img}
                alt={drop.title}
                className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl">
                  {drop.title}
                </h3>
                <p className="text-xl md:text-2xl font-bold text-teal-300 mt-3">Discover →</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Content;