import React, { useRef, useState } from 'react';
import { BsTypeBold, BsTypeItalic, BsTypeUnderline, BsJustifyLeft, BsJustify, BsJustifyRight, BsLink, BsImage, BsTable } from 'react-icons/bs';
import './CustomRTE.css';

const CustomRTE = () => {
    const editorRef = useRef(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleLink = () => {
        const url = prompt('Enter the URL');
        if (url) {
            formatText('createLink', url);
        }
    };

    const handleImage = () => {
        const url = prompt('Enter the image URL');
        if (url) {
            formatText('insertImage', url);
        }
    };

    const handleTable = () => {
        const rows = prompt('Enter number of rows');
        const cols = prompt('Enter number of columns');
        if (rows && cols) {
            let table = '<table border="1">';
            for (let i = 0; i < rows; i++) {
                table += '<tr>';
                for (let j = 0; j < cols; j++) {
                    table += '<td>&nbsp;</td>';
                }
                table += '</tr>';
            }
            table += '</table>';
            formatText('insertHTML', table);
        }
    };

    return (
        <div className="custom-rte">
            <div className="toolbar">
                <button onClick={() => formatText('bold')}><BsTypeBold /></button>
                <button onClick={() => formatText('italic')}><BsTypeItalic /></button>
                <button onClick={() => formatText('underline')}><BsTypeUnderline /></button>
                <button onClick={() => formatText('justifyLeft')}><BsJustifyLeft /></button>
                <button onClick={() => formatText('justifyCenter')}><BsJustify /></button>
                <button onClick={() => formatText('justifyRight')}><BsJustifyRight /></button>
                <button onClick={handleLink}><BsLink /></button>
                <button onClick={handleImage}><BsImage /></button>
                <button onClick={handleTable}><BsTable /></button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                className="editor"
                onInput={() => {
                    setIsBold(document.queryCommandState('bold'));
                    setIsItalic(document.queryCommandState('italic'));
                    setIsUnderline(document.queryCommandState('underline'));
                }}
            ></div>
        </div>
    );
};

export default CustomRTE;