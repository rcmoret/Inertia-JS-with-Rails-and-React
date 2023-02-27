import React from "react";

import Row from "../shared/Row";
import Cell from "../shared/Cell";

export const AccountRow = ({ children }) => (
  <Row>
    <Cell styling={{width: "w-full", "md:width": "md:w-3/12"}}>
      {children}
    </Cell>
  </Row>
);

export const AccountCell = ({ children }) => (
  <div className="w-6/12">{children}</div>
);
