import * as React from 'react'
import { useState } from 'react';

import styles from './Posts.module.scss'
import { Actions } from '../../helpers/constants';
import { IPost } from '../../../../Reducers/postReducer';
import SidePanel from '../shared/SidePanel';
import PostsForm from './PostForm';
import Post from './Post';
import { useFormState, useCurrentUser } from '../../../../Hooks'

interface IPosts {
    forumId: number,
    topicId: number,
    topicName: string,
    limit: number,
    filter: string,
    state: any
    dispatch: any //change
    addPost: (post: Partial<IPost>, filter: string, limit: number) => void
    updateListItem: (item: any) => void
    deletePost: (post: Partial<IPost>) => void
}

const Posts: React.FC<IPosts> = ({ forumId, topicId, filter, topicName, limit, state, dispatch, addPost, updateListItem, deletePost }) => {
    const posts: IPost[] = state

    const [isOpen, setIsOpen] = useState(false)
    const [action, setAction] = useState(Actions.AddOrReply)
    const [formData, setFormData] = useState({})

    const formState = useFormState(formData)
    const user = useCurrentUser()

    const markAnswered = (post: IPost) => {
        post.Answered = !post.Answered
        updateListItem({ Id: post.Id, Answered: post.Answered })
        dispatch({ type: 'UPDATE_POST', payload: post })
    }

    const editPost = (index: number, post: IPost) => {
        const { Id, Title, Content } = posts.find(p => p.Id === post.Id)

        const updatedFormData = {
            id: Id,
            title: Title,
            content: Content,
            index
        }

        setFormData(updatedFormData)
        setAction(Actions.Update)
        setIsOpen(true)
    }

    const replyPost = (post: IPost) => {
        const { Title } = posts.find(p => p.Id === post.Id)
        const data = { title: Title, content: '' }

        setFormData(data)
        setAction(Actions.AddOrReply)
        setIsOpen(true)
    }

    const handleAdd = () => {
        const { title, content } = formState.state
        const { Title, Email } = user

        const post: Partial<IPost> = {
            Title: title,
            Content: content,
            ForumId: forumId,
            TopicId: topicId,
            PosterName: Title,
            PosterEmail: Email,
            Answered: false,
            CreatedDate: new Date().getTime()
        }

        addPost(post, filter, limit)
        setIsOpen(false)
    }

    const handleUpdateOrDelete = () => {
        const { id, title, content, deleted } = formState.state

        const post: Partial<IPost> = {
            Id: id,
            ForumId: forumId,
            TopicId: topicId,
            Title: title,
            Content: content
        }

        if (deleted) {
            deletePost(post)
            dispatch({ type: 'DELETE_POST', payload: post })
        } else {
            updateListItem(post)
            dispatch({ type: 'UPDATE_POST', payload: post })
        }

        setFormData(formState.state)
        setIsOpen(false)
    }

    const handleSubmit = () => action === Actions.AddOrReply ? handleAdd() : handleUpdateOrDelete()

    return (
        <>
            {
                posts.length > 0 &&
                <div className={styles.headerContainer}>
                    <div className={`ms-Grid-row ${styles.header}`}>
                        <div className="ms-Grid-col ms-sm12">{topicName}</div>
                    </div>
                </div>
            }
            {
                posts.map((post: IPost, index: number) =>
                    <div key={post.Id}>
                        <Post
                            index={index}
                            firstPost={posts[0]}
                            post={post}
                            editPost={editPost}
                            replyPost={replyPost}
                            markAnswered={markAnswered}
                        />
                    </div>
                )
            }
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <PostsForm
                    action={action}
                    formState={formState}
                    handleSubmit={handleSubmit}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </>
    )
}

export default Posts