import * as React from 'react'
import { useEffect, useState } from 'react';
import { Link, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Topics.module.scss'
import { fh_topics, Actions, fh_forums } from '../../helpers/constants';
import { getDetailError } from '../../helpers/functions';
import Topics from './Topics';
import SidePanel from '../shared/SidePanel';
import TopicsForm from './TopicsForm';
import { ITopic } from '../../../../Reducers/reducers';
import { IPost } from '../../../../Reducers/postReducer';
import Navigation from '../shared/Navigation';
import { useListsService, useFormState, useDispatch, useCurrentUser, useLinkState, useFormData } from '../../../../Hooks'

interface ITopicsView {
    location: any
    match: any
}

const TopicsView: React.FC<ITopicsView> = ({ location: { state }, match: { params: { fid } } }) => {
    const [isOpen, setIsOpen] = useState(false)
    const linkState = useLinkState(isOpen, state)

    const dispatch = useDispatch()
    const user = useCurrentUser()

    const data = { title: '', message: '', expirationDate: new Date("March 1, 2024") }
    const formData = useFormData(isOpen, data)
    const formState = useFormState(formData)

    const { data: forum, getlistItem } = useListsService(fh_forums)
    const { data: topics, loading, error, getListItems, updateListItem, deleteTopic, addTopic }
        = useListsService(fh_topics, linkState)

    const forumId = +fid
    const forumName = forum.length > 0 ? forum[0].Title : ''
    const filter = `ForumId eq ${forumId} and ExpirationDate ge ${new Date().getTime()}`

    useEffect(() => getlistItem(forumId), [forumId, getlistItem])
    useEffect(() => getListItems(fh_topics, filter), [getListItems])

    useEffect(() =>
        dispatch({ type: 'LOAD_TOPICS', payload: topics }),
        [topics, dispatch])

    const handleSubmit = () => {
        const { title, message, expirationDate } = formState.state
        const crreatedDate = new Date().getTime()
        const { Title, Email } = user

        const topic: ITopic = {
            Title: title,
            ForumId: forumId,
            CreatorName: Title,
            CreatorEmail: Email,
            LastPosterName: Title,
            LastPosterEmail: Email,
            LastUpdate: crreatedDate,
            Views: 0,
            Replies: 0,
            ExpirationDate: expirationDate.getTime(),
            CreatedDate: crreatedDate
        }

        const post: Partial<IPost> = {
            Title: title,
            ForumId: forumId,
            PosterName: Title,
            PosterEmail: Email,
            Content: message,
            Answered: false,
            CreatedDate: crreatedDate
        }

        addTopic(topic, post)
        setIsOpen(false)
    }

    if (error) {
        return <div className={styles.error}>{getDetailError(error)}</div>
    }

    return (
        <div className={styles.topics}>
            <Navigation forumName={forumName} />
            {loading && <Spinner size={SpinnerSize.large} label={strings.Wait} />}
            <Link onClick={() => setIsOpen(true)}>{strings.NewTopic}</Link><br />
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <TopicsForm
                    action={Actions.AddOrReply}
                    formState={formState}
                    handleSubmit={handleSubmit}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
            <Topics
                forumId={forumId}
                updateListItem={updateListItem}
                deleteTopic={deleteTopic}
            />
        </div>
    )
}

export default TopicsView