import React, { useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import CustomTableOption from './CustomTableOption';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const DraftEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const getContentAsHTML = () => {
        return draftToHtml(convertToRaw(editorState.getCurrentContent()));
    };

    return (
        <div>
            <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                    options: ['inline', 'textAlign'],
                    inline: { options: ['bold', 'italic', 'underline'] },
                    textAlign: { options: ['left', 'center', 'right', 'justify'] }
                  }}   
            />
            <textarea
                disabled
                value={getContentAsHTML()}
            />
        </div>
    );
};

export default DraftEditor;