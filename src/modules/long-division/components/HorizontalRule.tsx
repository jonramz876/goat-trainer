import type { RuleData } from '../engine/types'

interface HorizontalRuleProps {
  rule: RuleData
  visible: boolean
}

export default function HorizontalRule({ rule, visible }: HorizontalRuleProps) {
  if (!visible) return null

  const style: React.CSSProperties = {
    gridRow: rule.row + 1,
    gridColumn: `${rule.fromCol + 1} / span ${rule.toCol - rule.fromCol + 1}`,
    borderBottom: '2px solid #2D2A26',
    height: '100%',
    alignSelf: 'end',
  }

  return <div style={style} />
}
