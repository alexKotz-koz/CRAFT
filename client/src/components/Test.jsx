import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const Test = () => {

    const [editorHtml, setEditorHtml] = useState('');
    console.log(editorHtml)
    const handleChange = (html) => {
        setEditorHtml(html);
    };
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'align': [] }],
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'align'
    ];

    return (
        <div>
            <ReactQuill
                value={editorHtml}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                theme="snow"
            />
        </div>
    );
};

export default Test;