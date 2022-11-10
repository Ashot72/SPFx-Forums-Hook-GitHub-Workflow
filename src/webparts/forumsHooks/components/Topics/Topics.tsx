import * as React from 'react'
import { useState } from 'react';
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Topics.module.scss'
import { ITopic } from '../../../../Reducers/reducers';
import { Actions } from '../../helpers/constants';
import SidePanel from '../shared/SidePanel';
import TopicsForm from './TopicsForm';
import Topic from './Topic';
import { useTopicsState, useDispatch, useFormState } from '../../../../Hooks'

interface ITopics {
    forumId: number
    updateListItem: (item: any) => void
    deleteTopic: (topic: Partial<ITopic>) => void
}

const Topics: React.FC<ITopics> = ({ forumId, updateListItem, deleteTopic }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({})
    const topics: ITopic[] = useTopicsState()

    const dispatch = useDispatch()
    const formState = useFormState(formData)

    const editTopic = (topic: ITopic) => {
        const { Id, Title, Message, ExpirationDate } = topics.find(t => t.Id === topic.Id)

        const updatedFormData = {
            id: Id,
            title: Title,
            message: Message,
            expirationDate: new Date(ExpirationDate)
        }

        setFormData(updatedFormData)
        setIsOpen(true)
    }

    const handleSubmit = () => {
        const { id, title, message, expirationDate, deleted } = formState.state

        const topic: Partial<ITopic> = {
            Id: id,
            ForumId: forumId,
            Title: title,
            ExpirationDate: expirationDate.getTime()
        }

        if (Actions.AddOrReply) {
            topic.Message = message
        }

        if (deleted) {
            deleteTopic(topic)
            dispatch({ type: 'DELETE_TOPIC', payload: topic })
        } else {
            updateListItem(topic)
            const expired: boolean = expirationDate - new Date().getTime() < 0
            dispatch({ type: expired ? 'DELETE_TOPIC' : 'UPDATE_TOPIC', payload: topic })
        }

        setFormData(formState.state)
        setIsOpen(false)
    }

    return (
        <>
            <div className={styles.headerContainer}>
                <div className={`ms-Grid-row ${styles.header}`}>
                    <div className="ms-Grid-col ms-sm5">{strings.Name}</div>
                    <div className="ms-Grid-col ms-sm2">{strings.RepliesViews}</div>
                    <div className="ms-Grid-col ms-sm4">{strings.LastPost}</div>
                    <div className="ms-Grid-col ms-sm1">&nbsp;</div>
                </div>
            </div>
            {
                topics.map((topic: ITopic) =>
                    <div className={`ms-Grid-row ${styles.row}`} key={topic.Id}>
                        <Topic
                            topic={topic}
                            editTopic={editTopic}
                        />
                    </div>
                )
            }
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <TopicsForm
                    action={Actions.Update}
                    formState={formState}
                    handleSubmit={handleSubmit}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </>
    )
}

export default Topics