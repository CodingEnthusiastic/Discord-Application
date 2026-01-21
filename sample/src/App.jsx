import ThreeScene from './components/ThreeScene';
import TodoList from './components/TodoList';

function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div className="canvas-container">
        <ThreeScene />
      </div>
      <div className="ui-container">
        <h1>Crazy ToDo!</h1>
        <TodoList />
      </div>
    </div>
  );
}

export default App;
