"use client";

import { useEffect, useState } from "react";

type HeroImage = { id: string; name: string; image_url: string };

export default function SPHeroCarousel({ images }: { images: HeroImage[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const current = images[active];
  return (
    <div className="sp-hero-image" aria-label={current ? `Featured catalogue product: ${current.name}` : "SP Clothing Services collection"}>
      {current ? <div key={current.id} className="sp-hero-photo" style={{ backgroundImage: `url("${current.image_url}")` }} /> : <div className="sp-hero-photo sp-hero-photo-empty" />}
      <div className="sp-image-label">THE NEW<br/><i>POINT OF VIEW</i></div>
      <span className="sp-image-index">{current ? `SP — ${String(active + 1).padStart(3, "0")}` : "SP CLOTHING"}</span>
      {images.length > 1 && <div className="sp-hero-progress" aria-hidden="true">{images.map((image, index) => <span key={image.id} className={index === active ? "active" : ""} />)}</div>}
    </div>
  );
}
