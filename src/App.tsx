// src/App.tsx
import Grid from "./components/Grid"
import "./App.css"  // Asegúrate de importar los estilos

export default function App() {
  return (
    <div className="app-background">
      <div className="app-content">
        <Grid />
      </div>
    </div>
  )
}
