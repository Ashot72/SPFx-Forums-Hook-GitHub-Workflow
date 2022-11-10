import * as React from 'react'
import { Link } from "react-router-dom"
import { WebPartContext } from '@microsoft/sp-webpart-base';
import Moment from 'react-moment'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Posts.module.scss'
import { localeForDate } from '../../helpers/functions';
import { dateFormat } from '../../helpers/constants';
import { IPost } from '../../../../Reducers/postReducer';
import { useContext, useCurrentUser } from '../../../../Hooks'

interface IPostsItem {
    index: number
    firstPost: IPost
    post: IPost
    editPost: (index: number, post: IPost) => void
    replyPost: (post: IPost) => void
    markAnswered: (post: IPost) => void
}

const PostsItem: React.FC<IPostsItem> = ({ index, firstPost, post, editPost, replyPost, markAnswered }) => {
    const context: WebPartContext = useContext()
    const user = useCurrentUser()

    return (
        <div className={styles.item}>
            <div>{strings.By} <i>{post.PosterName}</i></div>
            <div>{post.PosterEmail}</div>
            <span className={styles.date}>
                <Moment locale={localeForDate(context)} format={dateFormat}>
                    {post.CreatedDate}
                </Moment>
            </span>
            <br />
            <div>
                <b>{post.Title}</b>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.Content.split("\n").join("<br />") }} />
            <div className={styles.icons}>
                <>
                    {
                        ((user && user.IsSiteAdmin) || firstPost.PosterName === user.Title)
                            ? <Icon
                                iconName={post.Answered ? 'CompletedSolid' : 'Completed'}
                                className={styles.icon}
                                title={post.Answered ? strings.NotAnswered : strings.Answered}
                                onClick={() => markAnswered(post)}
                            />
                            : <Icon
                                iconName={post.Answered ? 'CompletedSolid' : 'Completed'}
                                className={styles.icon}
                                style={{ cursor: "not-allowed" }}
                                title={post.Answered ? strings.NotAnswered : strings.Answered}
                            />
                    }
                    {
                        ((user && user.IsSiteAdmin) || post.PosterName === user.Title) &&

                        <Icon
                            iconName='Edit'
                            className={styles.icon}
                            title={strings.EditPost}
                            onClick={() => editPost(index, post)}
                        />
                    }
                </>
                <Icon
                    iconName='DocumentReply'
                    className={styles.icon}
                    title={strings.ReplyPost}
                    onClick={() => replyPost(post)}
                />
            </div>
            <hr />
        </div>
    )

}

export default PostsItem