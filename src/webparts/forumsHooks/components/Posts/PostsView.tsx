import * as React from 'react'
import { useEffect, useRef, useState, useReducer } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { PrimaryButton } from 'office-ui-fabric-react'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Posts.module.scss'
import { fh_forums, fh_topics, fh_posts } from '../../helpers/constants';
import { getDetailError } from '../../helpers/functions';
import Posts from './Posts';
import Navigation from '../shared/Navigation';
import postsReducer from '../../../../Reducers/postReducer';
import { useListsService, useDispatch } from '../../../../Hooks'

interface IPostsView {
    location: any
    match: any
}

const PostsView: React.FC<IPostsView> = ({ match: { params: { fid, tid } } }) => {
    const [state, dispatch] = useReducer(postsReducer, [])

    const { data: forum, getlistItem: getForumListItem } = useListsService(fh_forums)
    const { data: topic, getlistItem: getTopicListItem, updateListItem: updateTopicListItem } = useListsService(fh_topics)
    const { data: fetchedPosts, loading, error, getListItems, updateListItem: updatePostListItem, addPost, deletePost }
        = useListsService(fh_posts)
    const { data: newPosts, getListItems: getNewListItems } = useListsService(fh_posts)

    const limit = 3
    const [viewMore, setViewMore] = useState(true)
    const [newPostsCount, setNewPostsCount] = useState(0)

    const lastPostIdRef = useRef(0)
    const topicDispatch = useDispatch()

    const forumId = +fid
    const forumName = forum.length > 0 ? forum[0].Title : ''
    const topicId = +tid
    const topicName = topic.length > 0 ? topic[0].Title : ''

    const filter = `TopicId eq ${topicId} and Id gt ${lastPostIdRef.current}`

    useEffect(() => getForumListItem(forumId), [forumId, getForumListItem])
    useEffect(() => getTopicListItem(topicId), [topicId, getTopicListItem])
    useEffect(() => getListItems(fh_posts, filter, limit), [getListItems])

    useEffect(() => {
        dispatch({ type: 'LOAD_POSTS', payload: fetchedPosts })

        if (fetchedPosts.length > 0) {
            const lastId = fetchedPosts.slice(-1).pop().Id;
            if (fetchedPosts.length < limit) {
                lastPostIdRef.current = lastId
                setViewMore(false)
            } else {
                lastPostIdRef.current = lastId
            }
        }

        if (fetchedPosts.length === 0 && lastPostIdRef.current > 0) {
            setViewMore(false)
        }
    }, [fetchedPosts, dispatch])

    useEffect(() => {
        if (topic.length > 0) {
            updateTopicListItem({ Id: topicId, Views: topic[0].Views + 1 })
        }
    }, [topic, updateTopicListItem])

    useEffect(() => {
        if (topic.length > 0) {
            topicDispatch({ type: 'UPDATE_TOPIC', payload: topic })
        }
    }, [topic, topicDispatch])

    useEffect(() => {
        let interval
        if (!viewMore) {
            interval = setInterval(() => {
                getNewListItems(fh_posts, `TopicId eq ${topicId} and Id gt ${lastPostIdRef.current}`)
            }, 10000)
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        }
    }, [viewMore, getNewListItems])

    useEffect(() => {
        setNewPostsCount(newPosts.length)
    }, [newPosts])

    const onNewPosts = () => {
        dispatch({ type: 'LOAD_POSTS', payload: newPosts })
        lastPostIdRef.current = newPosts.slice(-1).pop().Id;
        setNewPostsCount(0)
    }

    const onLoadMore = () => getListItems(fh_posts, filter, limit)

    if (error) {
        return <div className={styles.error}>{getDetailError(error)}</div>
    }

    return (
        <div className={styles.posts}>
            <Navigation forumName={forumName} forumId={forumId} topicName={topicName} />
            {loading && <Spinner size={SpinnerSize.large} label={strings.Wait} />}
            {newPostsCount > 0 &&
                <div className={styles.loadMore}>
                    <PrimaryButton text={`${newPostsCount} ${strings.NewPosts}`} onClick={onNewPosts} />
                </div>
            }
            <Posts
                forumId={forumId}
                topicId={topicId}
                topicName={topicName}
                limit={limit}
                filter={filter}
                dispatch={dispatch}
                state={state}
                addPost={addPost}
                updateListItem={updatePostListItem}
                deletePost={deletePost}
            />
            {
                viewMore && !loading && lastPostIdRef.current > 0 &&
                < div className={styles.loadMore}>
                    <PrimaryButton text={strings.LoadMore} onClick={onLoadMore} />
                </div>
            }
        </div >
    )
}

export default PostsView