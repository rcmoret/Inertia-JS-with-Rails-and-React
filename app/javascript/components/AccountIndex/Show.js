import React, { useState } from "react";

import { fromDateString } from "../../lib/DateFormatter";
import { AccountCell, AccountRow } from "./shared";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row, { StripedRow } from "../shared/Row";

const Show = ({ account, deleteOrRestoreCategory, ...props }) => {
  const {
    slug,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    priority,
  } = account
  const openForm = () => props.openForm(slug)

  return (
    <StripedRow styling={{wrap: "flex-wrap", flexAlign: "justify-start", overflow: "overflow-visible"}}>
      <div className="w-full underline text-xl">{name}</div>
      <AccountRow>
        <AccountCell>Slug</AccountCell>
        <AccountCell>{slug}</AccountCell>
      </AccountRow>
      <AccountRow>
        <AccountCell>Priority</AccountCell>
        <AccountCell>{priority}</AccountCell>
      </AccountRow>
      <AccountRow>
        <AccountCell>Cash Flow</AccountCell>
        <AccountCell>{isCashFlow ? "cash-flow" : "non-cash-flow"}</AccountCell>
      </AccountRow>
      <AccountRow>
        <Cell styling={{width: "w-3/12"}}>
          <span className="w-full italic">
            {isArchived && <span>Archived on {fromDateString(archivedAt)}</span>}
          </span>
        </Cell>
      </AccountRow>
      <AccountRow>
        <Cell styling={{width: "w-full", "md:width": "md:w-3/12"}}>
          <Links isArchived={isArchived} deleteOrRestoreCategory={deleteOrRestoreCategory} openForm={openForm} />
        </Cell>
      </AccountRow>
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
