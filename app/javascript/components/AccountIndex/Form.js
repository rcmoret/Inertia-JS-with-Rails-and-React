import React from "react";

import { AccountLabel, AccountRow } from "./shared";
import Button, { DisabledButton } from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

import { decimalToInt } from "../../lib/MoneyFormatter";

const isTrue = val => val === true || val == "true"

const Form = ({ account, closeForm, onSubmit, updateAccount, ...props }) => {
  const { attributeErrors, updatedAttributes } = account
  const notice = account.notice || { level: "info", message: "" }

  const {
    slug,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    priority,
  } = { ...account, ...updatedAttributes }

  const handleChange = (event) => updateAccount({ updatedAttributes: { [event.target.name]: event.target.value } })
  const handleCashFlowChange = () => updateAccount({ updatedAttributes: { isCashFlow: !isCashFlow } })

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible", wrap: "flex-wrap"}}>
      <FormMessages notice={notice} />
      <AccountRow>
        <AccountLabel>Name</AccountLabel>
        <AccountInput>
          <TextInput
            classes={["w-full"]}
            type="text"
            value={name}
            onChange={handleChange}
            name="name"
            errors={attributeErrors.name || []}
          />
        </AccountInput>
      </AccountRow>
      <AccountRow>
        <AccountLabel>Slug:</AccountLabel>
        <AccountInput>
          <TextInput
            classes={["w-full"]}
            type="text"
            value={slug}
            onChange={handleChange}
            name="slug"
            errors={attributeErrors.slug || []}
          />
        </AccountInput>
      </AccountRow>
      <AccountRow>
        <AccountLabel>Priority</AccountLabel>
        <AccountInput>
          <TextInput
            classes={["w-full text-right"]}
            type="text"
            value={priority}
            onChange={handleChange}
            name="priority"
            errors={attributeErrors.priority || []}
          />
        </AccountInput>
      </AccountRow>
      <AccountRow>
        <AccountLabel>Cash Flow:</AccountLabel>
        <AccountInput>
          <div className="w-6/12">
            <input type="checkbox" checked={isCashFlow} onChange={handleCashFlowChange} />
          </div>
        </AccountInput>
      </AccountRow>
      <AccountRow>
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
      </AccountRow>
    </StripedRow>
  )
}

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

const FormMessages = ({ notice }) => {
  if (notice.level === "info" && !notice.message.length) {
    <Row styling={{ wrap: "flex-wrap" }}>
      <div className="w-full text-blue-700">
        <Point>{notice.message}</Point>
      </div>
    </Row>
  } else if (notice.level === "info") {
    return null
  } else if (notice.level === "error") {
    return (
      <Row styling={{ wrap: "flex-wrap" }}>
        <div className="w-full text-red-700">
          <Point>{notice.message}</Point>
        </div>
      </Row>
    )
  }
}

const AccountInput = ({ children }) => (
  <div className="w-full sm:w-5/12">{children}</div>
);

export default Form;
