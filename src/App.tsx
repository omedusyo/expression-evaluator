import { useState, KeyboardEvent, useRef } from 'react'
import Evaluator from './evaluator/Evaluator'

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [error, setError] = useState('')
  const evaluatorRef = useRef<Evaluator>(new Evaluator())

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      try {
        setError('')
        const evalResult = evaluatorRef.current.evaluate(input.trim())
        setResult(evalResult.toString())
        setHistory([`${input} = ${evalResult}`, ...history])
        setInput('')
      } catch (err) {
        setError((err as Error).message)
      }
    }
  }

  return (
    <div className="app">
      <h1>Expression Evaluator</h1>
      
      <div className="input-container">
        <input
          type="text"
          className="expression-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an expression (e.g. 2 + 3) or variable definition (e.g. let x = 5)"
        />
      </div>

      {error && <div className="result error">{error}</div>}
      {!error && <div className="result">{result}</div>}

      <div className="history">
        <h3>History</h3>
        {history.map((item, index) => (
          <div key={index} className="history-item">{item}</div>
        ))}
      </div>
    </div>
  )
}

export default App