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
        change={5}
      />
    )

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display positive change correctly', () => {
    render(
      <MetricsCard
        title="Test"
        value="100"
        icon={Activity}
        change={10}
      />
    )

    expect(screen.getByText('+10% from last week')).toBeInTheDocument()
  })

  it('should display negative change correctly', () => {
    render(
      <MetricsCard
        title="Test"
        value="100"
        icon={Activity}
        change={-15}
      />
    )

    expect(screen.getByText('-15% from last week')).toBeInTheDocument()
  })

  it('should render without change', () => {
    render(<MetricsCard title="Test" value="50" icon={Activity} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})
