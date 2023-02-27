import React from "react";

import Cell from "../shared/Cell";
import Row from "../shared/Row";

export const AccountRow = ({ children }) => (
  <Row>
    <Cell styling={{width: "w-full", "sm:width": "sm:w-6/12", wrap: "flex-wrap"}}>
      {children}
    </Cell>
  </Row>
);

export const AccountLabel = ({ children }) => (
  <div className="w-full sm:w-7/12">{children}</div>
);

export const AccountValue = ({ children }) => (
  <div className="w-full sm:w-5/12 pl-2">
    {children}
  </div>
);
