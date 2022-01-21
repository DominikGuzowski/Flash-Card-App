import React from "react";
import { CgSmileMouthOpen, CgSmile, CgSmileNeutral, CgSmileSad } from "react-icons/cg";
import { MdRefresh } from "react-icons/md";

export const DifficultyRating = ({ onClick, disabled = false }) => {
    return (
        <div className='difficulty-rating__container'>
            <div className='difficulty-rating'>
                <button
                    className='difficulty-rating__button difficulty-rating--easiest'
                    disabled={disabled}
                    onClick={() => {
                        onClick?.(1);
                    }}>
                    <CgSmileMouthOpen />
                </button>
                <button
                    className='difficulty-rating__button difficulty-rating--easy'
                    disabled={disabled}
                    onClick={() => {
                        onClick?.(2);
                    }}>
                    <CgSmile />
                </button>
                <button
                    className='difficulty-rating__button difficulty-rating--medium'
                    disabled={disabled}
                    onClick={() => {
                        onClick?.(3);
                    }}>
                    <CgSmileNeutral />
                </button>
                <button
                    className='difficulty-rating__button difficulty-rating--hard'
                    disabled={disabled}
                    onClick={() => {
                        onClick?.(4);
                    }}>
                    <CgSmileSad />
                </button>
                <button
                    className='difficulty-rating__button difficulty-rating--again'
                    disabled={disabled}
                    onClick={() => {
                        onClick?.(5);
                    }}>
                    <MdRefresh />
                </button>
            </div>
        </div>
    );
};
