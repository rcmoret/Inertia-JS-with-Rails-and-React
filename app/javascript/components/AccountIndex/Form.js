import React from "react";

import { AccountLabel, AccountRow } from "./shared";
import Button, { DisabledButton } from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

import { decimalToInt } from "../../lib/MoneyFormatter";

const isTrue = val => val === true || val == "true"

const Form = ({ account, update, onSubmit, ...props }) => {
  const {
    slug,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    isNew,
    priority,
  } = { ...account, ...account.updatedAttributes }
  const { updatedAttributes } = account

  const handleChange = event => update({ [event.target.name]: event.target.value })
  const handleCashFlowChange = () => update({ isCashFlow: !isCashFlow })

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible", wrap: "flex-wrap"}}>
      <div className="hidden">{slug}</div>
      <AccountRow>
        <AccountCell>Name</AccountCell>
        <AccountCell>
          <TextInput classes={["w-full"]} type="text" value={name} onChange={handleChange} name="name" />
        </AccountCell>
      </AccountRow>
      <AccountRow>
        <AccountCell>Slug:</AccountCell>
        <AccountCell>
          <TextInput classes={["w-full"]} type="text" value={slug} onChange={handleChange} name="slug" />
        </AccountCell>
      </AccountRow>
      <AccountRow>
        <AccountCell>Priority</AccountCell>
        <AccountCell>
          <TextInput classes={["w-full text-right"]} type="text" value={priority} onChange={handleChange} name="priority" />
        </AccountCell>
      </AccountRow>
      <AccountRow>
        <AccountCell>Cash Flow:</AccountCell>
        <AccountCell>
          <CashFlowCheckBox onChange={handleCashFlowChange} isCashFlow={isTrue(isCashFlow)} />
        </AccountCell>
      </AccountRow>
      <AccountRow>
        <FormLinks closeForm={props.closeForm} onSubmit={onSubmit} updatedAttributes={updatedAttributes} />
      </AccountRow>
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
