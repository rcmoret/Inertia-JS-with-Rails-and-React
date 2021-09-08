import React from "react";
import { PlusCircle } from "./Icons"

const AddButton = props => (
  <button onClick={props.onClick} className={props.className}>
    <PlusCircle />
    {" "}
    {props.label}
  </button>
);

export default AddButton;
