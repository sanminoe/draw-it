import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import RoomPage from "./Pages/Room/RoomPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<RoomPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
