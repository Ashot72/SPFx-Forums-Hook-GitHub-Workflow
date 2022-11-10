import * as React from 'react'
import { Link } from "react-router-dom"
import { WebPartContext } from '@microsoft/sp-webpart-base';
import Moment from 'react-moment'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Topics.module.scss'
import { localeForDate } from '../../helpers/functions';
import { dateFormat } from '../../helpers/constants';
import { ITopic } from '../../../../Reducers/reducers';
import { useContext, useCurrentUser } from '../../../../Hooks'

interface ITopicsItem {
    topic: ITopic
    editTopic: (topic: ITopic) => void
}

const TopicsItem: React.FC<ITopicsItem> = ({ topic, editTopic }) => {
    const context: WebPartContext = useContext()
    const user = useCurrentUser()

    return (
        <>
            <div className="ms-Grid-col ms-sm5">
                <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Title}</Link>
                <div>{topic.Message}</div>
                <div>{strings.By} {topic.CreatorName}</div>
                <div>
                    <Moment locale={localeForDate(context)} format={dateFormat}>
                        {topic.CreatedDate}
                    </Moment>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm2">
                <div>
                    {strings.Replies}:{' '}
                    <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Replies}</Link>
                </div>
                <div>
                    {strings.Views}:{' '}
                    <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Views}</Link>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm4">
                {topic.LastPosterName && <div>{strings.By} {topic.LastPosterName} </div>}
                {topic.LastUpdate > 0 &&
                    <div>
                        <Moment locale={localeForDate(context)} format={dateFormat}>
                            {topic.LastUpdate}
                        </Moment>
                    </div>
                }
            </div>
            <div className="ms-Grid-col ms-sm1">
                {
                    ((user && user.IsSiteAdmin) || (user.Title === topic.CreatorName)) &&
                    <Icon
                        iconName='Edit'
                        className={styles.icon}
                        title={strings.EditTopic}
                        onClick={() => editTopic(topic)}
                    />
                }
            </div>
        </>
    )
}

export default TopicsItem