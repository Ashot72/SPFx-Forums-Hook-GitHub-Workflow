import { useState, useCallback } from "react"
import { sp, IItemAddResult } from "@pnp/sp/presets/all";

import { IForum, ITopic } from '../Reducers/reducers';
import { IPost } from '../Reducers/postReducer';
import { fh_topics, fh_posts, fh_forums } from '../webparts/forumsHooks/helpers/constants';

const cache = {}

const updateCache = (title: string, id: number, item: any) => {
    if (cache[title]) {
        const cachedItem = cache[title].find(c => c.Id === id)
        if (cachedItem) {
            cache[title] = cache[title].map(i => i.Id === item.Id ? { ...i, ...item } : i)
        }
    }
}

const deleteFromCache = (title: string, id: number) => {
    if (cache[title]) {
        const cachedItem = cache[title].find(c => c.Id === id)
        if (cachedItem) {
            cache[title] = cache[title].filter(i => i.Id !== id)
        }
    }
}

export const useListsService = (title: string, cached = false) => {
    const [data, setData] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    const getListItems = useCallback((localTitle?: string, filter?: string, limit?: number) => {
        setLoading(true)

        const theTitle = localTitle || title
        let query = sp.web.lists.getByTitle(title || localTitle).items

        if (filter) query.filter(filter)
        query.top(limit || 5000)

        if (cached && cache[theTitle]) {
            const items = cache[theTitle]
            setData(items)
            setLoading(false)
        } else {
            query.get()
                .then(items => {
                    cache[theTitle] = items
                    setData(items)
                    setLoading(false)
                })
                .catch(e => {
                    setError(e)
                    setLoading(false)
                })
        }
    }, [cached])

    const getlistItem = useCallback((itemId: number) => {
        setLoading(true)

        sp.web.lists.getByTitle(title).items.getById(itemId).get()
            .then(item => {
                setData([item])
                setLoading(false)
            })
            .catch(e => {
                setError(e)
                setLoading(false)
            })
    }, [])

    const addListItem = item => {
        setLoading(true)

        sp.web.lists.getByTitle(title).items.add(item)
            .then(() => getListItems())
            .catch(e => {
                setError(e)
                setLoading(false)
            })
    }

    const updateListItem = useCallback(item => {
        setLoading(true)

        sp.web.lists.getByTitle(title).items.getById(item.Id).update(item)
            .then(() => {
                updateCache(title, item.Id, item)
                setLoading(false)
            })
            .catch(e => {
                setError(e)
                setLoading(false)
            })
    }, [])

    const addTopic = (topic: ITopic, post: Partial<IPost>) => {
        setLoading(true)

        const lists = sp.web.lists
        const topicFilter = `ForumId eq ${topic.ForumId} and ExpirationDate ge ${new Date().getTime()}`

        const updateForumLastInfo = (p: Partial<IPost> = {}, topics: number = 0, posts: number = 0) => {
            const forum: Partial<IForum> =
            {
                LastTopic: p.Title || '',
                LastForumId: p.ForumId || 0,
                LastTopicId: p.TopicId || 0,
                LastPosterName: p.PosterName || '',
                LastPosterEmail: p.PosterEmail || '',
                LastUpdate: p.CreatedDate || 0,
                Topics: topics,
                Posts: posts
            }

            return lists.getByTitle(fh_forums).items.getById(post.ForumId).update(forum)
                .then(() => {
                    updateCache(fh_forums, topic.ForumId, forum)
                    setLoading(false)
                    getListItems(fh_topics, topicFilter)
                })
        }

        lists.getByTitle(fh_topics).items.add(topic)
            .then((res: IItemAddResult) => {
                post.TopicId = res.data.Id;
                return lists.getByTitle(fh_posts).items.add(post)
                    .then(() => lists.getByTitle(fh_topics).items.filter(topicFilter).get()
                        .then(topics => {
                            const topicsPosts = []

                            let batch = sp.web.createBatch()
                            topics.forEach(t =>
                                lists.getByTitle(fh_posts).items.filter(`TopicId eq ${t.Id}`).inBatch(batch).get()
                                    .then(posts => topicsPosts.push(...posts))
                            );

                            return batch.execute()
                                .then(() => {
                                    const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                                    const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)

                                    if (forumPosts.length > 0) {
                                        const lastPost = forumPosts[forumPosts.length - 1]
                                        return updateForumLastInfo(lastPost, forumTopics.length, forumPosts.length)
                                    }
                                    else {
                                        return updateForumLastInfo()
                                    }
                                })
                        }))
            })
            .catch(e => {
                setError(e)
                setLoading(false)
            })
    }

    const addPost = (post: Partial<IPost>, filter: string, limit: number) => {
        setLoading(true)

        const lists = sp.web.lists
        const topicFilter = `ForumId eq ${post.ForumId} and ExpirationDate ge ${new Date().getTime()}`

        lists.getByTitle(fh_posts).items.add(post)
            .then(() => lists.getByTitle(fh_topics).items.filter(topicFilter).get()
                .then(topics => {
                    const topicsPosts = []

                    let batch = sp.web.createBatch()
                    topics.forEach(topic =>
                        lists.getByTitle(fh_posts).items.filter(`TopicId eq ${topic.Id}`).inBatch(batch).get()
                            .then(posts => topicsPosts.push(...posts))
                    );

                    return batch.execute()
                        .then(() => {
                            batch = sp.web.createBatch()

                            const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                            const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)
                            const topicPosts = topicsPosts.filter(p => p.TopicId === post.TopicId)

                            const topic: Partial<ITopic> = {
                                Replies: topicPosts.length - 1,
                                LastPosterName: post.PosterName,
                                LastPosterEmail: post.PosterEmail,
                                LastUpdate: post.CreatedDate
                            }

                            lists.getByTitle(fh_topics).items.getById(post.TopicId).inBatch(batch).update(topic)

                            const forum: Partial<IForum> = {
                                LastTopic: post.Title,
                                LastForumId: post.ForumId,
                                LastTopicId: post.TopicId,
                                LastPosterName: post.PosterName,
                                LastPosterEmail: post.PosterEmail,
                                LastUpdate: post.CreatedDate,
                                Topics: forumTopics.length,
                                Posts: forumPosts.length
                            }

                            lists.getByTitle(fh_forums).items.getById(post.ForumId).inBatch(batch).update(forum)

                            return batch.execute()
                                .then(() => {
                                    updateCache(fh_forums, post.ForumId, forum)
                                    updateCache(fh_topics, post.TopicId, topic)
                                    getListItems(fh_posts, filter, limit)
                                })
                        })
                })
            ).catch(e => {
                setError(e)
                setLoading(false)
            })
    }

    const deleteForum = (forumId: number) => {
        setLoading(true)
        const lists = sp.web.lists

        const addError = e => {
            setError(e)
            setLoading(false)
        }

        lists.getByTitle(fh_topics).items.filter(`ForumId eq ${forumId}`).get()
            .then(topics => {
                let batch = sp.web.createBatch()
                topics.forEach(topic => {
                    lists.getByTitle(fh_topics).items.getById(topic.Id).inBatch(batch).delete()
                });
                batch.execute()
                    .catch(e => addError(e))
            })

        lists.getByTitle(fh_posts).items.filter(`ForumId eq ${forumId}`).get()
            .then(posts => {
                let batch = sp.web.createBatch()
                posts.forEach(post => {
                    lists.getByTitle(fh_posts).items.getById(post.Id).inBatch(batch).delete()
                });
                batch.execute()
                    .catch(e => addError(e))
            })

        lists.getByTitle(fh_forums).items.getById(forumId).delete()
            .then(() => {
                deleteFromCache(fh_forums, forumId)
                setLoading(false)
            })
            .catch(e => addError(e))
    }

    const deleteTopic = (topic: Partial<ITopic>) => {
        setLoading(true)
        const lists = sp.web.lists

        const updateForumLastInfo = (post: Partial<IPost> = {}, topics: number = 0, posts: number = 0) => {
            const forum: Partial<IForum> = {
                LastTopic: post.Title || '',
                LastForumId: post.ForumId || 0,
                LastTopicId: post.TopicId || 0,
                LastPosterName: post.PosterName || '',
                LastPosterEmail: post.PosterEmail || '',
                LastUpdate: post.CreatedDate || 0,
                Topics: topics,
                Posts: posts
            }

            return lists.getByTitle(fh_forums).items.getById(topic.ForumId).update(forum)
                .then(() => {
                    updateCache(fh_forums, topic.ForumId, forum)
                    deleteFromCache(fh_topics, topic.Id)
                    setLoading(false)
                })
        }

        const topicFilter = `ForumId eq ${topic.ForumId} and ExpirationDate ge ${new Date().getTime()}`

        lists.getByTitle(fh_posts).items.filter(`TopicId eq ${topic.Id}`).get()
            .then(posts => {
                let batch = sp.web.createBatch()
                posts.forEach(post => {
                    lists.getByTitle(fh_posts).items.getById(post.Id).inBatch(batch).delete()
                });
                batch.execute()
                    .then(() => lists.getByTitle(fh_topics).items.getById(topic.Id).delete()
                        .then(() => lists.getByTitle(fh_topics).items.filter(topicFilter).get()
                            .then(topics => {
                                const topicsPosts = []

                                batch = sp.web.createBatch()
                                topics.forEach(t =>
                                    lists.getByTitle(fh_posts).items.filter(`TopicId eq ${t.Id}`).inBatch(batch).get()
                                        .then(p => {
                                            topicsPosts.push(...p)
                                        })
                                );

                                return batch.execute()
                                    .then(() => {
                                        const forumTopics = topics.filter(t => t.ForumId === topic.ForumId)
                                        const forumPosts = topicsPosts.filter(p => p.ForumId === topic.ForumId)

                                        if (forumPosts.length > 0) {
                                            const lastPost = forumPosts.slice(-1).pop()
                                            return updateForumLastInfo(lastPost, forumTopics.length, forumPosts.length)

                                        } else {
                                            return updateForumLastInfo()
                                        }
                                    })
                            })
                        )
                    )
                    .catch(e => {
                        setError(e)
                        setLoading(false)
                    })
            })
    }

    const deletePost = (post: IPost) => {
        setLoading(true)
        const lists = sp.web.lists

        const updateLastInfo = (forumInfo, topicInfo) => {
            const { post: p, topics, posts } = forumInfo
            const { topic, replies } = topicInfo

            let batch = sp.web.createBatch()

            const forum: Partial<IForum> = {
                LastTopic: p.Title || '',
                LastForumId: p.ForumId || 0,
                LastTopicId: p.TopicId || 0,
                LastPosterName: p.PosterName || '',
                LastPosterEmail: p.PosterEmail || '',
                LastUpdate: p.CreatedDate || 0,
                Topics: topics,
                Posts: posts
            }

            const t: Partial<ITopic> = {
                Replies: replies,
                LastPosterName: topic.PosterName,
                LastPosterEmail: topic.PosterEmail,
                LastUpdate: topic.CreatedDate
            }

            lists.getByTitle(fh_forums).items.getById(post.ForumId).inBatch(batch).update(forum)
            lists.getByTitle(fh_topics).items.getById(post.TopicId).inBatch(batch).update(t)

            return batch.execute()
                .then(() => {
                    updateCache(fh_forums, post.ForumId, forum)
                    updateCache(fh_topics, post.TopicId, topic)
                    deleteFromCache(fh_posts, post.Id)
                    setLoading(false)
                })
        }

        const topicFilter = `ForumId eq ${post.ForumId} and ExpirationDate ge ${new Date().getTime()}`

        lists.getByTitle(fh_posts).items.getById(post.Id).delete()
            .then(() => lists.getByTitle(fh_topics).items.filter(topicFilter).get()
                .then(topics => {
                    const topicsPosts = []

                    let batch = sp.web.createBatch()
                    topics.forEach(t =>
                        lists.getByTitle(fh_posts).items.filter(`TopicId eq ${t.Id}`).inBatch(batch).get()
                            .then(p => {
                                topicsPosts.push(...p)
                            })
                    );

                    return batch.execute()
                        .then(() => {
                            const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                            const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)
                            const topicPosts = topicsPosts.filter(p => p.TopicId === post.TopicId)

                            const lastPost = forumPosts.length > 0 ? forumPosts.slice(-1).pop() : {}
                            const lastTopic = topicPosts.length > 0 ? topicPosts.slice(-1).pop() : {}

                            const forumInfo = { post: lastPost, topics: forumTopics.length, posts: forumPosts.length }
                            const topicInfo = { topic: lastTopic, replies: topicPosts.length - 1 }

                            return updateLastInfo(forumInfo, topicInfo)
                        })
                })
            )
    }

    return {
        data,
        loading,
        error,
        getListItems,
        getlistItem,
        addListItem,
        addTopic,
        addPost,
        updateListItem,
        deleteForum,
        deleteTopic,
        deletePost,
    }
}
