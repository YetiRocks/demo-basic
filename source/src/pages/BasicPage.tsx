import { useState, useCallback, useEffect } from 'react'
import CodeBlock from '../components/CodeBlock'
import { getCellConfig } from '../cellConfig'

// Per-cell config: API base + the SDK source/schema shown in the panels.
// Defaults to the canonical demo-basic (Rust, same-origin /demo-basic/api).
const cell = getCellConfig()

const COUNTER_ID = 'main-counter'

// File extensions per CodeMirror grammar — drives the greeting source-pane
// label (e.g. `greeting.rs` for rust, `greeting.py` for python).
const SOURCE_EXTENSIONS: Record<string, string> = {
  rust: 'rs',
  rs: 'rs',
  python: 'py',
  py: 'py',
  typescript: 'ts',
  ts: 'ts',
  javascript: 'js',
  js: 'js',
  go: 'go',
}

function sourceFilename(stem: string, language: string): string {
  return `${stem}.${SOURCE_EXTENSIONS[language] ?? language}`
}

// Adapter — delegates to the shared CodeBlock.
function CodePane({ language, children }: { language: string; children: string }) {
  return <CodeBlock value={children} language={language} />
}

// Counter Panel
interface CounterPanelProps {
  count: number
  onIncrement: () => void
  onDecrement: () => void
}

function CounterPanel({ count, onIncrement, onDecrement }: CounterPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Counter</span>
        <span className="panel-badge">State</span>
      </div>
      <div className="panel-content">
        <div className="counter-display">{count}</div>
        <div className="counter-buttons">
          <button
            className="btn btn-lg btn-decrement"
            onClick={onDecrement}
            title="Decrement"
          >
            −
          </button>
          <button
            className="btn btn-lg btn-increment"
            onClick={onIncrement}
            title="Increment"
          >
            +
          </button>
        </div>
      </div>
      <div className="panel-header">
        <span className="panel-title">schema.graphql</span>
        <span className="panel-badge">{cell.schemaLanguage}</span>
      </div>
      <CodePane language={cell.schemaLanguage}>{cell.schemaSource}</CodePane>
    </div>
  )
}

// Empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>{message}</p>
    </div>
  )
}

// Greeting Panel
interface GreetingPanelProps {
  result: Record<string, unknown> | null
  loading: boolean
  error: string | null
  badge: string
  badgeSuccess: boolean
  onFetch: () => void
}

function GreetingPanel({ result, loading, error, badge, badgeSuccess, onFetch }: GreetingPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Greeting API</span>
        <span className={`panel-badge ${badgeSuccess ? 'success' : ''}`}>{badge}</span>
      </div>
      <div className="panel-content">
        <button
          className="btn btn-primary"
          onClick={onFetch}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Call /greeting'}
        </button>

        {result === null && !error ? (
          <div className="results-container">
            <EmptyState message="Click the button to fetch greeting" />
          </div>
        ) : error ? (
          <div className="results-container">
            <CodeBlock value={error} language="text" className="error-text" />
          </div>
        ) : (
          <div className="results-container">
            <CodeBlock value={JSON.stringify(result, null, 2)} language="json" />
          </div>
        )}
      </div>
      <div className="panel-header">
        <span className="panel-title">{sourceFilename('greeting', cell.greetingLanguage)}</span>
        <span className="panel-badge">{cell.greetingLanguage}</span>
      </div>
      <CodePane language={cell.greetingLanguage}>{cell.greetingSource}</CodePane>
      <p className="panel-caption">
        Same SDK resource, whether this cell runs <strong>{cell.location}</strong> or remote — the matrix's
        point: write the resource once, and local ↔ remote is unchanged.
      </p>
    </div>
  )
}

export function BasicPage() {
  // Counter state
  const [count, setCount] = useState(0)

  // Greeting state
  const [greetingResult, setGreetingResult] = useState<Record<string, unknown> | null>(null)
  const [greetingLoading, setGreetingLoading] = useState(false)
  const [greetingError, setGreetingError] = useState<string | null>(null)
  const [greetingBadge, setGreetingBadge] = useState('Ready')
  const [greetingBadgeSuccess, setGreetingBadgeSuccess] = useState(false)

  // Fetch current count on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${cell.apiBase}/TableName/${COUNTER_ID}`)
        if (response.ok) {
          const data = await response.json()
          setCount(data.count || 0)
        }
      } catch {
        // Counter doesn't exist yet, that's fine
      }
    }
    fetchCount()
  }, [])

  // Update counter via REST API
  const updateCounter = useCallback(async (newCount: number) => {
    try {
      const response = await fetch(`${cell.apiBase}/TableName/${COUNTER_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: COUNTER_ID,
          count: newCount,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCount(data.count)
    } catch (err) {
      console.error('Failed to update counter:', err)
    }
  }, [])

  // Counter handlers
  const handleIncrement = useCallback(() => {
    const newCount = count + 1
    setCount(newCount)
    updateCounter(newCount)
  }, [count, updateCounter])

  const handleDecrement = useCallback(() => {
    const newCount = count - 1
    setCount(newCount)
    updateCounter(newCount)
  }, [count, updateCounter])

  // Fetch greeting
  const fetchGreeting = useCallback(async () => {
    setGreetingLoading(true)
    setGreetingError(null)

    try {
      const response = await fetch(`${cell.apiBase}/greeting`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setGreetingResult(data)
      setGreetingBadge('Success')
      setGreetingBadgeSuccess(true)

      // Reset badge after 2 seconds
      setTimeout(() => {
        setGreetingBadge('Ready')
        setGreetingBadgeSuccess(false)
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setGreetingError(message)
      setGreetingBadge('Error')
      setGreetingBadgeSuccess(false)
    } finally {
      setGreetingLoading(false)
    }
  }, [])

  return (
    <>
      <CounterPanel
        count={count}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />

      <GreetingPanel
        result={greetingResult}
        loading={greetingLoading}
        error={greetingError}
        badge={greetingBadge}
        badgeSuccess={greetingBadgeSuccess}
        onFetch={fetchGreeting}
      />
    </>
  )
}
