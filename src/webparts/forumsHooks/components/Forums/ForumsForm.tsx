
import * as React from 'react'
import { useState } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Forums.module.scss'
import ConfirmDelete from '../shared/ConfirmDelete';
import { Actions } from '../../helpers/constants';
import { IForumsFormProp } from '../../helpers/interfaces';

const stackTokens: IStackTokens = { childrenGap: 15 }

const ForumsForm: React.FC<IForumsFormProp> = ({ action, formState = {}, handleSubmit, handleClose }) => {
    const { state = {}, handleChange, handleChecked } = formState
    const { title, description, deleted } = state

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const onSave = () => {
        setError('')

        if (!title.trim()) {
            setError(strings.TitleRequired)
            return
        }

        if (!description.trim()) {
            setError(strings.DescriptionRequired)
            return
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
                    label={strings.ForumName}
                    name="title"
                    value={title}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label={strings.ForumDescription}
                    name="description"
                    value={description}
                    onChange={handleChange}
                    required
                />
                {
                    action === Actions.Update && <Checkbox
                        label={strings.Delete}
                        name="deleted"
                        value={deleted}
                        onChange={handleChecked}
                    />
                }
            </Stack>
            <br />
            <Stack horizontal tokens={stackTokens}>
                <PrimaryButton text={strings.Save} onClick={onSave} />
                <DefaultButton text={strings.Cancel} onClick={handleClose} />
            </Stack>
            {
                isOpen && <ConfirmDelete
                    title={`${strings.ConfirmDelete} ${strings.Forum}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default ForumsForm