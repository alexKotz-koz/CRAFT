import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const QuillEditor = ({ editorState, onChange }) => {
    const modules = {
        toolbar: {
            container: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
             
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                //[{ 'list': 'ordered' }, { 'list': 'bullet' },
                //{ 'indent': '-1' }, { 'indent': '+1' }],
                //['link', 'image'],
                [{ 'align': [] }],
            ]
        }
    };

    const formats = [
        'header', 
        'font',
        'bold', 
        'italic',
        'underline', 
        'strike', 
        'blockquote',
        //'list', 
        //'bullet', 
        //'indent',
        //'link', 
        //'image', 
        'align'
    ];

    const handleOnChange = (content) => {
        onChange(content);
    };



    return (
        <div>
            <ReactQuill
                value={editorState}
                onChange={handleOnChange}
                modules={modules}
                formats={formats}
                theme="snow"
            />
        </div>
    );
};

export default QuillEditor;