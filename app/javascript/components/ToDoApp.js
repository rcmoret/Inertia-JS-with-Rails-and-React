import React, { useState } from "react";
import ToDoList from "./ToDoList";
import TextInput from "./TextInput";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import { Button, ButtonGroup } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import { Paper, Box } from "@material-ui/core";
import { Exclamation } from "./Icon"


const ToDoApp = ({ toDoItems, emptyItem, errors = {} }) => {
  const [newItem, setNewItem] = useState(emptyItem);

  const addItem = (event) => {
    event.preventDefault();
    Inertia.post("/to_dos", {
      to_do: { ...newItem, completed: false },
    });

    setNewItem({ description: '' });
  }

  const onChange = event => (
    setNewItem({ description: event.target.value })
  )

  async function clearCompleted(event) {
    event.preventDefault();
    const completedItems = toDoItems.filter((item) => item.completed);

    // Create a collection of axios requests (which are promises) and await them all.
    await Promise.all(
      completedItems.map((item) => axios.delete("/to_dos/" + item.id))
    );

    Inertia.reload();
  }

  return (
    <div>
      <h1>All (my) Music</h1>
      <form onSubmit={addItem}>
        <TextInput
          errors={errors.description || []}
          name='description'
          label="New To Do Item"
          onChange={onChange}
          value={newItem.description}
        />
        <Box display="flex" flexDirection="row-reverse">
          <ButtonGroup variant="contained" style={{ marginTop: "1rem" }}>
            <Button color="primary" onClick={addItem}>
              Add
            </Button>
            <Button color="secondary" onClick={clearCompleted}>
              Clear Completed
            </Button>
          </ButtonGroup>
        </Box>
      </form>

      {toDoItems.length > 0 && (
        <Paper elevation={2}>
          <ToDoList toDoItems={toDoItems} />
        </Paper>
      )}
    </div>
  );
};

export default ToDoApp;
