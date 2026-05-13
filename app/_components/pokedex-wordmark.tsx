export function PokedexWordmark() {
  return (
    <span className="poke-wordmark">
      P
      <span className="poke-ball-wrap" aria-hidden="true">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="poke-ball-clip">
              <circle cx="50" cy="50" r="46" />
            </clipPath>
            <radialGradient id="poke-ball-red" cx="35%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#FF7A7A" />
              <stop offset="55%" stopColor="#EF3A3A" />
              <stop offset="100%" stopColor="#B81E1E" />
            </radialGradient>
            <radialGradient id="poke-ball-white" cx="35%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
          </defs>
          <g clipPath="url(#poke-ball-clip)">
            <rect x="0" y="0" width="100" height="50" fill="url(#poke-ball-red)" />
            <rect x="0" y="50" width="100" height="50" fill="url(#poke-ball-white)" />
            <rect x="0" y="45" width="100" height="10" fill="#0F172A" />
          </g>
          <circle cx="50" cy="50" r="46" fill="none" stroke="#0F172A" strokeWidth="6" />
          <circle cx="50" cy="50" r="15" fill="#0F172A" />
          <circle cx="50" cy="50" r="10" fill="#F8FAFC" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="#0F172A" strokeWidth="2" />
          <circle cx="46" cy="46" r="3" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </span>
      kédex
    </span>
  );
}
