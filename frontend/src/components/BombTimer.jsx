import { motion, AnimatePresence } from 'framer-motion'

const colorMap = {
  ticking: '#ef4444',
  success: '#22c55e',
  fail: '#6b7280',
  explosion: '#ef4444',
}

function Particulas({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i
        const rad = (angle * Math.PI) / 180
        const distancia = 40 + Math.random() * 30
        return (
          <motion.circle
            key={i}
            r="3"
            fill={['#ef4444', '#f97316', '#eab308', '#dc2626'][i % 4]}
            cx="40"
            cy="44"
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              x: Math.cos(rad) * distancia,
              y: Math.sin(rad) * distancia,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}
    </>
  )
}

export default function BombTimer({ estado, tiempoRestante }) {
  const color = colorMap[estado] || '#ef4444'
  const mostrandoExplosion = estado === 'explosion'

  const pulseAnim = estado === 'ticking'
    ? { scale: [1, 1.06, 1] }
    : estado === 'success'
      ? { scale: [1, 1.15, 1] }
      : estado === 'fail'
        ? { x: [0, -4, 4, -4, 4, 0] }
        : {}

  const transition = estado === 'ticking'
    ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
    : estado === 'success'
      ? { duration: 0.4, ease: 'easeOut' }
      : estado === 'fail'
        ? { duration: 0.35 }
        : {}

  return (
    <div className="relative flex items-center gap-2 select-none">
      <motion.div
        className="relative"
        animate={pulseAnim}
        transition={transition}
      >
        <svg width="44" height="50" viewBox="0 0 80 90" className="block">
          <AnimatePresence mode="wait">
            {mostrandoExplosion ? (
              <g key="explosion">
                <motion.circle
                  cx="40" cy="44" r="26"
                  fill={color}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <Particulas />
                <g>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const offsetX = [8, -8, 6, -6][i]
                    const offsetY = [-10, -8, 6, 8][i]
                    return (
                      <motion.rect
                        key={`debris-${i}`}
                        x="36" y="40"
                        width="8" height="6"
                        rx="2"
                        fill="#475569"
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                        animate={{ x: offsetX * 3, y: offsetY * 3, rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    )
                  })}
                </g>
              </g>
            ) : (
              <g key="bomb">
                <path
                  d="M40 14 Q40 4 46 8"
                  stroke={color}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <motion.circle
                  cx="47" cy="7" r="4.5"
                  fill={estado === 'ticking' ? '#f97316' : color}
                  animate={estado === 'ticking' ? { opacity: [1, 0.4, 1] } : {}}
                  transition={estado === 'ticking' ? { duration: 0.6, repeat: Infinity } : {}}
                />
                <ellipse cx="40" cy="50" rx="24" ry="27" fill={color} />
                <ellipse cx="40" cy="25" rx="10" ry="5" fill={color} />
                <ellipse cx="30" cy="40" rx="7" ry="5" fill="rgba(255,255,255,0.15)" />

                {estado === 'success' && (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <circle cx="40" cy="48" r="14" fill="rgba(34,197,94,0.3)" />
                    <path
                      d="M30 48 l5 6 l13-14"
                      stroke="white"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.g>
                )}

                {estado === 'fail' && (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <path
                      d="M32 42 l16 14 M48 42 l-16 14"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.g>
                )}
              </g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      <AnimatePresence mode="wait">
        {!mostrandoExplosion && (
          <motion.span
            key={tiempoRestante}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={`font-mono text-lg font-bold min-w-[2ch] text-center ${
              tiempoRestante <= 5 ? 'text-error' : 'text-base-content'
            }`}
          >
            {tiempoRestante}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
