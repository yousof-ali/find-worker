'use client';

import React from 'react';

export default function ContributorMarquee() {
  const columnData = [
    // Column 1: Stacked (Stat + Video)
    {
      type: 'stacked',
      top: {
        type: 'stat',
        value: '50',
        label: 'Countries',
        bg: 'bg-gradient-to-b from-neutral-600 to-neutral-800 text-white',
        height: 'h-[140px]',
      },
      bottom: {
        type: 'video',
        name: 'Enzo D.',
        role: 'Dutch Language Expert',
        gradient: 'from-black/90 via-black/40 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-video-conference-with-his-laptop-42998-large.mp4',
        poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        height: 'h-[180px]',
      },
    },

    // Column 2: Single Tall Video
    {
      type: 'tall',
      card: {
        type: 'video',
        name: 'Tara',
        role: 'Coding Expert, Australia',
        gradient: 'from-emerald-950/90 via-emerald-950/30 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42999-large.mp4',
        poster: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        height: 'h-[330px]',
      },
    },

    // Column 3: Stacked (Video + Stat)
    {
      type: 'stacked',
      top: {
        type: 'video',
        name: 'Andrew',
        role: 'Coding Expert, Thailand',
        gradient: 'from-black/90 via-black/40 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4',
        poster: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        height: 'h-[195px]',
      },
      bottom: {
        type: 'stat',
        value: '4.1/5',
        label: 'Rated by 3k+ experts on Trustpilot',
        bg: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white',
        height: 'h-[125px]',
      },
    },

    // Column 4: Single Tall Video
    {
      type: 'tall',
      card: {
        type: 'video',
        name: 'Mads D.',
        role: 'Danish Language Expert',
        gradient: 'from-black/90 via-black/40 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-developer-working-on-code-screen-1728-large.mp4',
        poster: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        height: 'h-[330px]',
      },
    },

    // Column 5: Stacked (Stat + Video)
    {
      type: 'stacked',
      top: {
        type: 'stat',
        value: '$500M+',
        label: 'Paid to experts',
        bg: 'bg-gradient-to-br from-blue-500 to-sky-600 text-white',
        height: 'h-[135px]',
      },
      bottom: {
        type: 'video',
        name: 'Cuong N.',
        role: 'SWE, Zinza Tech',
        gradient: 'from-purple-950/90 via-purple-950/40 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4',
        poster: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        height: 'h-[185px]',
      },
    },

    // Column 6: Single Tall Video
    {
      type: 'tall',
      card: {
        type: 'video',
        name: 'Max N.',
        role: 'Generalist, Poland',
        gradient: 'from-emerald-950/90 via-emerald-950/30 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-along-a-beach-at-sunset-42997-large.mp4',
        poster: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
        height: 'h-[330px]',
      },
    },

    // Column 7: Stacked (Video + Stat)
    {
      type: 'stacked',
      top: {
        type: 'video',
        name: 'Robin Francis',
        role: 'Math Expert, US',
        gradient: 'from-lime-950/90 via-lime-950/40 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-work-meeting-online-with-a-laptop-42996-large.mp4',
        poster: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
        height: 'h-[195px]',
      },
      bottom: {
        type: 'stat',
        value: '700K+',
        label: 'PhD, MS students onboarded',
        bg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white',
        height: 'h-[125px]',
      },
    },

    // Column 8: Single Tall Video
    {
      type: 'tall',
      card: {
        type: 'video',
        name: 'Nicholas',
        role: 'Coding Contributor',
        gradient: 'from-blue-950/90 via-blue-950/30 to-transparent',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-talking-at-video-conference-on-laptop-42995-large.mp4',
        poster: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
        height: 'h-[330px]',
      },
    },
  ];

  return (
    <section className="py-10 bg-white overflow-hidden relative border-b border-slate-100">
      {/* Side gradient fade masks for smooth infinite ticker look */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee Track Container */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 items-center">
        {/* Render twice for continuous infinite seamless loop */}
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="flex gap-4 items-center shrink-0">
            {columnData.map((col, idx) => (
              <div key={idx} className="w-[190px] md:w-[215px] shrink-0">
                {col.type === 'stacked' && col.top && col.bottom ? (
                  <div className="flex flex-col gap-3">
                    {/* Top Card */}
                    {col.top.type === 'stat' ? (
                      <div className={`${col.top.bg} ${col.top.height} rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
                        <div className="text-3xl font-extrabold tracking-tight font-mono">{col.top.value}</div>
                        <div className="text-xs font-medium leading-snug opacity-90">{col.top.label}</div>
                      </div>
                    ) : (
                      <div className={`relative ${col.top.height} rounded-2xl overflow-hidden shadow-sm bg-slate-900 group`}>
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={col.top.poster}
                          className="absolute inset-0 w-full h-full object-cover"
                        >
                          <source src={col.top.videoSrc} type="video/mp4" />
                        </video>
                        <div className={`absolute inset-0 bg-gradient-to-t ${col.top.gradient} flex flex-col justify-end p-3.5 text-white`}>
                          <div className="text-sm font-bold tracking-tight leading-tight">{col.top.name}</div>
                          <div className="text-[11px] text-slate-200 font-medium leading-snug mt-0.5">{col.top.role}</div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Card */}
                    {col.bottom.type === 'stat' ? (
                      <div className={`${col.bottom.bg} ${col.bottom.height} rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
                        <div className="text-2xl font-extrabold tracking-tight font-mono">{col.bottom.value}</div>
                        <div className="text-xs font-medium leading-snug opacity-90">{col.bottom.label}</div>
                      </div>
                    ) : (
                      <div className={`relative ${col.bottom.height} rounded-2xl overflow-hidden shadow-sm bg-slate-900 group`}>
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={col.bottom.poster}
                          className="absolute inset-0 w-full h-full object-cover"
                        >
                          <source src={col.bottom.videoSrc} type="video/mp4" />
                        </video>
                        <div className={`absolute inset-0 bg-gradient-to-t ${col.bottom.gradient} flex flex-col justify-end p-3.5 text-white`}>
                          <div className="text-sm font-bold tracking-tight leading-tight">{col.bottom.name}</div>
                          <div className="text-[11px] text-slate-200 font-medium leading-snug mt-0.5">{col.bottom.role}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : col.card ? (
                  /* Tall Card */
                  <div className={`relative ${col.card.height} rounded-2xl overflow-hidden shadow-sm bg-slate-900 group`}>
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={col.card.poster}
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={col.card.videoSrc} type="video/mp4" />
                    </video>
                    <div className={`absolute inset-0 bg-gradient-to-t ${col.card.gradient} flex flex-col justify-end p-4 text-white`}>
                      <div className="text-base font-bold tracking-tight leading-tight">{col.card.name}</div>
                      <div className="text-xs text-slate-200 font-medium leading-snug mt-0.5">{col.card.role}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
