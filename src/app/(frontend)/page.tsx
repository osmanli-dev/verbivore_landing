import Link from 'next/link'
import { getSiteSettings, getHomePage, getNewsItems, getPartners, getGallery, getExamTimes } from '@/lib/globals'
import { pageMetadata, SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const hp = await getHomePage()
  const title = `${SITE_NAME} — International English Olympiad`
  const meta = pageMetadata({
    title,
    description: hp.heroSubtitle || DEFAULT_DESCRIPTION,
    path: '',
    image: (hp.heroImage as any)?.url ?? undefined,
  })
  meta.title = { absolute: title }
  return meta
}

const FALLBACK_HERO_IMG = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80'

type GalleryItem = {
  image: string
  title: string
  text: string
  tag: string
  stage: string
  mediaType: 'photo' | 'video'
  videoUrl: string
  videoFile: string
}

const FALLBACK_GALLERY: GalleryItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    title: 'Böyük Final mərasimi',
    text: 'Londonda keçirilən Böyük Finalın mükafatlandırma mərasimindən görüntülər.',
    tag: 'Seçilmiş Media',
    stage: 'grand-final',
    mediaType: 'photo',
    videoUrl: '',
    videoFile: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
    title: 'İmtahan günü',
    text: 'Şagirdlər yazılı imtahan turunda diqqətli və qətiyyətli görünürlər.',
    tag: 'Foto',
    stage: 'preliminary',
    mediaType: 'photo',
    videoUrl: '',
    videoFile: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
    title: 'Milli Finaldan görüntü',
    text: 'Ölkə daxili Milli Final mərhələsindən canlı anlar.',
    tag: 'Foto',
    stage: 'national-final',
    mediaType: 'photo',
    videoUrl: '',
    videoFile: '',
  },
]

// Extract a YouTube video ID from common URL formats (watch / youtu.be / embed / shorts)
function getYouTubeId(url: string): string {
  if (!url) return ''
  const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[1] : ''
}

// Background image for a gallery card: own image/poster, else YouTube thumbnail, else none
function galleryBg(item: GalleryItem): string {
  if (item.image) return item.image
  if (item.mediaType === 'video') {
    const id = getYouTubeId(item.videoUrl)
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  return ''
}

function GalleryCard({ item, big }: { item: GalleryItem; big?: boolean }) {
  const bg = galleryBg(item)
  const isVideo = item.mediaType === 'video'
  const ytId = isVideo ? getYouTubeId(item.videoUrl) : ''
  // Uploaded video with no poster image: show the video itself as a live preview
  const showVideoBg = isVideo && !!item.videoFile && !bg
  return (
    <article
      className={`${big ? 'gallery-feature' : 'gallery-item'} reveal${showVideoBg ? ' has-bg-video' : ''}`}
      style={bg ? { ['--bg' as string]: `url('${bg}')` } : undefined}
      data-gallery="1"
      data-media-type={isVideo ? (item.videoFile ? 'video-file' : 'youtube') : 'photo'}
      data-video-src={item.videoFile}
      data-youtube-id={ytId}
      data-title={item.title}
    >
      {showVideoBg && (
        <video
          className="gallery-bg-video"
          src={item.videoFile}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      <span className="pill">{item.tag}</span>
      {isVideo && <span className="gallery-play" aria-hidden="true">▶</span>}
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  )
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Confirmed:     { bg: 'rgba(47,207,127,.15)',  color: 'var(--green)',  label: '✅ Confirmed' },
  TBC:           { bg: 'rgba(255,130,26,.12)',  color: 'var(--orange)', label: '📅 Upcoming' },
  'Grand Final': { bg: 'rgba(42,167,255,.14)',  color: 'var(--sky)',    label: '🏆 Grand Final' },
}

export default async function HomePage() {
  const [news, partners, hp, ss, galleryDocs, examTimes] = await Promise.all([
    getNewsItems(),
    getPartners(),
    getHomePage(),
    getSiteSettings(),
    getGallery(),
    getExamTimes(),
  ])

  // Hero background
  const heroBg = (hp.heroImage as any)?.url || FALLBACK_HERO_IMG
  const heroStyle = {
    background: `linear-gradient(135deg,rgba(10,16,52,.84) 0%,rgba(23,32,90,.72) 55%,rgba(255,130,26,.38) 100%), url('${heroBg}') center/cover no-repeat`,
  }

  // Gallery — feature the item matching the current contest stage,
  // plus up to two more as small side cards (padded with fallback items if needed)
  const currentStage = (ss as any).currentContestStage || 'preliminary'
  const galleryItems: GalleryItem[] = galleryDocs.length > 0
    ? galleryDocs.map((g: any) => ({
        image: (g.image as any)?.url || '',
        title: g.title || '',
        text:  g.subtitle || '',
        tag:   g.tag || 'Foto',
        stage: g.stage || '',
        mediaType: g.mediaType === 'video' ? 'video' : 'photo',
        videoUrl: g.videoUrl || '',
        videoFile: (g.videoFile as any)?.url || '',
      }))
    : FALLBACK_GALLERY

  const featuredItem = galleryItems.find((g) => g.stage === currentStage) ?? galleryItems[0]

  const sideItems = (() => {
    const rest = galleryItems.filter((g) => g !== featuredItem)
    const padded = rest.length >= 2 ? rest : [...rest, ...FALLBACK_GALLERY.filter((f) => f !== featuredItem)]
    return padded.slice(0, 2)
  })()

  // Exam calendar teaser — first 4 by order
  const examTeaser = examTimes.slice(0, 4)

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero" style={heroStyle}>
        <div className="container">
          <div className="hero-content">
            <div className="eyebrow"><span></span> {hp.heroEyebrow}</div>
            <h1>{hp.heroTitle}</h1>
            <p>{hp.heroSubtitle}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={hp.heroCta1Url || '/verbivore/about'}>{hp.heroCta1Label}</Link>
              <Link className="btn btn-blue"    href={hp.heroCta2Url || '/verbivore/exam-time'}>{hp.heroCta2Label}</Link>
            </div>
            <div className="hero-mini">
              <div className="mini-card"><b>{ss.statsCountries}</b><span>Target countries</span></div>
              <div className="mini-card"><b>{ss.statsSchools}</b><span>School network</span></div>
              <div className="mini-card"><b>{ss.statsStudents}</b><span>Expected students</span></div>
            </div>
            {/* Countdown — grandFinalISODate passed via data attribute → main.js reads it */}
            <div
              className="countdown-strip"
              id="countdownStrip"
              data-countdown-target={ss.grandFinalISODate}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.1em', width: '100%', marginBottom: 4 }}>
                {ss.grandFinalLabel}
              </div>
              <div className="countdown-unit"><span className="countdown-num" id="cdDays">--</span><span className="countdown-label">Days</span></div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit"><span className="countdown-num" id="cdHours">--</span><span className="countdown-label">Hours</span></div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit"><span className="countdown-num" id="cdMins">--</span><span className="countdown-label">Mins</span></div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit"><span className="countdown-num" id="cdSecs">--</span><span className="countdown-label">Secs</span></div>
            </div>
          </div>
        </div>

        {/* NEWS TICKER */}
        <div className="container">
          <div className="news">
            <Link href="/faq" className="news-label">News</Link>
            <div className="news-window">
              <div className="news-track">
                {news.filter((item: any) => item.published !== false).map((item: any) => (
                  <a key={item.id} href={`/news/${item.id}`}>{(item.ticker || item.text) as string}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">{hp.statsKicker}</div>
              <h2 className="section-title reveal">{hp.statsTitle}</h2>
            </div>
            <p className="section-text reveal reveal-delay-1">{hp.statsText}</p>
          </div>
          <div className="stats-grid desk-only">
            <div className="stat-card reveal reveal-delay-1"><div className="stat-icon">🌍</div><b>{ss.statsCountries}</b><span>Countries &amp; Territories</span></div>
            <div className="stat-card reveal reveal-delay-2"><div className="stat-icon">🏫</div><b>{ss.statsSchools}</b><span>Partner Schools</span></div>
            <div className="stat-card reveal reveal-delay-3"><div className="stat-icon">🎓</div><b>{ss.statsStudents}</b><span>Expected Students</span></div>
            <div className="stat-card reveal reveal-delay-4"><div className="stat-icon">🏆</div><b>{ss.statsRounds}</b><span>Main Rounds</span></div>
          </div>
          <div className="mob-only mob-stat-strip">
            <div className="mob-stat-pill"><div className="mob-stat-pill-icon">🌍</div><b>{ss.statsCountries}</b><span>Countries &amp; Territories</span></div>
            <div className="mob-stat-pill"><div className="mob-stat-pill-icon">🏫</div><b>{ss.statsSchools}</b><span>Partner Schools</span></div>
            <div className="mob-stat-pill"><div className="mob-stat-pill-icon">🎓</div><b>{ss.statsStudents}</b><span>Expected Students</span></div>
            <div className="mob-stat-pill"><div className="mob-stat-pill-icon">🏆</div><b>{ss.statsRounds}</b><span>Main Rounds</span></div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT BLOCKS ===== */}
      <section>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Quick access</div>
              <h2 className="section-title reveal">Everything important in one place.</h2>
            </div>
          </div>
          <div className="card-grid desk-only">
            {[
              { icon: '📢', title: 'Announcements',    text: 'Official updates, registration dates and public notices from the Verbivore coordination team.',       href: '/faq',                        label: 'Open updates →' },
              { icon: '📘', title: 'Guidelines',        text: 'Rules, instructions and preparation guidance for families and country representatives.',               href: '/verbivore/regulations',      label: 'Read guidelines →' },
              { icon: '🧩', title: 'Categories',        text: 'Age and grade-based contest categories — Junior A, Junior B, Intermediate and Senior.',               href: '/verbivore/categories',       label: 'Explore categories →' },
              { icon: '🧠', title: 'Topics',            text: 'Vocabulary, reading comprehension, grammar, logic and communication skills.',                         href: '/verbivore/sample-questions', label: 'See topics →' },
              { icon: '📝', title: 'Sample Questions',  text: 'Preview questions and exam-style examples for each category level.',                                  href: '/verbivore/sample-questions', label: 'Open samples →' },
              { icon: '🏅', title: 'Results',           text: 'Country and edition-based result pages with medal tables and student details.',                       href: '/results',                    label: 'Check results →' },
            ].map((card, i) => (
              <article key={card.title} className={`info-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div>
                  <div className="icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
                <Link className="card-link" href={card.href}>{card.label}</Link>
              </article>
            ))}
          </div>
          <div className="mob-only mob-quicklink-grid">
            {[
              { icon: '🏅', title: 'Results',          text: 'Medal tables & student results',      href: '/results',                    featured: true },
              { icon: '🧩', title: 'Categories',       text: 'Junior A, Junior B, Intermediate, Senior', href: '/verbivore/categories',  featured: true },
              { icon: '📢', title: 'Announcements',    href: '/faq' },
              { icon: '📘', title: 'Guidelines',       href: '/verbivore/regulations' },
              { icon: '🧠', title: 'Topics',           href: '/verbivore/sample-questions' },
              { icon: '📝', title: 'Sample Questions', href: '/verbivore/sample-questions' },
            ].map((card) => (
              <Link key={card.title} href={card.href} className={`mob-quicklink-tile${card.featured ? ' featured' : ''}`}>
                <div className="mob-quicklink-icon">{card.icon}</div>
                <div>
                  <div className="mob-quicklink-title">{card.title}</div>
                  {card.featured && card.text && <div className="mob-quicklink-desc">{card.text}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROUNDS ===== */}
      <section className="section-warm">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Contest journey</div>
              <h2 className="section-title reveal">Three rounds, one international champion.</h2>
            </div>
            <p className="section-text reveal reveal-delay-1">Each round builds on the previous one, gradually selecting the strongest English communicators from across the world.</p>
          </div>
          <div className="round-grid desk-only">
            {[
              { n: '01', title: 'Preliminary Round', text: 'Country-based first selection round with sample questions, rules and exam calendar.', href: '/verbivore/preliminary-round' },
              { n: '02', title: 'National Final',    text: 'Final selection in each country with video explanation, rules and national results.',   href: '/verbivore/national-final' },
              { n: '03', title: 'Grand Final',       text: 'International final — logistics, schedule and ceremony included.',                      href: '/verbivore/global-final' },
            ].map((round, i) => (
              <article key={round.n} className={`round-card reveal reveal-delay-${i + 1}`}>
                <div className="round-number">{round.n}</div>
                <h3>{round.title}</h3>
                <p>{round.text}</p>
                <Link className="card-link" href={round.href}>Open page →</Link>
              </article>
            ))}
          </div>
          <div className="mob-only mob-stepper">
            {[
              { n: '01', title: 'Preliminary Round', text: 'Country-based first selection round with sample questions, rules and exam calendar.', href: '/verbivore/preliminary-round' },
              { n: '02', title: 'National Final',    text: 'Final selection in each country with video explanation, rules and national results.',   href: '/verbivore/national-final' },
              { n: '03', title: 'Grand Final',       text: 'International final — logistics, schedule and ceremony included.',                      href: '/verbivore/global-final' },
            ].map((round) => (
              <div key={round.n} className="mob-stepper-item">
                <div className="mob-stepper-node">{round.n}</div>
                <div className="mob-stepper-body">
                  <strong>{round.title}</strong>
                  <p>{round.text}</p>
                  <Link className="card-link" href={round.href}>Open page →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Gallery</div>
              <h2 className="section-title reveal">Photo and video highlights.</h2>
            </div>
          </div>
          <div className="gallery-grid">
            {featuredItem && <GalleryCard item={featuredItem} big />}
            <div className="gallery-side">
              {sideItems.map((item, i) => (
                <GalleryCard key={i} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EXAM CALENDAR TEASER ===== */}
      <section className="exam-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Exam time</div>
              <h2 className="section-title reveal">Country-based exam calendar.</h2>
            </div>
            <p className="section-text reveal reveal-delay-1">Full Exam Time module with year, country and status filters.</p>
          </div>
          <div className="exam-layout desk-only">
            <article className="exam-card light reveal">
              <h3>Preliminary Round</h3>
              <p>Click a country to see planned date, city and status.</p>
              <div className="country-list">
                {examTeaser.map((et: any) => (
                  <div key={et.id}>
                    <button className="country-item" data-target={`et-${et.id}`}>
                      <span>{et.country?.flag} {et.country?.name}</span><small>View</small>
                    </button>
                    <div className="country-panel" id={`et-${et.id}`}>
                      {et.venue} — {et.date}{et.time && et.time !== 'TBA' ? ` · ${et.time}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="exam-card reveal reveal-delay-1">
              <h3>National &amp; Grand Final Calendar</h3>
              <div className="timeline" style={{ marginTop: 14 }}>
                {examTimes.slice(0, 3).map((et: any) => (
                  <div key={et.id} className="timeline-row">
                    <div className="date-badge">{et.date}</div>
                    <div>
                      <b style={{ color: '#fff', fontWeight: 900 }}>{et.round}</b>
                      <span>{et.country?.name}{et.venue ? ` — ${et.venue}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link className="btn btn-primary" href="/verbivore/exam-time" style={{ marginTop: 18 }}>View full schedule →</Link>
            </article>
          </div>

          <div className="mob-only">
            <div className="mob-section-label">Preliminary Round</div>
            <div className="mob-exam-cards">
              {examTeaser.map((et: any) => {
                const st = STATUS_STYLE[et.status] || STATUS_STYLE['TBC']
                return (
                  <div key={et.id} className="mob-exam-card">
                    <div className="mob-exam-card-head">
                      <span className="mob-exam-card-flag">{et.country?.flag}</span>
                      <div>
                        <strong>{et.country?.name}</strong>
                        <span>{et.round}</span>
                      </div>
                      <span className="mob-exam-card-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div className="mob-exam-card-body">
                      {et.date && <div><span>📅</span><span>{et.date}{et.time && et.time !== 'TBA' ? ` · ${et.time}` : ''}</span></div>}
                      {et.venue && <div><span>📍</span><span>{et.venue}</span></div>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mob-section-label" style={{ marginTop: 24 }}>National &amp; Grand Final Calendar</div>
            <div className="mob-cal-list">
              {examTimes.slice(0, 3).map((et: any) => (
                <div key={et.id} className="mob-cal-row">
                  <div className="mob-cal-date">{et.date}</div>
                  <div>
                    <strong>{et.round}</strong>
                    <span>{et.country?.flag} {et.country?.name}{et.venue ? ` — ${et.venue}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link className="btn btn-primary mob-exam-cta" href="/verbivore/exam-time">View full schedule →</Link>
          </div>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      {partners.length > 0 && (
        <section className="partner-section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">{hp.partnersKicker}</div>
                <h2 className="section-title reveal">{hp.partnersTitle}</h2>
              </div>
            </div>
            <div className="partner-row">
              {partners.map((p: any) => (
                <a key={p.id} className="partner-card" href={p.websiteUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <div className="partner-logo">
                    {p.logo && typeof p.logo === 'object' && (p.logo as any).url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(p.logo as any).url} alt={p.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }} />
                    ) : (
                      <span style={{ fontSize: 32 }}>{(p.name as string).charAt(0)}</span>
                    )}
                  </div>
                  <div className="partner-name">{p.name}</div>
                  <div className="partner-type">{p.tier}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      <div className="modal-overlay" id="resultModal">
        <div className="modal-box">
          <button className="modal-close" id="resultModalClose">✕</button>
          <div id="resultModalContent"></div>
        </div>
      </div>
    </>
  )
}
