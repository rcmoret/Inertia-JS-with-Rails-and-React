import React from "react";

import AccountTabs from "./AccountTransactionsIndex/AccountTabs";
import PageHeader from "./shared/Header";
import Row from "./shared/Row";

const App = ({ accounts, interval, namespace }) => {
  const selectedAccount = { id: null }
  const { month, year } = interval

  return (
    <div>
      <PageHeader namespace={namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white"}}>
            <AccountTabs
              accounts={accounts}
              month={month}
              selectedAccount={selectedAccount}
              year={year}
            />
          </Row>
        </div>
      </div>
    </div>
  )
}

export default App;
