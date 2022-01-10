import React, { useState} from "react";

import Select from "react-select";

import Icon from "./Icons"
import Link, { InertiaLink } from "./Link";
import Row from "./Row"
import TextInput from "./TextInput";

import DateFormatter, { monthOptions } from "../../lib/DateFormatter";

export default props => {
  const [state, updateState] = useState({ isFormShown: false, ...props })
  const { baseUrl, isFormShown, month, year } = state
  const update = payload => updateState({ ...state, ...payload })

  const toggleForm = () => update({ isFormShown: !isFormShown })

  return (
    <div>
      <Link color="text-blue-700" onClick={toggleForm}>
        <Icon className="fas fa-calendar" />
      </Link>
      {isFormShown && <Form baseUrl={baseUrl} month={month} update={update} year={year} />}
    </div>
  )
}

const Form = ({ baseUrl, month, update, year }) => {
  const handleInputChange = event => update({ [event.target.name]: event.target.value })
  const handleSelectChange= event => update({  month: event.value })
  const options = monthOptions({ includeNullOption: false })
  const value = options.find(option => option.value === month)
  const href = `${baseUrl}/${month}/${year}`

  return (
    <Row styling={{wrap: "flex-wrap", overflow: "overflow-visible"}}>
      <div className="w-7/12">
        <Select
          onChange={handleSelectChange}
          options={options}
          value={value}
        />
      </div>
      <div className="w-4/12">
        <input
          type="number"
          name="year"
          className="rounded border border-solid border-gray-800 w-full p-1 text-right"
          onChange={handleInputChange}
          value={year}
        />
      </div>
      <InertiaLink color="text-blue-700" href={href}>
        Jump to {DateFormatter({ month, year, day: 1, format: "shortMonthYear" })}
        {" "}
        <Icon className="fas fa-arrow-right" />
      </InertiaLink>
    </Row>
  )
}
