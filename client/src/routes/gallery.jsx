/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getSiteContent } from "../libs/api/api.endpoints";
import { useCopy } from "../libs/hooks/use-copy";
import { PageHero } from "../components/system/system";
import heroImage from "../assets/brand/club-community.jpg";
import "../libs/styles/gallery.css";

/**
 * ATP photo gallery. Images are uploaded by an administrator under Admin → Gallery and
 * stored on the site content document, so the page needs no build to change.
 */
export default function GalleryPage() {
  const copy = useCopy();
  const { data, isLoading } = useQuery({ queryKey: ["site-content"], queryFn: getSiteContent, staleTime: 300000 });
  const images = (data?.gallery || []).filter(Boolean);
  const [lightbox, setLightbox] = useState(null);

  return <main className="galleryPage">
    <PageHero
      compact
      eyebrow={copy("gallery.hero.eyebrow", "ATP gallery")}
      title={copy("gallery.hero.title", "Life on our courts.")}
      text={copy("gallery.hero.text", "Match days, training mornings and club moments from across the ATP International season.")}
      image={heroImage}
    />
    <section className="galleryShell atpShell">
      {isLoading
        ? <div className="galleryGrid">{Array.from({ length: 6 }, (_, index) => <i className="gallerySkeleton" key={index} />)}</div>
        : !images.length
          ? <div className="galleryEmpty"><Icon icon="solar:gallery-wide-linear" /><h2>Photographs coming soon.</h2><p>{copy("gallery.empty", "Photographs from the current season are being prepared. Check back shortly.")}</p></div>
          : <>
            <p className="galleryCount">{images.length} {images.length === 1 ? "photograph" : "photographs"}</p>
            <div className="galleryGrid">
              {images.map((image, index) => <button className="galleryTile" key={`${image}-${index}`} onClick={() => setLightbox(index)} aria-label={`Open photograph ${index + 1} of ${images.length}`}>
                <img src={image} alt="" loading={index < 6 ? "eager" : "lazy"} />
                <span><Icon icon="solar:maximize-square-minimalistic-linear" /></span>
              </button>)}
            </div>
          </>}
    </section>
    {lightbox !== null && <Lightbox images={images} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />}
  </main>;
}

function Lightbox({ images, index, onIndex, onClose }) {
  const step = direction => onIndex((index + direction + images.length) % images.length);
  useEffect(() => {
    const onKey = event => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return <div className="galleryLightbox" role="dialog" aria-modal="true" aria-label="Gallery photograph" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="galleryClose" onClick={onClose} aria-label="Close gallery"><Icon icon="solar:close-circle-linear" /></button>
    {images.length > 1 && <button className="galleryStep prev" onClick={() => step(-1)} aria-label="Previous photograph"><Icon icon="solar:alt-arrow-left-linear" /></button>}
    <figure><img src={images[index]} alt="" /><figcaption>{index + 1} / {images.length}</figcaption></figure>
    {images.length > 1 && <button className="galleryStep next" onClick={() => step(1)} aria-label="Next photograph"><Icon icon="solar:alt-arrow-right-linear" /></button>}
  </div>;
}
