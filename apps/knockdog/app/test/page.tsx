import React from 'react'
import { RadioGroup, RadioGroupItem } from '@knockdog/ui'

export default function Page() {
  return (
    <div className='flex flex-col gap-y-2 p-4'>
      <RadioGroup >
        <RadioGroupItem  value='1'>1</RadioGroupItem>
        <RadioGroupItem value='2'>2</RadioGroupItem>
        <RadioGroupItem value='3'>3</RadioGroupItem>
      </RadioGroup>
    </div>
  )
}