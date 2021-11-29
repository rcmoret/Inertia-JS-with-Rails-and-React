import React from "react";
import MoneyFormatter from "../../lib/MoneyFormatter";


const AmountSpan = suppliedProps => {
  const defaultProps = {
    absolute: false,
    amount: 0,
    decorate: true,
    color: "text-black",
    classes: [],
    prefix: null,
  }

  const props = { ...defaultProps, ...suppliedProps }
  const { absolute, amount, classes, color, decorate, prefix } = props
  const zeroColor = props.zeroColor || color
  const negativeColor = props.negativeColor || color

  const textColor = () => {
    if (amount === 0) {
      return zeroColor
    } else if (amount > 0) {
      return color
    } else {
      return negativeColor
    }
  }
  const className = [textColor(), ...classes].join(' ')

  return (
    <span className={className}>
      {prefix && `${prefix} `}
      {MoneyFormatter(amount, { absolute, decorate })}
    </span>
  )
}

export default AmountSpan;
