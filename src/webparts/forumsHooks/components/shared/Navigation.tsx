import * as React from 'react'
import { Link } from "react-router-dom";
//import * as strings from 'ForumsHooksWebPartStrings';
import { BrowserRouter } from "react-router-dom";

export interface INavigationProp {
    forumName: string
    forumId?: number
    topicName?: string
}

const Navigation: React.FC<INavigationProp> = ({ forumName, forumId, topicName }) => {

    const forumLink = () =>
        <BrowserRouter id="forumsLink">
            <Link
                to={{
                    pathname: "/",
                    state: true
                }}>
                {'Forums'}
            </Link> {'->'}
        </BrowserRouter>

    return (
        <div style={{ marginBottom: '5px' }}>
            {
                (!forumId && !topicName) &&
                <>
                    {forumLink()} {forumName}
                </>
            }
            {
                forumId && topicName &&
                <BrowserRouter>
                    {forumLink()}
                    <Link
                        to={{
                            pathname: `/topics/${forumId}`,
                            state: true
                        }}>
                        {forumName}
                    </Link> {'->'}{topicName}
                </BrowserRouter>
            }
        </div>
    )
}

export default Navigation