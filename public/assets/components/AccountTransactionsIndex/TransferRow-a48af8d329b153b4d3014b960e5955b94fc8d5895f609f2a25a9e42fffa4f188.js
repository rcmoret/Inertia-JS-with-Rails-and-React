import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

import { AmountInput } from "../shared/TextInput";
import { asOption } from "../../lib/Functions";
import Button from "../shared/Button";
import Cell from "../shared/Cell";
import { decimalToInt } from "../../lib/MoneyFormatter";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Select from "react-select";
import { StripedRow } from "../shared/Row";

const newTransfer = () => ({
  toAccountId: null,
  amount: "",
});

export const TransferRow = ({ accounts, selectedAccount }) => {
  const [transfer, updateTransfer] = useState(newTransfer())
  const [isFormShown, toggleForm] = useState(false)
  const toggleFormVisibility = () => toggleForm(!isFormShown)
  const collection = accounts.filter(account => account.id !== selectedAccount.id)
  const handleAmountChange = ev => updateTransfer({
    ...transfer,
    amount: ev.target.value
  })
  const handleToAccountChange = ev => updateTransfer({ ...transfer, toAccountId: ev.value })
  const toAccount = collection.find(account => account.id === transfer.toAccountId)
  const options = collection.map(asOption)
  const value = options.find(option => option.value === transfer.toAccountId)

  const postTransfer = () => Inertia.post(
    "/accounts/transfer",
    {
      transfer: {
        toAccountId: transfer.toAccountId,
        fromAccountId: selectedAccount.id,
        amount: decimalToInt(transfer.amount),
      },
    },
  )

  if (isFormShown) {
    return (
      <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
        <Cell styling={{ width: "w-6/12" }}>
          <Cell styling={{width: "w-1/12"}}>
            <Link onClick={toggleFormVisibility} color="text-red-800">
              <Icon className="fas fa-times" />
            </Link>
          </Cell>
          <Cell styling={{width: "w-3/12"}}>
            Create Transfer:
          </Cell>
          <Cell styling={{width: "w-3/12", wrap: "flex-wrap", margin: "mb-2 ml-2", overflow: "overflow-visible"}}>
            <Select
              options={options}
              onChange={handleToAccountChange}
              placeholder="To Account"
              value={value}
            />
          </Cell>
          <Cell styling={{ width: "w-3/12" }}>
            <AmountInput
              classes={["p-1 w-full text-right"]}
              name="amount"
              placeholder="amount"
              onChange={handleAmountChange}
              value={transfer.amount}
            />
          </Cell>
          <Cell styling={{ width: "w-2/12" }}>
            <Button
              bgColor="bg-green-700"
              hoverBgColor="bg-green-800"
              // classes={["w-7/12"]}
              type="submit"
              onSubmit={postTransfer}
              onClick={postTransfer}
            >
              Transfer
            </Button>
          </Cell>
        </Cell>
      </StripedRow>
    )
  } else {
    return (
      <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
        <Cell styling={{ width: "w-2/12" }}>
          <Link to="#" color="text-blue-400" onClick={toggleFormVisibility}>
            Create Transfer
          </Link>
        </Cell>
      </StripedRow>
    )
  }
};
