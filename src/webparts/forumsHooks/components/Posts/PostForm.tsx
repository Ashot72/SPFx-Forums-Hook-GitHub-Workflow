
import * as React from 'react'
import { useState } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Posts.module.scss'
import ConfirmDelete from '../shared/ConfirmDelete';
import { Actions } from '../../helpers/constants';
import { IForumsFormProp } from '../../helpers/interfaces';
import { useDebouncedUndo } from '../../../../Hooks'

const stackTokens: IStackTokens = { childrenGap: 15 }

const PostsForm: React.FC<IForumsFormProp> = ({ action, formState = {}, handleSubmit, handleClose }) => {
    const { state = {}, handleChange, handleChecked } = formState
    const { title, content, deleted, index } = state
    const [cnt, setContent, { undo, redo, canUndo, canRedo }] = useDebouncedUndo()

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const handleContent = (e: any) => {
        const value = e.target.value
        setContent(value)
        handleChange(e)
    }

    const onSave = () => {
        setError('')

        if (!title.trim()) {
            setError(strings.SubjectRequired)
            return
        }

        if (!content.trim()) {
            setError(strings.ContentRequired)
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
                    label={strings.PostName}
                    name="title"
                    value={title}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label={strings.PostContent}
                    rows={8}
                    multiline
                    name="content"
                    value={cnt || content}
                    onChange={e => handleContent(e)}
                    required
                />
                <Stack horizontal tokens={stackTokens} horizontalAlign="end">
                    <PrimaryButton text={strings.Undo} onClick={undo} disabled={!canUndo} />
                    <PrimaryButton text={strings.Redo} onClick={redo} disabled={!canRedo} />
                </Stack>
                {
                    action === Actions.Update && index > 0 && <Checkbox
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
                    title={`${strings.ConfirmDelete} ${strings.Post}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default PostsForm