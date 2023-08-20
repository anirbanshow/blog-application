import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../UserContext';

const PostPage = () => {

    const [postInfo, setPostInfo] = useState('');
    const { id } = useParams();
    const { userInfo } = useContext(UserContext);

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`).then((response) => {
            response.json().then((postInfo) => {
                setPostInfo(postInfo);
            });
        });
    }, []);

    return (
        <div className='post-page'>

            <h1>{postInfo.title}</h1>
            <p className="author">{postInfo?.author?.username}</p>

            {userInfo?.id === postInfo?.author?._id && (
                <div>
                    <Link to={`/edit/${postInfo?._id}`}>Edit</Link>
                </div>
            )}

            <time>{postInfo.createdAt}</time>

            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
            </div>

            <div dangerouslySetInnerHTML={{ __html: postInfo.content }} />
        </div>
    )
}

export default PostPage;