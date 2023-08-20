import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

const EditPost = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then((response) => {
                response.json().then((postInfo) => {
                    setTitle(postInfo?.title);
                    setSummary(postInfo?.summary);
                    setContent(postInfo?.content);
                });
            });
    }, []);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('id', id);
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        if (files[0]) {
            data.set('file', files[0]);
        }

        const response = await fetch('http://localhost:4000/post', {
            method: 'PUT',
            body: data,
            credentials: 'include'
        });

        if (response.ok) {
            navigate('/');
        }
    }

    return (
        <form onSubmit={updatePost}>
            <input type="text" placeholder='title' value={title} onChange={ev => setTitle(ev.target.value)} />
            <input type="text" placeholder='Summary' value={summary} onChange={ev => setSummary(ev.target.value)} />
            <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
            <ReactQuill theme="snow" value={content} modules={modules} formats={formats} onChange={newValue => setContent(newValue)} />
            <button style={{ marginTop: '5px' }}>Update Post</button>
        </form>
    )
}

export default EditPost