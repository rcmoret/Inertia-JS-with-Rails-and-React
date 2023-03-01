import React, { useState } from "react";

import { router } from "@inertiajs/react";

import Form from "./Form"
import Show from "./Show"

export const Account = ({ fns, ...props }) => {
  const { closeForm, isFormShown, openForm, queryParams } = props
  const { slug, archivedAt, name } = props.account

  const [account, update] = useState({
    attributeErrors: {},
    notice: { level: "info", message: "" },
    updatedAttributes: {},
    ...props.account,
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
    router.put(`/accounts/admin${queryParams}`,
      { account: account.updatedAttributes, slug: props.account.slug },
      { onSuccess: closeForm }
    )
    // router.put(
    //   `/accounts/admin${queryParams}`,
    //   { account: account.updatedAttributes, slug: props.account.slug },
    //   { onSuccess: closeForm }
    // )
  }

  if (isFormShown(account)) {
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
        router.delete(`/accounts/${slug}${props.queryParams}`)
      }
    }
    const restoreAccount = () => {
      const body = { archivedAt: null }
      router.put(`/accounts/${slug}${props.queryParams}`, { account: body })
    }
    const deleteOrRestoreAccount = () => archivedAt ? restoreAccount() : deleteAccount()
    return (
      <Show account={props.account} openForm={openForm} deleteOrRestoreAccount={deleteOrRestoreAccount} />
    )
  }
};
