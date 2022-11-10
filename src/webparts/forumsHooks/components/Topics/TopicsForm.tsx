
import * as React from 'react'
import { useState } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Topics.module.scss'
import ConfirmDelete from '../shared/ConfirmDelete';
import { Actions } from '../../helpers/constants';
import { IForumsFormProp } from '../../helpers/interfaces';
import { DateFields, DayField, MonthField, YearField } from '../shared/DateFields';

const stackTokens: IStackTokens = { childrenGap: 15 }

const TopicsForm: React.FC<IForumsFormProp> = ({ action, formState = {}, handleSubmit, handleClose }) => {
    const { state = {}, handleChange, handleChecked, handleCustom } = formState
    const { title, message, expirationDate, deleted } = state

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const onSave = () => {
        setError('')

        if (!title.trim()) {
            setError(strings.SubjectRequired)
            return
        }

        if (action === Actions.AddOrReply) {
            if (!message.trim()) {
                setError(strings.MessageRequired)
                return
            }
        }

        deleted
            ? setIsOpen(true)
            : handleSubmit()
    }

    const onDelete = (shouldDelete: boolean) => {
        setIsOpen(false)

        if (shouldDelete) {
            handleSubmit()
        }
    }

    return (
        <>
            {error && <div className={styles.error}>{error}</div>}
            <span className={styles.header}>{action === Actions.AddOrReply ? strings.Add : strings.Update}</span>
            <Stack tokens={stackTokens}>
                <TextField
                    label={strings.TopicName}
                    name="title"
                    value={title}
                    onChange={handleChange}
                    required
                />
                {
                    action === Actions.AddOrReply && <TextField
                        label={strings.TopicMessage}
                        rows={8}
                        multiline
                        name="message"
                        value={message}
                        onChange={handleChange}
                        required
                    />
                }
                {
                    action === Actions.Update && <Checkbox
                        label={strings.Delete}
                        name="deleted"
                        value={deleted}
                        onChange={handleChecked}
                    />
                }
                <DateFields
                    date={expirationDate}
                    onChange={date => handleCustom('expirationDate', date)}>
                    <div>{strings.ExpirationDate}</div>
                    <div className={styles.dateContainer}>
                        <div className={styles.dateField}>{strings.Day}: </div><DayField />
                        <div className={styles.dateField}>{strings.Month}: </div><MonthField />
                        <div className={styles.dateField}>{strings.Year}: </div><YearField start={2021} end={2040} />
                    </div>
                </DateFields>

            </Stack>
            <br />
            <Stack horizontal tokens={stackTokens}>
                <PrimaryButton text={strings.Save} onClick={onSave} />
                <DefaultButton text={strings.Cancel} onClick={handleClose} />
            </Stack>
            {
                isOpen && <ConfirmDelete
                    title={`${strings.ConfirmDelete} ${strings.Topic}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default TopicsForm
