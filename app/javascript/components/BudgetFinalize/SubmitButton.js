import React, { useState } from "react";
import Button from "../shared/Button";

export default ({ onSubmit }) => (
  <div className='flex justify-between flex-row-reverse p-2 rounded'>
    <div className='bg-white rounded p-2'>
      <Button bgColor='bg-green-600' hoverBgColor='hover:bg-green-700' onSubmit={onSubmit}>
        Finalize/Rollover
      </Button>
    </div>
  </div>
)
