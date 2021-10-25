import React, { useState } from "react";
import AmountSpan from "../shared/AmountSpan";

export default ({ dateString, discretionary, extraBalance, rolloverItemName, totalExtra}) => (
  <div className='w-3/10 mb-4 rounded z-50'>
    <div className='bg-blue-900 p-2 rounded'>
      <div className='bg-white p-4 rounded shadow-lg'>
        <div className='border-b-2 border-blue-900 border-solid flex justify-between text-2xl'>
          <div>Finalize</div>
          <div>{dateString}</div>
        </div>
        <div className='w-full text-xl flex space-between flex-wrap'>
          <div className='w-1/2'>Disrectionary:</div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={discretionary * -1} />
          </div>
          <div className='w-1/2'>Extra From Items:</div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={extraBalance * -1} />
          </div>
          <div className='w-1/2'>Total toward <span className="underline">{rolloverItemName}</span></div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={totalExtra * -1} />
          </div>
        </div>
      </div>
    </div>
  </div>
);
