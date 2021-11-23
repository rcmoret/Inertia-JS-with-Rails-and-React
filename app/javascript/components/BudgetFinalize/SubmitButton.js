import React, { useState } from "react";
import Button, { DisabledButton } from "../shared/Button";

import { finalize as copy } from "../../lib/copy/budget";

const Wrapper = ({ children }) => (
  <div className="flex justify-between flex-row-reverse p-2 rounded">
    <div className="bg-white rounded p-2">
      {children}
    </div>
  </div>
)

const SubmitButton = ({ isEnabled, onSubmit }) => {
  if (isEnabled) {
    return (
      <Button onSubmit={onSubmit} bgColor="bg-green-400" hoverBgColor="hover:bg-green-400">
        {copy.submitText}
      </Button>
    )
  } else {
    return (
      <DisabledButton>
        {copy.submitText}
      </DisabledButton>
    )
  }
}

export default ({ isEnabled, onSubmit }) => (
  <Wrapper>
    <SubmitButton isEnabled={isEnabled} onSubmit={onSubmit} />
  </Wrapper>
)
