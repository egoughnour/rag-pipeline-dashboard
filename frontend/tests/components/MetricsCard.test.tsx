import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricsCard from '../../src/components/Dashboard/MetricsCard'
import { Activity } from 'lucide-react'

describe('MetricsCard', () => {
  it('should render title and value', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value="42"
        icon={Activity}
        trend={{ value: 5, isPositive: true }}
      />
    )

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display positive trend correctly', () => {
    render(
      <MetricsCard
        title="Test"
        value="100"
        icon={Activity}
        trend={{ value: 10, isPositive: true }}
      />
    )

    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('should display negative trend correctly', () => {
    render(
      <MetricsCard
        title="Test"
        value="100"
        icon={Activity}
        trend={{ value: 15, isPositive: false }}
      />
    )

    expect(screen.getByText('-15%')).toBeInTheDocument()
  })

  it('should render without trend', () => {
    render(<MetricsCard title="Test" value="50" icon={Activity} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})
