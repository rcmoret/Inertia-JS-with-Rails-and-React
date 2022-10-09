import React from "react";

import { Inertia } from "@inertiajs/inertia";

import { fromDateString } from "../../lib/DateFormatter"
import MoneyFormatter from "../../lib/MoneyFormatter";

import AmountSpan from "../shared/AmountSpan";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import { StripedRow } from "../shared/Row";
import { EditForm } from "./TransactionForm"

export const Transaction = props => {
  const {
    transaction,
    accounts,
    closeForm,
    detailFns,
    interval,
    isCashFlow,
    items,
    renderForm,
    showDetailsForIds,
    showFormForId,
  } = props
  const {
    id,
    amount,
    balance,
    budgetExclusion,
    checkNumber,
    description,
    details,
    isEditable,
    isPending,
    notes,
    receiptBlob,
    transferId,
  } = transaction
  const { month, year } = interval
  const clearanceDate = isPending ? "Pending" : fromDateString(transaction.clearanceDate)
  const isDetailShown = showDetailsForIds.includes(id)
  const notesNeedAttn = (notes || "").startsWith("!!!")
  const noteLines = (notes || "").split("<br>").map(line => line.replace(/^!!!/, ""))
  const modifyFns = {
    deleteTransaction: () => {
      const isConfirmed = window.confirm("Are you sure you want to delete this transaction?")
      if (isConfirmed) {
        Inertia.delete(`/transactions/${id}?month=${month}&year=${year}`)
      }
    },
    renderForm: () => renderForm(id)
  }

  if (showFormForId === id) {
    const makeRequest = body => {
      Inertia.put(`/transactions/${id}?month=${month}&year=${year}`,
        { transaction: body },
        { onSuccess: closeForm, forceFormData: true },
      )
    }

    return (
      <EditForm
        transaction={transaction}
        interval={interval}
        accounts={accounts}
        isCashFlow={isCashFlow}
        items={items}
        makeRequest={makeRequest}
        toggleForm={closeForm}
      />
    )
  } else {
    return (
      <StripedRow styling={{flexAlign: "justify-start"}}>
        <div className="hidden">{id}</div>
        <Cell styling={{ width: "w-4/12", flexAlign: "justify-start" }}>
          <div className="w-1/12">
            {details.length > 1 && <DetailToggleLink id={id} isDetailShown={isDetailShown} detailFns={detailFns} />}
          </div>
          <div className="w-4/12">
            <EditLink isEditable={isEditable} onClick={modifyFns.renderForm}>
              {clearanceDate}
            </EditLink>
          </div>
          <div className="w-7/12">
            {description || <BudgetItems details={details} />}
            {isDetailShown && <BudgetItemList details={details} />}
          </div>
        </Cell>
        <div className="w-1/12 text-right">
          <EditLink isEditable={isEditable} onClick={modifyFns.renderForm}>
            <AmountSpan amount={amount} />
          </EditLink>
          {isDetailShown && <DetailAmounts key={id} details={details} />}
        </div>
        <div className="w-1/12 text-right">
          <AmountSpan amount={balance} negativeColor="text-red-800" />
        </div>
        <div className="w-5/12 flex">
          {description && !isDetailShown && details.filter(detail => detail.budgetCategoryName).length > 0 &&
            <div className="ml-4 max-w-4/12">
              <BudgetItems details={details} />
            </div>}
          {budgetExclusion && <div className="ml-4 max-w-2/12 italic">budget exclusion</div>}
          {checkNumber && <div className="ml-4 max-w-2/12"><Icon className="fas fa-money-check" /> {checkNumber}</div>}
          {transferId && <div className="ml-4 max-w-2/12 italic"><span className="hidden">{transferId}</span>transfer</div>}
          {notes && <Notes noteLines={noteLines} notesNeedAttn={notesNeedAttn} />}
          {receiptBlob && <Receipt attachment={receiptBlob} />}
        </div>
        <div className="w-1/12 ml-4 flex flex-row-reverse">
          {isEditable && <ModifyLinks modifyFns={modifyFns} />}
        </div>
      </StripedRow>
    )
  }
}

const EditLink = ({ isEditable, children, onClick }) => {
  if (isEditable) {
    return (
      <Link onClick={onClick}>
        {children}
      </Link>
    )
  } else {
    return (
      <span>
        {children}
      </span>
    )
  }
}
const DetailToggleLink = ({ id, isDetailShown, detailFns }) => {
  const className = `fas fa-caret-${isDetailShown ? "down" : "right"}`
  const onClick = () => isDetailShown ? detailFns.hide(id) : detailFns.render(id)

  return (
    <Link color="text-blue-700" onClick={onClick}>
      <Icon className={className} />
    </Link>
  )
}

const DetailAmounts = ({ details }) => (
 details.map(detail => (
   <div key={detail.id} className="w-full text-sm">
     {MoneyFormatter(detail.amount, { decorate: true })}
   </div>
 ))
)

const BudgetItems = ({ details }) => {
  const sortFn = (a, b) => a.budgetCategoryName < b.budgetCategoryName ? -1 : 1

  return details.filter(detail => detail.budgetCategoryName).sort(sortFn).map((detail, n) => (
    <span key={detail.id}>
      { n > 0 && "; "}
      {detail.budgetCategoryName}
      {" "}
      <Icon className={detail.iconClassName} />
    </span>
  ))
}

const BudgetItemList = ({ details }) => {
  const sortFn = (a, b) => Math.abs(parseFloat(b.amount)) - Math.abs(parseFloat(a.amount))

  return details.sort(sortFn).map(detail => (
    <div key={detail.id} className="w-full text-sm">
      {detail.budgetCategoryName || "Petty Cash"}
      {" "}
      <Icon className={detail.iconClassName} />
    </div>
  ))
}

const NotesWrapper = ({ children, notesNeedAttn }) => {
  if (notesNeedAttn) {
    return (
      <div className="ml-4 max-w-4/12 bg-blue-900 text-white pl-2 pr-2">
        {children}
      </div>
    )
  } else {
    return (
      <div className="ml-4 max-w-4/12">
        {children}
      </div>
    )
  }
};

const Notes = ({ noteLines, notesNeedAttn  }) => (
  <NotesWrapper notesNeedAttn={notesNeedAttn}>
    {noteLines.map((note, index) => (
      <div key={index} className="w=full">
        {index === 0 && <Icon className="fas fa-sticky-note" />}
        {" "}
        {note}
      </div>
    ))}
  </NotesWrapper>
)

const ModifyLinks = ({ modifyFns }) => {
  return (
    <>
      <div className="mr-2">
        <Link color="text-blue-700"  onClick={modifyFns.deleteTransaction}>
          <Icon className="fa fa-trash" />
        </Link>
      </div>
      <div className="mr-2">
        <Link color="text-blue-700"  onClick={modifyFns.renderForm}>
          <Icon className="fa fa-edit" />
        </Link>
      </div>
    </>
  )
}

const Receipt = ({ attachment }) => {
  const truncate = filename => {
    const initial = filename.slice(0, 10)
    const terminus = filename.slice(-4)
    return `${initial}...${terminus}`
  }

  const filename = attachment.filename.length > 20 ? truncate(attachment.filename) : attachment.filename
  return (
    <div className="ml-2">
      <Link color="text-blue-700" target="_blank" href={attachment.path}>
        <Icon className="fa fa-paperclip" />
        {" "}
        {filename}
      </Link>
    </div>
  )
}
