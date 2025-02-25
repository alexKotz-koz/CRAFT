import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import QuillTableBetter from 'quill-table-better';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';

Quill.register({
  'modules/table-better': QuillTableBetter
}, true);

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['table-better']
];

const options = {
  theme: 'snow',
  modules: {
    table: false,
    toolbar: toolbarOptions,
    'table-better': {
      language: 'en_US',
      menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
      toolbarTable: true
    },
    keyboard: {
      bindings: QuillTableBetter.keyboardBindings
    }
  }
};

const QuillEditor = () => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      new Quill(quillRef.current, options);
    }
  }, []);

  return (
    <div>
      <div ref={quillRef} />
    </div>
  );
};

export default QuillEditor;