import React from "react";
import MoneyFormatter from "../../lib/MoneyFormatter";

const defaultProps = {
  absolute: false,
  amount: 0,
  decorate: true,
  color: 'text-black',
  classes: [],
  negativeColor: 'text-red-600',
}

const AmountSpan = suppliedProps => {
  const props = { ...defaultProps, ...suppliedProps }
  const { absolute, amount, classes, color, decorate, negativeColor } = props

  const textColor = amount < 0 ? negativeColor : color
  const className = [textColor, ...classes].join(' ')

  return (
    <span className={className}>{MoneyFormatter(amount, { absolute, decorate })}</span>
  )
}

export default AmountSpan;
