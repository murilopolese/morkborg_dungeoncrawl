import "flex-layout-system"

function App() {
  return (
    <div className="column" style={{width: '360px', height: '640px'}}>

      <div className="row justify-center">
        <h1>The Slaughter Fort</h1>
      </div>

      <div className="row">
        <div className="column full-width">
          <img src="Berserker.png" />
          <h2>Character 1</h2>
        </div>
        <div className="column full-width align-end">
          <img src="Berserker.png" />
          <h2 style={{textAlign: 'right'}}>Character 2</h2>
        </div>
      </div>

      <div className="row">
        <div className="column" style={{width: '20px', fontSize: '5px'}}>
          <div className="column align-center justify-center" style={{height: '20px', border: 'solid 1px white'}}>
            <span>Freeze</span>
          </div>
          <div className="column align-center justify-center" style={{height: '20px', border: 'solid 1px white'}}>
            <span>Poison</span>
          </div>
          <div className="column align-center justify-center" style={{height: '20px', border: 'solid 1px white', gap: '0'}}>
            <span>Curse</span>
            <span>(10)</span>
          </div>
        </div>
      </div>


    </div>
  )
}

export default App
