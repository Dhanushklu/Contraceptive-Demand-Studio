import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Member = {
  initials: string;
  name: string;
  reg: string;
  specialization?: string; // optional per-member override
};

const PROJECT = "Contraceptive Demand Forecasting for Health Supply Chains";
const SPECIALIZATION = "Data Science & Big Data Analytics"; // edit per member if different

const MEMBERS: Member[] = [
  { initials: "MD", name: "Maradapu Dhanush", reg: "2300090187" },
  {  initials: "KV", name: "Karthik Vasamsetty", reg: "2300090265" },
  { initials: "SA", name: "Shoaib Ali Khan Pattan", reg: "2300090241" },
  { initials: "SS", name: "Locharla Shreya Sree", reg: "2300090253" },
];

/* light colour of each scene (r, g, b): ice blue, violet, teal, amber */
const TINTS = ["255, 35, 55", "220, 230, 240", "255, 190, 35", "255, 92, 35"];

/* how long each scene stays on screen (ms) and the wait before the timer starts */
const SCENE_MS = 3400;
const SCENE_WAIT_MS = 1400;

const INFO = [
  {
    badge: "YT",
    label: "Under the supervision of",
    title: "Dr. Y. Tayar",
    sub: "Associate Professor",
  },
  {
    badge: "70",
    label: "Team",
    title: "Batch 70",
    sub: "Academic Year 2026–27",
  },
  {
    badge: "CSIT",
    label: "Department",
    title: "Computer Science & Information Technology",
    sub: "Contraceptive Demand Forecasting For Health Supply Chains",
  },
  {
    badge: "KL",
    label: "University",
    title: "K L Deemed to be University",
    sub: "Green Fields, Vaddeswaram – 522502, Guntur District, Andhra Pradesh, India",
  },
];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/* Fires once when the element scrolls into view */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

/* Tells you if the element is on screen right now, and if it has ever been */
function useVisibility<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible, seen] as const;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const delay = (ms: number) => ({ "--d": `${ms}ms` } as CSSProperties);
const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* background: points of light drifting through space                  */
/* ------------------------------------------------------------------ */

function LightField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.95 + 0.05,
    }));

    let w = 1;
    let h = 1;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const render = () => {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const f = Math.min(w, h) * 0.2;

      stars.forEach((s, i) => {
        if (!reduced) s.z -= 0.0012;
        if (s.z <= 0.04) {
          s.z = 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
        }
        const depth = 1 - s.z;
        const px = cx + (s.x / s.z) * f * 1.6 + mx * 50 * depth;
        const py = cy + (s.y / s.z) * f + my * 30 * depth;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) return;

        const pz = s.z + 0.01;
        const ox = cx + (s.x / pz) * f * 1.6 + mx * 50 * (1 - pz);
        const oy = cy + (s.y / pz) * f + my * 30 * (1 - pz);

        const alpha = Math.min(1, depth * 1.1 + 0.1);
        const tint = i % 6 === 0 ? "125, 211, 252" : "255, 255, 255";

        ctx.strokeStyle = `rgba(${tint}, ${alpha * 0.4})`;
        ctx.lineWidth = depth * 1.3 + 0.3;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = `rgba(${tint}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, depth * 1.6 + 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) render();
    };

    if (reduced) {
      render();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}

/* ------------------------------------------------------------------ */
/* one scene = one title card                                          */
/* ------------------------------------------------------------------ */

function Credit({
  label,
  value,
  r,
  tint,
}: {
  label: string;
  value: string;
  r: number;
  tint: string;
}) {
  return (
    <div className="tm-credit" style={{ "--r": r } as CSSProperties}>
      <dt
        className="text-[10px] font-medium uppercase tracking-[0.35em]"
        style={{ color: `rgba(${tint}, 0.85)` }}
      >
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-light leading-snug text-white/85 md:text-[15px]">
        {value}
      </dd>
    </div>
  );
}

function Scene({
  member,
  index,
  total,
  on,
}: {
  member: Member;
  index: number;
  total: number;
  on: boolean;
}) {
  const tint = TINTS[index % TINTS.length];

  return (
    <div
      className={`tm-scene ${on ? "tm-scene-on" : ""}`}
      style={{ "--rgb": tint } as CSSProperties}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${member.name}`}
      aria-hidden={!on}
    >
      {/* light and atmosphere */}
      <div className="tm-wash pointer-events-none absolute" />
      <div className="tm-ghost pointer-events-none select-none" aria-hidden="true">
        {member.initials}
      </div>
      <div className="tm-flare pointer-events-none absolute inset-x-0">
        <span className="tm-flare-glow" />
        <span className="tm-flare-core" />
      </div>

      {/* title card */}
      <div className="relative z-10 grid h-full items-center gap-8 px-6 py-[68px] sm:px-12 md:grid-cols-[1.2fr_1fr] md:gap-14 lg:px-16">
        <div className="min-w-0">
          <div
            className="tm-rise flex items-center gap-4"
            style={{ "--r": 250 } as CSSProperties}
          >
            <span
              className="tm-line h-px w-14"
              style={{ background: `rgba(${tint}, 0.9)` }}
            />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.45em]"
              style={{ color: `rgba(${tint}, 0.95)` }}
            >
              Team Member {pad(index + 1)}
            </span>
          </div>

          <h3 className="mt-6 flex flex-wrap text-[2.6rem] font-light leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {member.name.split(" ").map((word, wi) => (
              <span
                key={wi}
                className="tm-word mr-[0.28em] inline-block"
                style={{ "--w": wi } as CSSProperties}
              >
                {word}
              </span>
            ))}
          </h3>

          <p
            className="tm-rise mt-6 font-mono text-xs tracking-[0.4em] text-white/50"
            style={{ "--r": 1100 } as CSSProperties}
          >
            REG · {member.reg}
          </p>
          <p
            className="tm-rise mt-2 text-sm font-light uppercase tracking-[0.3em] text-white/75"
            style={{ "--r": 1250 } as CSSProperties}
          >
            Project Team Member
          </p>
        </div>

        {/* credits */}
        <dl className="min-w-0 space-y-5 border-white/15 md:border-l md:pl-10">
          <Credit label="Project" value={PROJECT} r={1000} tint={tint} />
          <Credit
            label="Specialization"
            value={member.specialization ?? SPECIALIZATION}
            r={1150}
            tint={tint}
          />
          <Credit
            label="Batch · Academic Year"
            value="Batch 70  ·  2026–27"
            r={1300}
            tint={tint}
          />
          <Credit
            label="Under the supervision of"
            value="Dr. Y. Tayar, Associate Professor"
            r={1450}
            tint={tint}
          />
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* section                                                             */
/* ------------------------------------------------------------------ */

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function TeamSection() {
  const total = MEMBERS.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const [headRef, headIn] = useInView<HTMLDivElement>();
  const [infoRef, infoIn] = useInView<HTMLDivElement>();
  const [stageRef, stageVisible, stageSeen] = useVisibility<HTMLDivElement>(0.3);

  const swipeStart = useRef<number | null>(null);

  const go = useCallback(
    (i: number) => setActive((((i % total) + total) % total)),
    [total]
  );

  // The timer pauses while you hover, focus, or scroll away
  const paused = hovered || focused || !stageVisible;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <>
      {/* All styles and animations for the team section */}
      <style>{`
        /* ---------- unfold on scroll (heading and info cards) ---------- */
        .tm-fold { opacity: 0; }
        .tm-fold-in {
          animation: tm-unfold 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: var(--d, 0ms);
          transform-origin: 50% 0%;
        }
        @keyframes tm-unfold {
          from { opacity: 0; transform: perspective(900px) rotateX(-62deg) translateY(36px); }
          to   { opacity: 1; transform: perspective(900px) rotateX(0deg)   translateY(0); }
        }

        .tm-heading-in { animation: tm-heading 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        @keyframes tm-heading {
          from { opacity: 0; letter-spacing: -0.06em; filter: blur(14px); transform: scale(1.08); }
          to   { opacity: 1; letter-spacing: -0.01em; filter: blur(0);    transform: scale(1); }
        }
        .tm-sweep { animation: tm-sweep 4.5s ease-in-out infinite; }
        @keyframes tm-sweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        /* ---------- stage: the widescreen frame ---------- */
        .tm-stage { --bar: 48px; }
        .tm-bar {
          position: absolute; left: 0; right: 0; z-index: 10;
          height: 52%; background: #000; pointer-events: none;
        }
        .tm-bar-top    { top: 0; }
        .tm-bar-bottom { bottom: 0; }
        .tm-stage-on .tm-bar {
          height: var(--bar);
          transition: height 1.6s cubic-bezier(0.7, 0, 0.2, 1);
        }
        .tm-chrome { opacity: 0; transition: opacity 0.9s ease 1.1s; }
        .tm-stage-on .tm-chrome { opacity: 1; }

        .tm-vignette {
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.75) 100%);
        }
        .tm-grain {
          position: absolute; inset: -120px; opacity: 0.07; mix-blend-mode: screen;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.6'/></svg>");
          animation: tm-grain 0.9s steps(6) infinite;
        }
        @keyframes tm-grain {
          0%   { transform: translate(0, 0); }
          20%  { transform: translate(-40px, 25px); }
          40%  { transform: translate(30px, -45px); }
          60%  { transform: translate(-25px, -20px); }
          80%  { transform: translate(45px, 35px); }
          100% { transform: translate(0, 0); }
        }

        /* ---------- scenes ---------- */
        .tm-scene {
          position: absolute; inset: 0;
          opacity: 0; visibility: hidden;
          transform: scale(1.04); filter: blur(8px);
          transition: opacity 1s ease, transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1),
                      filter 1s ease, visibility 0s linear 1s;
        }
        .tm-scene-on {
          opacity: 1; visibility: visible; transform: none; filter: none;
          transition-delay: 0s;
        }

        /* soft coloured light behind the title */
        .tm-wash {
          inset: -20%;
          background:
            radial-gradient(45% 55% at 74% 38%, rgba(var(--rgb), 0.36), transparent 70%),
            radial-gradient(40% 50% at 14% 82%, rgba(var(--rgb), 0.15), transparent 70%);
        }
        .tm-scene-on .tm-wash { animation: tm-drift 14s ease-in-out infinite alternate; }
        @keyframes tm-drift {
          from { transform: translate(-2%, -1%) scale(1); }
          to   { transform: translate(3%, 2%) scale(1.1); }
        }

        /* oversized outlined initials */
        .tm-ghost {
          position: absolute; right: -2%; top: 50%;
          font-size: clamp(11rem, 28vw, 24rem);
          font-weight: 700; line-height: 1; letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(var(--rgb), 0.28);
          opacity: 0.8;
          transform: translateY(-50%);
        }
        .tm-scene-on .tm-ghost { animation: tm-ghost 16s ease-in-out infinite alternate; }
        @keyframes tm-ghost {
          from { transform: translate(0, -50%) scale(1); }
          to   { transform: translate(-3%, -52%) scale(1.07); }
        }

        /* anamorphic light streak */
        .tm-flare { top: 44%; height: 2px; }
        .tm-flare-core, .tm-flare-glow {
          position: absolute; left: 0; transform: translateX(-130%);
        }
        .tm-flare-core {
          top: 0; width: 55%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(var(--rgb), 0.95), #fff, rgba(var(--rgb), 0.95), transparent);
          box-shadow: 0 0 24px 6px rgba(var(--rgb), 0.45);
        }
        .tm-flare-glow {
          top: -40px; width: 70%; height: 80px; filter: blur(34px);
          background: linear-gradient(90deg, transparent, rgba(var(--rgb), 0.35), transparent);
        }
        .tm-scene-on .tm-flare-core,
        .tm-scene-on .tm-flare-glow { animation: tm-flare 9s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .tm-scene-on .tm-flare-glow { animation-delay: 0.1s; }
        @keyframes tm-flare {
          0%   { transform: translateX(-130%); opacity: 0; }
          15%  { opacity: 1; }
          55%  { opacity: 1; }
          100% { transform: translateX(210%); opacity: 0; }
        }

        /* title reveal: words come out of a blur */
        .tm-scene-on .tm-word {
          animation: tm-word 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: calc(0.45s + var(--w, 0) * 0.16s);
        }
        @keyframes tm-word {
          from { opacity: 0; filter: blur(18px); transform: translateY(26px) scale(1.06); letter-spacing: 0.12em; }
          to   { opacity: 1; filter: blur(0);    transform: none;                         letter-spacing: -0.01em; }
        }

        .tm-scene-on .tm-rise {
          animation: tm-rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: calc(var(--r, 0) * 1ms);
        }
        @keyframes tm-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }
        .tm-scene-on .tm-credit {
          animation: tm-credit 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: calc(var(--r, 0) * 1ms);
        }
        @keyframes tm-credit {
          from { opacity: 0; transform: translateX(26px); }
          to   { opacity: 1; transform: none; }
        }
        .tm-line { transform-origin: left; }
        .tm-scene-on .tm-line { animation: tm-line 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both; }
        @keyframes tm-line {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* ---------- controls ---------- */
        .tm-arrow {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease,
                      scale 0.3s ease, opacity 0.9s ease 1.1s;
        }
        .tm-arrow:hover {
          background-color: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.5);
          color: #fff;
          scale: 1.08;
        }

        .tm-seg-fill {
          position: absolute; inset: 0; background: #fff;
          transform-origin: left; transform: scaleX(0);
        }
        .tm-seg-done .tm-seg-fill { transform: scaleX(1); }
        .tm-seg-live .tm-seg-fill {
          animation: tm-fill ${SCENE_MS}ms linear ${SCENE_WAIT_MS}ms both;
        }
        @keyframes tm-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* ---------- info cards ---------- */
        .tm-info {
          transition: translate 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .tm-info:hover {
          translate: 0 -4px;
          border-color: rgba(125, 211, 252, 0.4);
          box-shadow: 0 24px 60px -30px rgba(56, 189, 248, 0.45);
        }

        /* ---------- respect reduced-motion setting ---------- */
        @media (prefers-reduced-motion: reduce) {
          .tm-fold { opacity: 1; }
          .tm-fold-in, .tm-heading-in, .tm-sweep, .tm-grain,
          .tm-seg-live .tm-seg-fill,
          .tm-scene-on .tm-wash, .tm-scene-on .tm-ghost,
          .tm-scene-on .tm-flare-core, .tm-scene-on .tm-flare-glow,
          .tm-scene-on .tm-word, .tm-scene-on .tm-rise,
          .tm-scene-on .tm-credit, .tm-scene-on .tm-line { animation: none !important; }
          .tm-scene { transition: opacity 0.3s ease; transform: none; filter: none; }
          .tm-chrome { opacity: 1; transition: none; }
          .tm-seg-live .tm-seg-fill { transform: scaleX(1); }
          .tm-info, .tm-arrow, .tm-stage-on .tm-bar { transition: none; }
        }


        /* ==============================================================
           MOTOGP RACE-PAD STYLE — carbon fibre, pit-lane lights, speed
           lines, race-number graphics and red/titanium/electric-yellow.
           This is a visual skin; carousel logic and accessibility remain.
           ============================================================== */
        #team {
          --moto-red: #ff2337;
          --moto-yellow: #ffc928;
          --moto-steel: #dbe3ec;
          background:
            radial-gradient(ellipse at 12% 16%, rgba(255,35,55,.16), transparent 34%),
            radial-gradient(ellipse at 88% 78%, rgba(255,201,40,.08), transparent 32%),
            linear-gradient(145deg,#08090c 0%,#11141a 48%,#030405 100%) !important;
        }
        #team:before {
          content:""; position:absolute; inset:0; pointer-events:none; opacity:.28;
          background-image: repeating-linear-gradient(135deg,transparent 0 17px,rgba(255,255,255,.035) 18px 19px,transparent 20px 36px);
          mask-image:linear-gradient(to bottom,black,transparent 82%);
        }
        #team:after {
          content:""; position:absolute; top:0; right:0; width:36%; height:100%; pointer-events:none; opacity:.3;
          background:repeating-linear-gradient(135deg,transparent 0 18px,rgba(255,35,55,.13) 19px 22px,transparent 23px 42px);
          clip-path:polygon(45% 0,100% 0,100% 100%,0 100%);
        }
        #team .tm-stage {
          border:1px solid rgba(255,55,70,.45);
          border-radius:1rem;
          background:linear-gradient(125deg,#08090b 0%,#171a20 46%,#090a0d 100%);
          box-shadow:0 35px 100px -38px rgba(255,35,55,.35),0 0 0 1px rgba(255,255,255,.04),inset 0 0 70px rgba(255,35,55,.045);
          clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,26px 100%,0 calc(100% - 26px));
        }
        #team .tm-stage:before {
          content:""; position:absolute; z-index:4; top:48px; left:0; width:100%; height:2px; pointer-events:none;
          background:linear-gradient(90deg,transparent,var(--moto-red),var(--moto-yellow),transparent);
          box-shadow:0 0 20px rgba(255,35,55,.6);
        }
        #team .tm-scene { transition:opacity .55s ease,transform .8s cubic-bezier(.2,.8,.2,1),filter .55s ease,visibility 0s linear .55s; }
        #team .tm-scene-on { transition-delay:0s; }
        #team .tm-wash {
          background:radial-gradient(48% 70% at 78% 45%,rgba(var(--rgb),.22),transparent 72%),linear-gradient(115deg,rgba(255,255,255,.025),transparent 45%);
        }
        #team .tm-ghost {
          right:3%; top:48%; font-style:italic; font-weight:900; letter-spacing:-.09em;
          -webkit-text-stroke:2px rgba(var(--rgb),.24); opacity:.95;
          transform:translateY(-50%) skewX(-9deg);
          text-shadow:10px 0 0 rgba(255,255,255,.012);
        }
        #team .tm-scene-on .tm-ghost { animation: moto-number-drift 7s ease-in-out infinite alternate; }
        @keyframes moto-number-drift { from{transform:translate(0,-50%) skewX(-9deg) scale(1)} to{transform:translate(-2%,-51%) skewX(-9deg) scale(1.035)} }
        #team .tm-flare { top:39%; height:3px; transform:skewY(-2deg); }
        #team .tm-flare-core {
          height:3px; width:68%;
          background:linear-gradient(90deg,transparent,var(--moto-red),#fff,var(--moto-yellow),transparent);
          box-shadow:0 0 20px 5px rgba(255,35,55,.4);
        }
        #team .tm-flare-glow { background:linear-gradient(90deg,transparent,rgba(255,35,55,.34),rgba(255,201,40,.18),transparent); }
        #team .tm-scene-on .tm-word { font-weight:800; font-style:italic; text-transform:uppercase; letter-spacing:-.045em; text-shadow:0 5px 28px rgba(0,0,0,.65); }
        #team .tm-scene-on .tm-word:first-child { text-decoration-color:var(--moto-red); }
        #team .tm-line { height:3px; box-shadow:0 0 14px rgba(255,35,55,.65); }
        #team .tm-credit dt { font-weight:800; letter-spacing:.28em; }
        #team .tm-credit dd { color:rgba(239,243,248,.82); }
        #team .tm-chrome { color:rgba(224,231,239,.58); letter-spacing:.28em; }
        #team .tm-arrow { border-color:rgba(255,255,255,.2); background:rgba(5,6,8,.72); }
        #team .tm-arrow:hover { background:var(--moto-red); border-color:var(--moto-red); color:white; }
        #team .tm-seg-fill { background:linear-gradient(90deg,var(--moto-red),var(--moto-yellow)); box-shadow:0 0 12px rgba(255,35,55,.6); }
        #team .tm-info {
          position:relative; overflow:hidden; border-color:rgba(255,255,255,.11);
          border-radius:1rem; background:linear-gradient(135deg,rgba(28,30,36,.92),rgba(8,9,12,.96));
          box-shadow:inset 4px 0 0 rgba(255,35,55,.82),0 18px 45px rgba(0,0,0,.25);
        }
        #team .tm-info:after {
          content:""; position:absolute; right:-18px; top:-25px; width:95px; height:145px; opacity:.16; pointer-events:none;
          background:repeating-linear-gradient(135deg,transparent 0 8px,var(--moto-red) 9px 12px,transparent 13px 21px);
          transform:skewX(-18deg);
        }
        #team .tm-info:hover { border-color:rgba(255,55,70,.45); box-shadow:inset 4px 0 0 var(--moto-red),0 24px 60px -30px rgba(255,35,55,.45); }
        #team .tm-info > div:first-child { border-color:rgba(255,55,70,.45); background:rgba(255,35,55,.1); color:#ffdfe3; font-weight:800; }
        #team .tm-info p:first-child { color:rgba(255,201,40,.8); font-weight:800; }
        #team footer { border-color:rgba(255,255,255,.1); background:linear-gradient(90deg,#07080a,#15171c,#07080a); }
        #team + footer { border-top-color:rgba(255,35,55,.35); background:#07080a; }
        @media(max-width:640px) {
          #team .tm-ghost { right:-8%; opacity:.45; }
          #team .tm-scene-on .tm-word { font-size:clamp(2rem,10vw,3.5rem); }
          #team .tm-stage { clip-path:none; }
        }
        @media(prefers-reduced-motion:reduce) {
          #team .tm-scene-on .tm-ghost { animation:none; }
        }

      `}</style>

      <section
        id="team"
        className="relative overflow-hidden px-6 py-24 text-white"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(56,189,248,0.14), transparent 70%)," +
            "radial-gradient(50% 40% at 50% 100%, rgba(139,92,246,0.12), transparent 70%)," +
            "#000",
        }}
      >
        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Heading */}
          <div ref={headRef} className="mx-auto mb-14 max-w-3xl text-center">
            <p
              className={`mb-5 text-[11px] font-medium uppercase tracking-[0.5em] text-red-300/80 ${
                headIn ? "tm-fold-in tm-fold" : "tm-fold"
              }`}
            >
              TEAM GRID
            </p>
            <h2
              className={`bg-gradient-to-b from-white via-white to-red-300/70 bg-clip-text text-4xl font-light leading-[1.1] text-transparent sm:text-6xl ${
                headIn ? "tm-heading-in" : "opacity-0"
              }`}
            >
              Meet the Team. Feel the Speed.
            </h2>
            <div className="relative mx-auto mt-8 h-px w-48 overflow-hidden bg-white/10">
              <span className="tm-sweep absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
            </div>
            <p
              className={`mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed text-white/60 ${
                headIn ? "tm-fold-in tm-fold" : "tm-fold"
              }`}
              style={delay(300)}
            >
              Meet the crew behind Contraceptive Demand Studio. Navigate the grid,
              swipe through the lineup, or let the race-inspired presentation run.
            </p>
          </div>

          {/* ---------------- Cinematic stage ---------------- */}
          <div
            ref={stageRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Team members"
            aria-live={playing ? "off" : "polite"}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
            className={`tm-stage relative h-[760px] touch-pan-y select-none overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_40px_120px_-40px_rgba(56,189,248,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 md:h-[580px] lg:h-[540px] ${
              stageSeen ? "tm-stage-on" : ""
            }`}
          >
            <LightField />

            {MEMBERS.map((m, i) => (
              <Scene
                key={m.reg}
                member={m}
                index={i}
                total={total}
                on={stageSeen && i === active}
              />
            ))}

            {/* film look */}
            <div className="tm-vignette pointer-events-none absolute inset-0 z-[5]" />
            <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
              <div className="tm-grain" />
            </div>

            {/* letterbox bars */}
            <div className="tm-bar tm-bar-top" />
            <div className="tm-bar tm-bar-bottom" />

            {/* top credits line */}
            <div className="tm-chrome pointer-events-none absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between px-6 text-[10px] uppercase tracking-[0.4em] text-white/45 sm:px-10">
              <span>CONTRACEPTIVE DEMAND STUDIO</span>
              <span className="hidden sm:inline">Batch 70 · 2026–27</span>
            </div>

            {/* arrows */}
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous member"
              className="tm-arrow tm-chrome absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-red-500/70 sm:left-5"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next member"
              className="tm-arrow tm-chrome absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-red-500/70 sm:right-5"
            >
              <Chevron dir="right" />
            </button>

            {/* bottom bar: play / progress / counter */}
            <div className="tm-chrome absolute inset-x-0 bottom-0 z-20 flex h-12 items-center gap-4 px-6 sm:px-10">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause scenes" : "Play scenes"}
                aria-pressed={playing}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="mx-auto flex flex-1 items-center justify-center gap-2 sm:gap-3">
                {MEMBERS.map((m, i) => {
                  const done = i < active || (i === active && !playing);
                  const live = i === active && playing && stageSeen;
                  return (
                    <button
                      key={m.reg}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Go to ${m.name}`}
                      aria-current={i === active}
                      className="group flex h-8 w-full max-w-[90px] items-center outline-none"
                    >
                      <span
                        className={`relative block h-[2px] w-full overflow-hidden rounded-full bg-white/20 transition group-hover:bg-white/35 group-focus-visible:ring-2 group-focus-visible:ring-red-500/70 ${
                          done ? "tm-seg-done" : ""
                        } ${live ? "tm-seg-live" : ""}`}
                      >
                        <span
                          key={live ? `live-${active}` : `idle-${i}`}
                          className="tm-seg-fill"
                          style={{ animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={live ? () => go(active + 1) : undefined}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="shrink-0 font-mono text-[11px] tracking-[0.3em] text-white/50">
                {pad(active + 1)} / {pad(total)}
              </span>
            </div>
          </div>

          {/* Supervisor / team / department / university cards */}
          <div ref={infoRef} className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2">
            {INFO.map((c, i) => (
              <div
                key={c.label}
                style={delay(i * 130)}
                className={`tm-info tm-fold ${
                  infoIn ? "tm-fold-in" : ""
                } flex items-center gap-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-6 backdrop-blur-sm`}
              >
                <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-full border border-red-400/35 bg-red-500/10 px-3 text-xs font-medium tracking-wider text-red-100">
                  {c.badge}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-red-300/70">
                    {c.label}
                  </p>
                  <p className="mt-1 text-lg font-light tracking-tight">{c.title}</p>
                  <p className="mt-1 text-xs font-light text-white/50">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black px-6 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-light tracking-wide">
              Contraceptive Demand Studio
            </p>
            <p className="mt-1 text-xs font-light text-white/45">{PROJECT}</p>
          </div>
          <p className="text-xs font-light text-white/40">
            K L Deemed to be University • Batch 70 • 2026–27
          </p>
        </div>
      </footer>
    </>
  );
}