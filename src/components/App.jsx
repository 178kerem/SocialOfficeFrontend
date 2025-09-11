import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRead from "./components/User/UserRead";
import UserCreate from "./components/User/UserCreate";
import UserUpdate from "./components/User/UserUpdate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/users" element={<UserRead />} />
        <Route path="/users/create" element={<UserCreate />} />
        <Route path="/users/update/:id" element={<UserUpdate />} />
      </Routes>
    </Router>
  );
}

export default App;
