import React from "react";
import "./App.css";
import Table from "./Table/Table";

function App() {
  return (
    <div className="App">
      <Table />
    </div>
  );
}

export default React.memo(App);
