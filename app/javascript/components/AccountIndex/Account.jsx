import React, { useState } from "react";

import { router } from "@inertiajs/react";

import Form from "./Form"
import Show from "./Show"

export const Account = ({ fns, ...props }) => {
  const { isFormShown, openForm, url } = props
  const { slug, archivedAt, name } = props.account

  const [account, update] = useState({
    attributeErrors: {},
    notice: { level: "info", message: "" },
    updatedAttributes: {},
    ...props.account,
    key: props.account.slug
  })

  const updateAccount = payload => update({
    ...account,
    ...payload,
    updatedAttributes: {
      ...account.updatedAttributes,
      ...payload.updatedAttributes,
    }
  })

  const resetErrorMessage = () => updateAccount({ notice: { level: "info", message: "" } })
  const closeForm = () => {
    props.closeForm()
    resetErrorMessage()
  }

  const onSubmit = () => {
    router.put(url(),
       { account: account.updatedAttributes, slug: props.account.slug },
       { onSuccess: closeForm }
    )
  }

  if (isFormShown(account)) {
    return (
      <Form
        account={account}
        closeForm={closeForm}
        onSubmit={onSubmit}
        updateAccount={updateAccount}
        resetErrorMessage={resetErrorMessage}
      />
    )
  } else {
    return (
      <Show account={props.account} openForm={openForm} url={url} />
    )
  }
};
