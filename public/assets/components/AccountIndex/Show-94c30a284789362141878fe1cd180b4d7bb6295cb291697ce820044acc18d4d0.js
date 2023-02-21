import React, { useState } from "react";

import { fromDateString } from "../../lib/DateFormatter";

import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

const Show = ({ account, deleteOrRestoreCategory, ...props }) => {
  const {
    id,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    priority,
    slug,
  } = account
  const openForm = () => props.openForm(id)

  return (
    <StripedRow styling={{wrap: "flex-wrap", flexAlign: "justify-start", overflow: "overflow-visible"}}>
      <div className="hidden">{id}</div>
      <div className="w-full underline text-xl">{name}</div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Slug:</div>
          <div className="w-6/12">{slug}</div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Priority:</div>
          <div className="w-6/12">{priority}</div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <div className="w-6/12">Cash Flow:</div>
          <div className="italic w-6/12">{isCashFlow ? "cash-flow" : "non-cash-flow"}</div>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <span className="w-full italic">
            {isArchived && <span>Archived on {fromDateString(archivedAt)}</span>}
          </span>
        </Cell>
      </div>
      <div className="w-full">
        <Cell styling={{width: "w-3/12"}}>
          <Links isArchived={isArchived} deleteOrRestoreCategory={deleteOrRestoreCategory} openForm={openForm} />
        </Cell>
      </div>
    </StripedRow>
  )
}

const Links = ({ isArchived, deleteOrRestoreCategory, openForm }) => {
  const iconClassName = `fas fa-trash${isArchived ? "-restore" : ""}`
  return (
    <Row>
      <div>
        <Link onClick={openForm} color="text-blue-700">
          <Icon className="fas fa-edit" />
        </Link>
      </div>
      <div>
        <Link onClick={deleteOrRestoreCategory} color="text-blue-700">
          <Icon className={iconClassName} />
        </Link>
      </div>
    </Row>
  )
}

export default Show;
