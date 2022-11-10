import * as React from 'react'
import { Link } from "react-router-dom"
import { WebPartContext } from '@microsoft/sp-webpart-base';
import Moment from 'react-moment'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Forums.module.scss'
import { localeForDate } from '../../helpers/functions';
import { dateFormat } from '../../helpers/constants';
import { IForum } from '../../../../Reducers/reducers';
import { useContext, useCurrentUser } from '../../../../Hooks'

interface IForumsItem {
    forum: IForum
    editForum: (forum: IForum) => void
}

const ForumsItem: React.FC<IForumsItem> = ({ forum, editForum }) => {
    const context: WebPartContext = useContext()
    const user = useCurrentUser()

    return (
        <>
            <div className="ms-Grid-col ms-sm5">
                <Link to={`/topics/${forum.Id}`}>{forum.Title}</Link>
                <div>{forum.Description}</div>
            </div>
            <div className="ms-Grid-col ms-sm2">
                <div>
                    {strings.Topics}:{' '}
                    <Link to={`/topics/${forum.Id}`}>{forum.Topics}</Link>
                </div>
                <div>
                    {strings.Posts}:{' '}
                    <Link to={`/topics/${forum.Id}`}>{forum.Posts}</Link>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm4">
                {forum.LastTopic && <Link to={`/posts/${forum.Id}/${forum.LastTopicId}`}>{forum.LastTopic}</Link>}
                {forum.LastPosterName && <div>{strings.By} {forum.LastPosterName} </div>}
                {forum.LastUpdate > 0 &&
                    <div>
                        <Moment locale={localeForDate(context)} format={dateFormat}>
                            {forum.LastUpdate}
                        </Moment>
                    </div>
                }
            </div>
            <div className="ms-Grid-col ms-sm1">
                {
                    user && user.IsSiteAdmin &&
                    <Icon
                        iconName='Edit'
                        className={styles.icon}
                        title={strings.EditForum}
                        onClick={() => editForum(forum)}
                    />
                }
            </div>
        </>
    )
}

export default ForumsItem