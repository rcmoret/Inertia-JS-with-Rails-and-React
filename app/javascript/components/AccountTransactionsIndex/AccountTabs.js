import React from "react";

import MoneyFormatter from "../../lib/MoneyFormatter";
import { sortByPriorty as sortFn } from "../../lib/Functions"

import Row from "../shared/Row";
import { ButtonStyleInertiaLink } from "../shared/Link";

const AccountTabs = ({ accounts, ...props}) => {
  const today = new Date()
  const currentInterval = { month: today.getMonth() + 1, year: today.getFullYear() }
  const interval = { month: props.month, year: props.year }

  return (
    <>
      <Row styling={{ wrap: "flex-wrap", flexAlign: "start" }}>
        {accounts.sort(sortFn).map(account => (
          <AccountLink
            key={account.slug}
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
  const isSelected = account.slug === selectedAccount.slug
  const month = isSelected ? currentInterval.month : interval.month
  const year = isSelected ? currentInterval.year : interval.year
  const href = `/accounts/${account.slug}/transactions/${month}/${year}`
  const hoverBgColor = isSelected ? `hover:bg-blue-400` : `hover:bg-gray-500`
  const styling = {
    bgColor: `bg-${isSelected ? "blue" : "gray"}-400`,
    padding: "pt-4 pb-4 pr-2 pl-2",
    width: "w-46p sm:w-3/10 md:w-2/20 lg:w-1/8",
    margin: "mb-2 mr-2"
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
