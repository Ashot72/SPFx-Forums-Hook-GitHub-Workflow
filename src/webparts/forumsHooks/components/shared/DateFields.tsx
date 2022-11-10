import * as React from 'react'
import { createContext, useContext } from "react"
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { daysInMonth } from '../../helpers/functions';

interface IDateFieldProp {
    date: Date,
    onChange: (date: Date) => void
}

const Context = createContext<IDateFieldProp>(undefined)

const dropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 90 } };

export const DateFields: React.FC<IDateFieldProp> = ({ date, onChange, children }) => {
    const context: IDateFieldProp = { date, onChange }
    return <Context.Provider value={context} children={children} />
}

export const DayField: React.FC = () => {
    const { date, onChange } = useContext(Context)
    const day = date.getDate()

    const month = date.getMonth()
    const year = date.getFullYear()
    const days = [...Array(daysInMonth(month, year)).keys()]

    const handleChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        const newDate = new Date(date.getTime())
        newDate.setDate(+item.key)
        onChange(newDate)
    }

    const getOptions = (): IDropdownOption[] => {
        const options: IDropdownOption[] = []

        days.map((_, index) => options.push({ key: index + 1, text: index < 9 ? `0${index + 1}` : `${index + 1}` }))
        return options
    }

    return (
        <Dropdown
            selectedKey={day}
            options={getOptions()}
            onChange={handleChange}
            styles={dropdownStyles}
        />
    )
}

export const MonthField: React.FC = () => {
    const { date, onChange } = useContext(Context)
    const month = date.getMonth()
    const months = [...Array(12).keys()]

    const handleChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        const newDate = new Date(date.getTime())
        newDate.setMonth(+item.key - 1)
        onChange(newDate)
    }

    const getOptions = (): IDropdownOption[] => {
        const options: IDropdownOption[] = []

        months.map((_, index) => options.push({ key: index + 1, text: index < 9 ? `0${index + 1}` : `${index + 1}` }))
        return options
    }

    return (
        <Dropdown
            selectedKey={month + 1}
            options={getOptions()}
            onChange={handleChange}
            styles={dropdownStyles}
        />
    )
}

interface YearFieldProp {
    start: number
    end: number
}

export const YearField: React.FC<YearFieldProp> = ({ start, end }) => {
    const { date, onChange } = useContext(Context)
    const year = date.getFullYear()
    const difference = end - start + 1
    const years = [...Array(difference).keys()]

    const handleChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        const newDate = new Date(date.getTime())
        newDate.setFullYear(+item.key)
        onChange(newDate)
    }

    const getOptions = (): IDropdownOption[] => {
        const options: IDropdownOption[] = []

        years.map((_, index) => options.push({ key: start + index, text: `${start + index}` }))
        return options
    }

    return (
        <Dropdown
            selectedKey={year}
            options={getOptions()}
            onChange={handleChange}
            styles={dropdownStyles}
        />
    )
}

