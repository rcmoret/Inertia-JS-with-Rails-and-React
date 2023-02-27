import React, { useState } from "react";

import { router } from "@inertiajs/react";

import { fromDateString } from "../../lib/DateFormatter";
import { AccountLabel, AccountValue, AccountRow } from "./shared";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";

const Show = ({ account, url, ...props }) => {
  const {
    slug,
    name,
    archivedAt,
    isArchived,
    isCashFlow,
    priority,
  } = account
  const openForm = () => props.openForm(slug)

  const deleteAccount = () => {
    router.delete(url({ slug }),
      { },
      { onBefore: window.confirm(`Are you sure you want to delete ${name}?`) }
    )
  }
  const restoreAccount = () => {
    router.put(url(), { account: { archivedAt: null }, slug })
  }
  const deleteOrRestoreAccount = () => archivedAt ? restoreAccount() : deleteAccount()
  const notice = account.notice || { level: "info", message: "" }

  return (
    <StripedRow styling={{wrap: "flex-wrap", flexAlign: "justify-start", overflow: "overflow-visible"}}>
      <Messages notice={notice} />
      <div className="w-full underline text-xl">{name}</div>
      <AccountRow>
        <AccountLabel>Slug</AccountLabel>
        <AccountValue>{slug}</AccountValue>
      </AccountRow>
      <AccountRow>
        <AccountLabel>Priority</AccountLabel>
        <AccountValue>{priority}</AccountValue>
      </AccountRow>
      <AccountRow>
        <AccountLabel>Cash Flow</AccountLabel>
        <AccountValue>{isCashFlow ? "cash-flow" : "non-cash-flow"}</AccountValue>
      </AccountRow>
      <AccountRow>
        <Cell styling={{width: "w-3/12"}}>
          <span className="w-full italic">
            {isArchived && <span>Archived on {fromDateString(archivedAt)}</span>}
          </span>
        </Cell>
      </AccountRow>
      <AccountRow>
        <Cell styling={{width: "w-full"}}>
          <Links isArchived={isArchived} deleteOrRestoreAccount={deleteOrRestoreAccount} openForm={openForm} />
        </Cell>
      </AccountRow>
    </StripedRow>
  )
}

const Links = ({ isArchived, deleteOrRestoreAccount, openForm }) => {
  const iconClassName = `fas fa-trash${isArchived ? "-restore" : ""}`
  return (
    <AccountRow>
      <div className="w-6/12">
        <Link onClick={openForm} color="text-blue-700">
          <Icon className="fas fa-edit" />
        </Link>
      </div>
      <div className="w-6/12">
        <Link onClick={deleteOrRestoreAccount} color="text-blue-700">
          <Icon className={iconClassName} />
        </Link>
      </div>
    </AccountRow>
  )
}

const Messages = ({ notice }) => {
  if (notice.level === "info" && notice.message.length) {
    return (
      <Row styling={{ wrap: "flex-wrap" }}>
        <div className="w-full text-blue-700">
          <Point>{notice.message}</Point>
        </div>
      </Row>
    )
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

export default Show;
