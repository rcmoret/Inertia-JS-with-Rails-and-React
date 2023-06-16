import React, { useState } from "react";

import { router } from "@inertiajs/react";

import { v4 as uuid } from "uuid";

import { sortByPriorty } from "../../lib/Functions";
import usePageData from "../../lib/usePageData";

import { Account } from "./Account"
import Form from "./Form"
import { generateIdentifier } from "../../lib/Functions";
import Icon from "../shared/Icons";
import Link, { InertiaLink } from "../shared/Link";
import PageHeader from "../shared/Header";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";

const buildNewAccount = () => ({
  key: uuid(),
  attributeErrors: {},
  notice: { level: "info", message: "" },
  updatedAttributes: {
    key: generateIdentifier(),
    name: "",
    isCashFlow: true,
    priority: "",
    slug: "",
  },
})

export const App = props => {
  const [pageData, updatePageData] = usePageData(`accounts/admin`, {
    showFormForSlug: null,
  })
  const { showFormForSlug } = pageData
  const { accounts, includesArchived } = props
  const [newAccount, setNewAccount] = useState({ ...buildNewAccount(), ...props.newAccount })

  const updateNewAccount = payload => setNewAccount({
    ...newAccount,
    updatedAttributes: {
      ...newAccount.updatedAttributes,
      ...payload.updatedAttributes
    }
  })
  const queryParams = (optionalParams = {}) => {
    const archivedParam = includesArchived ? { include_archived: true } : {}
    const allParams = { ...archivedParam, ...optionalParams }
    if (Object.keys(allParams).length) {
      return "?" + Object.entries(allParams).map((param) => param.join("=")).join("&")
    } else {
      return ""
    }
  }
  const url = (optionalParams = {}) => `/accounts/admin${queryParams(optionalParams)}`

  const closeForm = () => updatePageData({ ...pageData, showFormForSlug: null })
  const closeNewForm = () => {
    closeForm()
    setNewAccount({ ...buildNewAccount() })
  }
  const openForm = slug => updatePageData({ ...pageData, showFormForSlug: slug })
  const renderForm = () => updatePageData({ ...pageData, showFormForSlug: newAccount.key })
  const submitNewAccount = () => router.post(url(),
    { account: newAccount.updatedAttributes },
    { onSuccess: closeNewForm }
  )

  const sortFn = (a, b) => {
    if ((a.isArchived && b.isArchived) || (!a.isArchived && !b.isArchived)) {
      return sortByPriorty(a, b)
    } else if (b.isArchived) {
      return -1
    } else {
      return 1
    }
  }

  const archiveLinkHref = `/accounts/admin${includesArchived ? "" : "?include_archived=true"}`
  const archiveLinkCopy = `${includesArchived ? "Exclude" : "Include"} Archived Accounts`
  const isFormShown = (account) => showFormForSlug === account.key || (account.notice && account.notice.level == "error")

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white", padding: "pt-1 px-1 pb-24", overflow: "overflow-visible"}}>
            <NewAccount
              account={newAccount}
              closeForm={closeNewForm}
              isFormShown={isFormShown}
              onSubmit={submitNewAccount}
              renderForm={renderForm}
              update={updateNewAccount}
            />
            {accounts.sort(sortFn).map(account => (
              <Account
                key={account.slug}
                isFormShown={isFormShown}
                account={account}
                closeForm={closeForm}
                openForm={openForm}
                url={url}
              />
            ))}
            <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible", wrap: "flex-wrap"}}>
              <ToggleArchivedLink href={archiveLinkHref}>
                {archiveLinkCopy}
              </ToggleArchivedLink>
            </StripedRow>
          </Row>
        </div>
      </div>
    </div>
  )
};

const NewAccount = ({ account, closeForm, icons, isFormShown, renderForm, update, onSubmit }) => {
  if (isFormShown(account, "key")) {
    return (
      <Form account={account} closeForm={closeForm} icons={icons} updateAccount={update} onSubmit={onSubmit} />
    )
  } else {
    return (
      <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
        <Link color="text-blue-700"  onClick={renderForm}>
          <Icon className="fas fa-plus" />
          {" "}
          Add New
        </Link>
      </StripedRow>
    )
  }
};

const ToggleArchivedLink = ({ children, href }) => {
  return (
    <InertiaLink href={href} color="text-blue-700" classes={["italics"]}>
      <Point>
        {children}
      </Point>
    </InertiaLink>
  )
};

export default App;
