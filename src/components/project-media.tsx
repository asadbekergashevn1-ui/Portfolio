'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useShown } from './reveal';
import type { Project } from '@/content/types';

type Props = {
  project: Project;
  /** Above the fold: load the poster eagerly. */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Card / hero media.
 *
 * - Desktop (fine pointer + hover): muted clip plays while the card is hovered or focused.
 * - Touch: plays while at least 60% of it is on screen, pauses when it leaves.
 * - prefers-reduced-motion: never autoplays; the poster stays.
 * - The video source is attached on desktop at the first hover/focus, on touch when
 *   the card nears the viewport — a grid of cards never downloads every clip at once.
 * - No clip yet: a typographic panel, which the design system treats as a
 *   first-class state rather than a missing image.
 */
export function ProjectMedia({ project, priority = false, sizes = '(min-width: 1024px) 33vw, 100vw', className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const { video, poster, screenshots } = project.media;
  const still = poster ?? screenshots[0]?.src ?? null;
  const hasVideo = Boolean(video) && !failed;
  const shown = useShown(wrapRef);

  // Attach the source only when it can play: on desktop at the first hover or focus
  // (that is the only time it plays), on touch when the card is about to be seen.
  useEffect(() => {
    if (!hasVideo || !wrapRef.current) return;
    const el = wrapRef.current;
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const card = (el.closest('[data-card]') as HTMLElement | null) ?? el;
      const attach = () => setNear(true);
      card.addEventListener('pointerenter', attach, { once: true });
      card.addEventListener('focusin', attach, { once: true });
      return () => {
        card.removeEventListener('pointerenter', attach);
        card.removeEventListener('focusin', attach);
      };
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasVideo]);

  // Playback policy.
  useEffect(() => {
    if (!hasVideo || !near) return;
    const wrap = wrapRef.current;
    const vid = videoRef.current;
    if (!wrap || !vid) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const play = () => {
      vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    const pause = () => {
      vid.pause();
      setPlaying(false);
    };

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) {
      const card = (wrap.closest('[data-card]') as HTMLElement | null) ?? wrap;
      // the source was attached by this hover: start now rather than wait for the next one
      if (card.matches(':hover') || card.contains(document.activeElement)) play();
      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', pause);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', pause);
      return () => {
        card.removeEventListener('mouseenter', play);
        card.removeEventListener('mouseleave', pause);
        card.removeEventListener('focusin', play);
        card.removeEventListener('focusout', pause);
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.intersectionRatio >= 0.6 ? play() : pause()),
      { threshold: [0, 0.6, 1] },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [hasVideo, near]);

  return (
    <div
      ref={wrapRef}
      data-media={project.slug}
      className={`media-reveal relative overflow-hidden bg-sunken ${shown ? 'is-shown' : ''} ${className}`}
      style={{ aspectRatio: '16 / 10' }}
    >
      <div className="media-zoom absolute inset-0">
      {still ? (
        <Image
          src={still}
          alt={screenshots[0]?.alt ?? `${project.name} interface`}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover object-top transition-opacity duration-500 ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : (
        <Fallback project={project} />
      )}

      {hasVideo && near && video ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          preload="metadata"
          poster={still ?? undefined}
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setFailed(true)}
        >
          <source src={video.src} type={video.type} />
        </video>
      ) : null}
      </div>
    </div>
  );
}

function Fallback({ project }: { project: Project }) {
  const lead = project.metrics[0];
  return (
    <div className="grid-field hero-field absolute inset-0 flex flex-col justify-between p-6" aria-hidden="true">
      <span className="label text-ink-4">{project.year}</span>
      <div>
        {lead ? (
          <>
            <div className="figure text-[clamp(2rem,4vw,3rem)] font-semibold leading-none text-ink">{lead.value}</div>
            <div className="label mt-2 text-ink-3">{lead.label}</div>
          </>
        ) : (
          <div className="display text-3xl text-ink-3">{project.name}</div>
        )}
      </div>
    </div>
  );
}
