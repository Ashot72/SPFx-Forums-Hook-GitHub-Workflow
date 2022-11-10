import * as React from 'react'
import { useEffect, useState } from 'react';
import { Link, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as strings from 'ForumsHooksWebPartStrings';

import styles from './Forums.module.scss'
import { fh_forums, Actions } from '../../helpers/constants';
import { getDetailError } from '../../helpers/functions';
import Forums from './Forums';
import SidePanel from '../shared/SidePanel';
import ForumsForm from './ForumsForm';
import { IForum } from '../../../../Reducers/reducers';
import { useListsService, useDispatch, useFormState, useCurrentUser, useFormData, useLinkState } from '../../../../Hooks'

interface IForumsView {
    location: any
}

const ForumsView: React.FC<IForumsView> = ({ location: { state } }) => {
    const [isOpen, setIsOpen] = useState(false)
    const linkState = useLinkState(isOpen, state)

    const dispatch = useDispatch()
    const user = useCurrentUser()

    const data = { title: '', description: '' }
    const formData = useFormData(isOpen, data)
    const formState = useFormState(formData)

    const { data: forums, loading, error, getListItems, addListItem, updateListItem, deleteForum } =
        useListsService(fh_forums, linkState)

    useEffect(getListItems, [getListItems])

    useEffect(() =>
        dispatch({ type: 'LOAD_FORUMS', payload: forums }),
        [forums, dispatch])

    const handleSubmit = () => {
        const { title, description } = formState.state

        const forum: Partial<IForum> = {
            Title: title,
            Description: description,
            Topics: 0,
            Posts: 0,
            CreatedDate: new Date().getTime()
        }

        addListItem(forum)
        setIsOpen(false)
    }

    if (error) {
        return <div className={styles.error}>{getDetailError(error)}</div>
    }

    return (
        <div className={styles.forums} id="forumsView">
            {loading && <Spinner size={SpinnerSize.large} label={strings.Wait} />}
            {
                user && user.IsSiteAdmin &&
                <>
                    <Link onClick={() => setIsOpen(true)}>{strings.NewForum}</Link><br />
                </>
            }
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <ForumsForm
                    action={Actions.AddOrReply}
                    formState={formState}
                    handleSubmit={handleSubmit}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
            <Forums
                updateListItem={updateListItem}
                deleteForum={deleteForum}
            />
        </div>
    )
}

export default ForumsView