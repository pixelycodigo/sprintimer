import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<h1 className="text-4xl font-bold text-center mt-20">SprinTimer</h1>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
