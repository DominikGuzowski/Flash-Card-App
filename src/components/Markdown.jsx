import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export const Markdown = ({ markdown }) => {
    return <ReactMarkdown children={markdown} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />;
};
