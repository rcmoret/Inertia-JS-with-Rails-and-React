import React from "react";

import { Inertia } from "@inertiajs/inertia";
import Select from "react-select";

import Button, { DisabledButton } from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

import { decimalToInt } from "../../lib/MoneyFormatter";

const isTrue = val => val === true || val == "true"

const Form = ({ account, update, onSubmit, ...props }) => {
  const {
    id,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    isNew,
    priority,
    slug,
  } = { ...account, ...account.updatedAttributes }
  const { updatedAttributes } = account

  const handleChange = event => update({ [event.target.name]: event.target.value })
  const handleCashFlowChange = () => update({ isCashFlow: !isCashFlow })

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible", wrap: "flex-wrap"}}>
      <div className="hidden">{id}</div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12 underline text-xl">Name</div>
          <div className="w-6/12">
            <TextInput classes={["w-full"]} type="text" value={name} onChange={handleChange} name="name" />
          </div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Slug:</div>
          <div className="w-6/12">
            <TextInput classes={["w-full"]} type="text" value={slug} onChange={handleChange} name="slug" />
          </div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Priority:</div>
          <div className="w-6/12">
            <TextInput classes={["w-full text-right"]} type="text" value={priority} onChange={handleChange} name="priority" />
          </div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Cash Flow:</div>
          <CashFlowCheckBox onChange={handleCashFlowChange} isCashFlow={isTrue(isCashFlow)} />
        </Cell>
        <Cell styling={{width: "w-3/12"}}>
          <FormLinks closeForm={props.closeForm} onSubmit={onSubmit} updatedAttributes={updatedAttributes} />
        </Cell>
      </div>
    </StripedRow>
  )
}

const CashFlowCheckBox = ({ isCashFlow, onChange }) => (
  <div className="w-6/12">
    <input type="checkbox" checked={isCashFlow} onChange={onChange} />
  </div>
)

const FormLinks = ({ closeForm, onSubmit, updatedAttributes }) => (
  <Row styling={{flexDirection: "flex-row-reverse"}}>
    <div>
      <SubmitButton onSubmit={onSubmit} updatedAttributes={updatedAttributes}>
        Submit
        {" "}
        <Icon className="fas fa-check" />
      </SubmitButton>
    </div>
    <div>
      <Button onClick={closeForm} bgColor="bg-red-700" hoverBgColor="hover:bg-red-800">
        Close
        {" "}
        <Icon className="fas fa-times" />
      </Button>
    </div>
  </Row>
)

const SubmitButton = ({ children, onSubmit, updatedAttributes }) => {
  if (Object.entries(updatedAttributes).length) {
    return (
      <Button bgColor="bg-green-700" hoverBgColor="bg-green-800" onClick={onSubmit}>
        {children}
      </Button>
    )
  } else {
    return (
      <DisabledButton>{children}</DisabledButton>
    )
  }
}

export default Form;
