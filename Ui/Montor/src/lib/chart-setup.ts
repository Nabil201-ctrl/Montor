import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
)

// Global defaults for dark theme
ChartJS.defaults.color = '#a1a1aa'
ChartJS.defaults.borderColor = '#27272a'
ChartJS.defaults.font.family = "'Inter', sans-serif"

export const CHART_COLORS = {
  accent: '#6366f1',
  accentLight: '#818cf8',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  muted: '#71717a',
  surface: '#1c1c21',
  border: '#27272a',
  bg: '#0a0a0b',
  bgCard: '#16161a',
}

export function accentGradient(ctx: CanvasRenderingContext2D, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)')
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)')
  return gradient
}

export function greenGradient(ctx: CanvasRenderingContext2D, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)')
  gradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)')
  return gradient
}
