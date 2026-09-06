import React, { useEffect, useState } from "react";
import { Footer } from "../layout/index";
import { Hero } from "../components/Hero";
import { ValueProp } from "../components/ValueProp";
import SimilarSpecimensRow from "../components/SimilarSpecimensRow";
import { getTrending, getFeatured, getNewArrivals } from "../util/groveApi";

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    getTrending(12, 30).then((res) => setTrending(res.data)).catch(() => setTrending([]));
    getFeatured().then((res) => setFeatured(res.data)).catch(() => setFeatured([]));
    getNewArrivals(12).then((res) => setNewArrivals(res.data)).catch(() => setNewArrivals([]));
  }, []);

  return (
    <main className="bg-background text-foreground selection:bg-primary/20">
      <div className="pt-20">
        <Hero spotlightSpecimen={featured[0]} floatingSpecimens={featured.slice(1, 4)} />
      </div>
      <section className="relative py-24 px-6 lg:px-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <ValueProp />
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-12 pb-24 space-y-4">
        <SimilarSpecimensRow title="Trending This Week" books={trending} emptyMessage="No trending books yet — check back once a few loans come in." />
        <SimilarSpecimensRow title="Featured" books={featured} />
        <SimilarSpecimensRow title="New Arrivals" books={newArrivals} />
      </div>

      <Footer />
    </main>
  );
}
