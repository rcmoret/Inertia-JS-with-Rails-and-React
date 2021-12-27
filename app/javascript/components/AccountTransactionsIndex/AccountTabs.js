import React from "react";

import MoneyFormatter from "../../lib/MoneyFormatter";

import Row from "../shared/Row";
import { ButtonStyleInertiaLink } from "../shared/Link";

const AccountTabs = ({ accounts, ...props}) => {
  const sortFn = (a, b) => a.priority - b.priority

  return (
    <Row>
      {accounts.sort(sortFn).map(account => (
        <AccountLink key={account.id} account={account} {...props} />
      ))}
    </Row>
  )
}

const AccountLink = ({ account, selectedAccount, month, year }) => {
  const href = `/accounts/${account.slug}/transactions/${month}/${year}`
  const isSelected = account.id === selectedAccount.id
  const hoverBgColor = `hover:bg-${isSelected ? "blue" : "gray"}-400`
  const styling = {
    bgColor: `bg-${isSelected ? "blue" : "gray"}-200`,
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
