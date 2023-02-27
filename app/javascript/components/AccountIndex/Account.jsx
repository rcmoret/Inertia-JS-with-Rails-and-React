import React, { useState } from "react";

import { Inertia } from "@inertiajs/inertia";

import Form from "./Form"
import Show from "./Show"

export const Account = ({ fns, ...props }) => {
  const { closeForm, isFormShown, openForm, queryParams } = props
  const { slug, archivedAt, name } = props.account
  if (isFormShown) {
    const [account, updateAccount] = useState({
      ...props.account,
      isNew: false,
      updatedAttributes: {},
    })
    const onSubmit = () => Inertia.put(`/accounts/${slug}${queryParams}`,
      { account: account.updatedAttributes },
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
        Inertia.delete(`/accounts/${slug}${props.queryParams}`)
      }
    }
    const restoreAccount = () => {
      const body = { archivedAt: null }
      Inertia.put(`/accounts/${slug}${props.queryParams}`, { account: body })
    }
    const deleteOrRestoreAccount = () => archivedAt ? restoreAccount() : deleteAccount()
    return (
      <Show account={props.account} openForm={openForm} deleteOrRestoreAccount={deleteOrRestoreAccount} />
    )
  }
};
