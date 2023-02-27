import React from "react";

import { Inertia } from "@inertiajs/inertia";

import { sortByPriorty } from "../../lib/Functions";
import usePageData from "../../lib/usePageData";

import { Account } from "./Account"
import Form from "./Form"
import Icon from "../shared/Icons";
import Link, { InertiaLink } from "../shared/Link";
import PageHeader from "../shared/Header";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";

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
    showFormForSlug: null,
    newAccount,
  })
  const { showFormForSlug } = pageData
  const { accounts } = props
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
    { account: pageData.newAccount.updatedAttributes },
    { onSuccess: updatePageData({ ...pageData, newAccount }) },
  )
  const closeForm = () => updatePageData({ ...pageData, showFormForSlug: null })
  const openForm = slug => updatePageData({ ...pageData, showFormForSlug: slug })
  const newFormFns = {
    closeForm,
    renderForm: () => updatePageData({ ...pageData, showFormForSlug: "new" }),
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

  const makePutRequest = (slug) => {
    // look up account by slug and pass the updated attrs
    Inertia.put(
      `/accounts/${slug}${queryParams}`,
      { account: updatedAttributes },
      { onSuccess: closeForm }
    )
  }

  const makePostRequest = () => Inertia.post(
    `/accounts${queryParams}`,
    { account: pageData.newAccount.updatedAttributes },
    { onSuccess: updatePageData({ ...pageData, newAccount }) },
  )

  const archiveLinkHref = `/accounts/admin${includesArchived ? "" : "?include_archived=true"}`
  const archiveLinkCopy = `${includesArchived ? "Exclude" : "Include"} Archived Accounts`

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white", padding: "pt-1 px-1 pb-24", overflow: "overflow-visible"}}>
            <NewAccount
              account={pageData.newAccount}
              closeForm={closeForm}
              isFormShown={showFormForId === "new"}
              onSubmit={submitNewAccount}
              renderForm={renderNewForm}
              update={updateNewAccount}
            />
            {accounts.sort(sortFn).map(account => (
              <Account
                key={account.slug}
                isFormShown={showFormForSlug === account.slug}
                account={account}
                closeForm={closeForm}
                openForm={openForm}
                queryParams={queryParams}
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
