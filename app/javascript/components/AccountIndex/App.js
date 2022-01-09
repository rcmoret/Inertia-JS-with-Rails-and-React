import React, { useState } from "react";

import { Inertia } from "@inertiajs/inertia";

import { sortByPriorty } from "../../lib/Functions"
import usePageData from "../../lib/usePageData";

import Form from "./Form"
import Icon from "../shared/Icons";
import Link, { InertiaLink } from "../shared/Link";
import PageHeader from "../shared/Header";
import Row, { StripedRow } from "../shared/Row";
import Show from "./Show"

const formatKey = key => {
  switch(key) {
    case "isCashFlow":
      return "cashFlow"
    default:
      return key
  }
}

const requestBody = attributes => Object.entries(attributes).reduce((acc, [key, value]) => (
  { ...acc, [formatKey(key)]: value }
), {})

export const App = props => {
  const newAccount = {
      name: "",
      isCashFlow: null,
      priority: "",
      isNew: true,
      slug: "",
      updatedAttributes: {},
    }
  const [pageData, updatePageData] = usePageData(`accounts/admin`, {
    showFormForId: null,
    newAccount,
  })
  const { showFormForId } = pageData
  const accounts = props.accounts
  const updateNewAccount = payload => updatePageData({
    ...pageData,
    newAccount: {
      ...pageData.newAccount,
      updatedAttributes: {
        ...pageData.newAccount.updatedAttributes,
        ...payload
      },
    },
  })
  const queryParams = props.includesArchived ? "?include_archived=true" : ""
  const submitNewAccount = () => Inertia.post(`/accounts${queryParams}`,
    { account: requestBody(pageData.newAccount.updatedAttributes) },
    { onSuccess: updatePageData({ ...pageData, newAccount }) },
  )
  const closeForm = () => updatePageData({ ...pageData, showFormForId: null })
  const accountFns = {
    isFormShown: id => showFormForId === id,
    openForm: id => updatePageData({ ...pageData, showFormForId: id }),
    closeForm,
  }
  const newFormFns = {
    closeForm,
    renderForm: () => updatePageData({ ...pageData, showFormForId: "new" }),
  }

  const sortFn = (a, b) => {
    if ((a.isArchived && b.isArchived) || (!a.isArchived && !b.isArchived)) {
      return sortByPriorty(a, b)
    } else if (b.isArchived) {
      return -1
    } else {
      return 1
    }
  }

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white", padding: "pt-1 px-1 pb-24", overflow: "overflow-visible"}}>
            <NewAccount
              account={pageData.newAccount}
              fns={newFormFns}
              isFormShown={showFormForId === "new"}
              onSubmit={submitNewAccount}
              update={updateNewAccount}
            />
            {accounts.sort(sortFn).map(account => (
              <Account
                key={account.id}
                account={account}
                fns={accountFns}
                queryParams={queryParams}
              />
            ))}
            <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible", wrap: "flex-wrap"}}>
              <ToggleArchivedLink includesArchived={props.includesArchived} />
            </StripedRow>
          </Row>
        </div>
      </div>
    </div>
  )
}

const Account = ({ fns, ...props }) => {
  const { id, archivedAt, name } = props.account
  const { closeForm, isFormShown, openForm } = fns
  if (isFormShown(id)) {
    const [account, updateAccount] = useState({
      ...props.account,
      isNew: false,
      updatedAttributes: {},
    })
    const onSubmit = () => Inertia.put(`/accounts/${id}${props.queryParams}`,
      { account: requestBody(account.updatedAttributes) },
      { onSuccess: closeForm }
    )
    const update = payload => updateAccount({
      ...account,
      updatedAttributes: {
        ...account.updatedAttributes,
        ...payload
      },
    })
    return (
      <Form
        account={account}
        closeForm={closeForm}
        onSubmit={onSubmit}
        update={update}
      />
    )
  } else {
    const deleteAccount = () => {
      const isConfirmed = window.confirm(`Are you sure you want to delete ${name}?`)
      if (isConfirmed) {
        Inertia.delete(`/accounts/${id}${props.queryParams}`)
      }
    }
    const restoreAccount = () => {
      const body = { archivedAt: null }
      Inertia.put(`/accounts/${id}${props.queryParams}`, { account: body })
    }
    const deleteOrRestoreAccount = () => archivedAt ? restoreAccount() : deleteAccount()
    const openForm = () => fns.openForm(id)
    return (
      <Show account={props.account} openForm={openForm} deleteOrRestoreAccount={deleteOrRestoreAccount} />
    )
  }
}

const NewAccount = ({ account, fns, icons, isFormShown, update, onSubmit }) => {
  const { closeForm, renderForm } = fns
  if (isFormShown) {
    return (
      <Form account={account} closeForm={closeForm} icons={icons} update={update} onSubmit={onSubmit} />
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
}

const ToggleArchivedLink = ({ includesArchived }) => {
  const href = `/accounts/admin${includesArchived ? "" : "?include_archived=true"}`
  const copy = `${includesArchived ? "Exclude" : "Include"} Archived Accounts`

  return (
    <InertiaLink href={href} color="text-blue-700" classes={["italics"]}>
      &#8226;
      {" "}
      {copy}
    </InertiaLink>
  )
}

export default App;
