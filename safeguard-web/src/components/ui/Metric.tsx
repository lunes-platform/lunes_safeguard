import React from 'react'
import { cn } from '../../utils/cn'
import { formatCompactNumber, formatPercentage } from '../../utils/formatters'

interface MetricProps {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage' | 'compact'
  className?: string
  icon?: React.ReactNode
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  change,
  trend: _trend, // Reserved for future use
  format = 'number',
  className,
  icon
}) => {
  let formattedValue = value.toString()

  if (typeof value === 'number') {
    switch (format) {
      case 'compact':
        formattedValue = formatCompactNumber(value)
        break
      case 'percentage':
        formattedValue = formatPercentage(value)
        break
      // Currency is usually handled outside or needs more props, keeping simple for now
      default:
        formattedValue = value.toLocaleString('pt-BR')
    }
  }

  return (
    <div className={cn("bg-white p-4 rounded-xl border border-neutral-200 shadow-sm", className)}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-neutral-500 font-medium">{label}</p>
        {icon && <div className="text-neutral-400">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-neutral-900">{formattedValue}</h3>
        
        {change !== undefined && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center",
            change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  )
}

export default Metric
