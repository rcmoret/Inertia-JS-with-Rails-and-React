import React from "react";

import MoneyFormatter from "../../lib/MoneyFormatter";

import Row from "../shared/Row";
import { ButtonStyleInertiaLink } from "../shared/Link";

const AccountTabs = ({ accounts, ...props}) => {
  const sortFn = (a, b) => a.priority - b.priority
  const today = new Date()
  const currentInterval = { month: today.getMonth() + 1, year: today.getFullYear() }
  const interval = { month: props.month, year: props.year }

  return (
    <>
      <Row>
        {accounts.sort(sortFn).map(account => (
          <AccountLink
            key={account.id}
            account={account}
            currentInterval={currentInterval}
            interval={interval}
            {...props}
          />
        ))}
      </Row>
    </>
  )
}

const AccountLink = ({ account, currentInterval, interval, selectedAccount }) => {
  const isSelected = account.id === selectedAccount.id
  const month = isSelected ? currentInterval.month : interval.month
  const year = isSelected ? currentInterval.year : interval.year
  const href = `/accounts/${account.slug}/transactions/${month}/${year}`
  const hoverBgColor = isSelected ? `hover:bg-blue-400` : `hover:bg-gray-500`
  const styling = {
    bgColor: `bg-${isSelected ? "blue" : "gray"}-400`,
    padding: "pt-4 pb-4 pr-2 pl-2",
    width: "w-1/10"
  }

  return (
    <ButtonStyleInertiaLink
      href={href}
      color="text-black"
      hoverColor="text-black"
      hoverBgColor={hoverBgColor}
      styling={styling}
    >
      <div className="border-b border-black border-solid">
        {account.name}
      </div>
      <div className="text-right">
        {MoneyFormatter(account.balance, { decorate: true })}
      </div>
    </ButtonStyleInertiaLink>
  )
}

export default AccountTabs;
