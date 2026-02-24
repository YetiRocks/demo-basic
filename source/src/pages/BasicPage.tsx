import { useState, useCallback, useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import rust from 'highlight.js/lib/languages/rust'
import { syntaxHighlight } from '../utils.ts'

hljs.registerLanguage('rust', rust)

// Register GraphQL language for highlight.js
hljs.registerLanguage('graphql', () => ({
  name: 'GraphQL',
  aliases: ['gql'],
  keywords: {
    keyword: 'type input enum union interface implements extend schema directive scalar fragment query mutation subscription on',
    literal: 'true false null',
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
    hljs.QUOTE_STRING_MODE,
    hljs.NUMBER_MODE,
    { className: 'meta', begin: '\\@[a-zA-Z_]\\w*' },
    { className: 'type', begin: '\\b(ID|String|Int|Float|Boolean|Date)\\b' },
    { className: 'attr', begin: '[a-zA-Z_]\\w*(?=\\s*:)' },
    { className: 'punctuation', begin: '[!{}()\\[\\]:=|]' },
    { className: 'variable', begin: '\\$[a-zA-Z_]\\w*' },
  ],
}))

// Get the base URL for API calls
const BASE_URL = window.location.origin + '/demo-basic'
const COUNTER_ID = 'main-counter'

// Highlighted code panel (used as the entire bottom section content)
function CodePane({ language, children }: { language: string; children: string }) {
  const codeRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted')
      hljs.highlightElement(codeRef.current)
    }
  }, [children])
  return (
    <pre className="code-pane"><code ref={codeRef} className={`language-${language}`}>{children}</code></pre>
  )
}

const SCHEMA_GRAPHQL = `## Simple counter schema

type TableName @table @export {
    id: ID! @primaryKey
    count: Int!
}`

const GREETING_RS = `use yeti_core::prelude::*;

/// Custom greeting resource using concise syntax
resource!(Greeting {
    get => json!({"greeting": "Hello, World!"})
});`

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
        <span className="panel-badge">GraphQL</span>
      </div>
      <CodePane language="graphql">{SCHEMA_GRAPHQL}</CodePane>
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
            <pre className="results-pre error-text">{error}</pre>
          </div>
        ) : (
          <div className="results-container">
            <pre
              className="results-pre"
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(JSON.stringify(result, null, 2))
              }}
            />
          </div>
        )}
      </div>
      <div className="panel-header">
        <span className="panel-title">greeting.rs</span>
        <span className="panel-badge">Rust</span>
      </div>
      <CodePane language="rust">{GREETING_RS}</CodePane>
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
        const response = await fetch(`${BASE_URL}/TableName/${COUNTER_ID}`)
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
      const response = await fetch(`${BASE_URL}/TableName/${COUNTER_ID}`, {
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
      const response = await fetch(`${BASE_URL}/greeting`)

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
