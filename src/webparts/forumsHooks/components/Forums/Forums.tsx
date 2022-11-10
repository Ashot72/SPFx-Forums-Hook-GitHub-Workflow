import * as React from 'react'
import { useState } from 'react';
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Forums.module.scss'
import { IForum } from '../../../../Reducers/reducers';
import { Actions } from '../../helpers/constants';
import SidePanel from '../shared/SidePanel';
import ForumsForm from './ForumsForm';
import Forum from './Forum';
import { useForumsState, useDispatch, useFormState } from '../../../../Hooks'

interface IForums {
    updateListItem: (item: any) => void
    deleteForum: (forumId: number) => void
}

const Forums: React.FC<IForums> = ({ updateListItem, deleteForum }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({})
    const forums: IForum[] = useForumsState()

    const dispatch = useDispatch()
    const formState = useFormState(formData)

    const editForum = (forum: IForum) => {
        const { Id, Title, Description } = forums.find(f => f.Id === forum.Id)

        const updatedFormData = {
            id: Id,
            title: Title,
            description: Description
        }
        setFormData(updatedFormData)
        setIsOpen(true)
    }

    const handleSubmit = () => {
        const { id, title, description, deleted } = formState.state

        const forum: Partial<IForum> = {
            Id: id,
            Title: title,
            Description: description
        }

        if (deleted) {
            deleteForum(forum.Id)
            dispatch({ type: 'DELETE_FORUM', payload: forum })
        } else {
            updateListItem(forum)
            dispatch({ type: 'UPDATE_FORUM', payload: forum })
        }

        setFormData(formState.state)
        setIsOpen(false)
    }

    return (
        <>
            <div className={styles.headerContainer}>
                <div className={`ms-Grid-row ${styles.header}`}>
                    <div className="ms-Grid-col ms-sm5">{strings.Name}</div>
                    <div className="ms-Grid-col ms-sm2">{strings.TopicsPosts}</div>
                    <div className="ms-Grid-col ms-sm4">{strings.LastPost}</div>
                    <div className="ms-Grid-col ms-sm1">&nbsp;</div>
                </div>
            </div>
            {
                forums.map((forum: IForum) =>
                    <div className={`ms-Grid-row ${styles.row}`} key={forum.Id}>
                        <Forum
                            forum={forum}
                            editForum={editForum}
                        />
                    </div>
                )
            }
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <ForumsForm
                    action={Actions.Update}
                    formState={formState}
                    handleSubmit={handleSubmit}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </>
    )
}

export default Forums