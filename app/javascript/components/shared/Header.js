// import React, { useState } from "react";
import React from "react";

import { Inertia } from "@inertiajs/inertia";

import Cell from "./Cell"
import Link from "./Link"
import Row from "./Row"

const Header = ({ namespace, month, year }) => {
  const bgColor = "bg-gray-200"
  const selectedBgColor = "bg-blue-200"
  const accountsBgColor = namespace === "accounts" ? selectedBgColor : bgColor
  const budgetBgColor = namespace === "budget" ? selectedBgColor : bgColor
  const onClick = () => Inertia.get("/budget")

  return (
    <Row styling={{bgColor: "bg-blue-900", padding: "p-2", margin: "mb-2"}}>
      <Row styling={{bgColor: "bg-white"}}>
        <Cell styling={{width: "w-6/12", fontSize: "text-3xl", textAlign: "text-center"}}>
          <Link onClick={() => null} classes={["w-full"]}>
            <div className={`w-full ${accountsBgColor} rounded pt-4 pb-4`}>
              <h2>Accounts</h2>
            </div>
          </Link>
        </Cell>
        <Cell styling={{width: "w-6/12", fontSize: "text-3xl", textAlign: "text-center"}}>
          <Link onClick={onClick} classes={["w-full"]}>
            <div className={`w-full ${budgetBgColor} rounded pt-4 pb-4`}>
              <h2>Budget</h2>
            </div>
          </Link>
        </Cell>
      </Row>
    </Row>
  )
};

export default Header;
