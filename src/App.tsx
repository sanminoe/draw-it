import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import RoomPage from "./Pages/Room/RoomPage";
function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <header>Header</header>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="room/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
