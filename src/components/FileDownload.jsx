import React from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";

export const FileDownload = ({ onChange }) => {
    return (
        <button className='file-upload__label' onChange={() => onChange?.()}>
            <AiOutlineCloudDownload /> <span>Drive</span> <span>Notes</span>
        </button>
    );
};
