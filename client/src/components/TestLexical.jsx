
import CustomEditor from './tools/lexical-2/Editor';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import theme from './tools/lexical-2/theme';

const TestLexical = () => {


    const editorConfig = {
        // The editor theme
        theme,
        // Handling of errors during update
        onError(error) {
            throw error;
        },
        // Any custom nodes go here
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode
        ]
    };


    return (
        <div>
            <LexicalComposer initialConfig={editorConfig}>

                <CustomEditor />
            </LexicalComposer>

        </div>
    );
};

export default TestLexical;