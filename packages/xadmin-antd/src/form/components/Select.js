import React from 'react'
import { Select } from 'antd'
import { t } from 'xadmin-i18n'
const Option = Select.Option

export default ({ input, label, field }) => {
  return (
    <Select style={{ minWidth: 150 }} placeholder={label} {...input}>
      {[ ...field.titleMap ].map(option => { return (<Option key={option.value} value={option.value}>{option.name}</Option>) })}
    </Select>
  )
}