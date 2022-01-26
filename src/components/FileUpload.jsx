import React from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";

export const FileUpload = ({ onChange, directories = false }) => {
    if (!directories) {
        return (
            <label className='file-upload__label'>
                <AiOutlineCloudUpload /> <span>Local</span> <span>Notes</span>
                <input className='file-upload__input' type='file' multiple onChange={(e) => onChange?.(e)} />
            </label>
        );
    }
    return (
        <label className='file-upload__label'>
            <AiOutlineCloudUpload /> <span>Local</span> <span>Notes</span>
            <input
                className='file-upload__input'
                type='file'
                webkitdirectory='true'
                mozdirectory='true'
                directory='true'
                multiple
                onChange={(e) => onChange?.(e)}
            />
        </label>
    );
};
