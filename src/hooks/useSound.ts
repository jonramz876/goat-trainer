import { useCallback, useRef, useState } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('goat-trainer-sound-enabled') === 'false'
  })

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (muted) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [muted, getCtx])

  const playCorrect = useCallback(() => {
    playTone(880, 0.1)
    setTimeout(() => playTone(1000, 0.1), 100)
  }, [playTone])

  const playWrong = useCallback(() => {
    playTone(220, 0.2)
  }, [playTone])

  const playBringDown = useCallback(() => {
    if (muted) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(1000, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  }, [muted, getCtx])

  const playTierAdvance = useCallback(() => {
    [880, 988, 1047, 1175].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15), i * 200)
    })
  }, [playTone])

  const playComplete = useCallback(() => {
    playTone(1000, 0.15)
    setTimeout(() => playTone(1200, 0.2), 200)
  }, [playTone])

  const playCookieLand = useCallback(() => {
    playTone(500, 0.1)
  }, [playTone])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m
      localStorage.setItem('goat-trainer-sound-enabled', String(!next))
      return next
    })
  }, [])

  return { playCorrect, playWrong, playBringDown, playTierAdvance, playComplete, playCookieLand, muted, toggleMute }
}
