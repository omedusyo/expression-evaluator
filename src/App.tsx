import { useState, KeyboardEvent, useRef } from 'react'
import Evaluator from './evaluator/Evaluator'

interface FunctionDetails {
  name: string;
  params: string[];
  body: string;
  visible: boolean;
}

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [error, setError] = useState('')
  const [variables, setVariables] = useState<Map<string, number>>(new Map())
  const [functions, setFunctions] = useState<FunctionDetails[]>([])
  const [closures, setClosures] = useState<string[]>([])
  const evaluatorRef = useRef<Evaluator>(new Evaluator())

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      try {
        setError('')
        const evalResult = evaluatorRef.current.evaluate(input.trim())
        setResult(evalResult.toString())
        setHistory([`${input} = ${evalResult}`, ...history])
        setInput('')
        
        // Update variables, functions, and closures state after evaluation
        setVariables(evaluatorRef.current.getVariables())
        
        // Get functions and add visibility flag for UI toggling
        const funcDetails = evaluatorRef.current.getFunctions().map(func => ({
          ...func,
          visible: false // Default to collapsed
        }));
        
        // Preserve expanded state of already displayed functions
        if (functions.length > 0) {
          for (const newFunc of funcDetails) {
            const existingFunc = functions.find(f => f.name === newFunc.name);
            if (existingFunc) {
              newFunc.visible = existingFunc.visible;
            }
          }
        }
        
        setFunctions(funcDetails)
        setClosures(evaluatorRef.current.getClosures())
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
      
      <div className="environment-container">
        <div className="variables">
          <h3>Current Variables</h3>
          {variables.size === 0 ? (
            <div className="variables-empty">No variables defined yet</div>
          ) : (
            <div className="variables-grid">
              {Array.from(variables.entries()).map(([name, value]) => (
                <div key={name} className="variable-item">
                  <span className="variable-name">{name}</span>
                  <span className="variable-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="functions-closures">
          <div className="functions">
            <h3>Defined Functions</h3>
            {functions.length === 0 ? (
              <div className="functions-empty">No functions defined yet</div>
            ) : (
              <div className="functions-list">
                {functions.map((func) => (
                  <div key={func.name} className="function-item">
                    <div
                      className="function-header"
                      onClick={() => {
                        // Toggle visibility for this function
                        setFunctions(functions.map(f => 
                          f.name === func.name ? {...f, visible: !f.visible} : f
                        ));
                      }}
                    >
                      <span className="function-name">{func.name}</span>
                      <span className="function-toggle">{func.visible ? '▼' : '▶'}</span>
                    </div>
                    
                    {func.visible && (
                      <div className="function-details">
                        <div className="function-signature">
                          <span className="keyword">def</span> {func.name}({func.params.join(', ')}) = {func.body}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="closures">
            <h3>Closures</h3>
            {closures.length === 0 ? (
              <div className="closures-empty">No closures defined yet</div>
            ) : (
              <div className="closures-list">
                {closures.map((name) => (
                  <div key={name} className="closure-item">
                    <span className="closure-name">{name}</span>
                    <span className="closure-type">(function)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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