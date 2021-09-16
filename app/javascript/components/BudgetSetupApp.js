import React, { useState } from "react";
import ToDoList from "./ToDoList";
// import TextInput from "./TextInput";
import { Inertia } from "@inertiajs/inertia";
import Header from "./Header";

const ToDoApp = (props) => {
  // const [newItem, setNewItem] = useState(emptyItem);
  const { baseInterval, targetInterval, errors } = props
  console.log(props)
  const onSubmit = () => null

  return (
    <div>
      <Header namespace='budget' />
      <h1>Setting up {targetInterval.month}-{targetInterval.year}</h1>
      <form onSubmit={onSubmit}>
      </form>
    </div>
  );
};

export default ToDoApp;
